import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Client, envs } from 'stytch';

const discourseSecret = process.env.DISCOURSE_SSO_SECRET;
const discourseReturnBase = process.env.DISCOURSE_BASE_URL;
const stytchProjectId = process.env.STYTCH_PROJECT_ID;
const stytchSecret = process.env.STYTCH_SECRET;
const stytchEnv = process.env.STYTCH_PROJECT_ENV === 'live' ? envs.live : envs.test;

const stytchClient =
  stytchProjectId && stytchSecret
    ? new Client({
        project_id: stytchProjectId,
        secret: stytchSecret,
        env: stytchEnv
      })
    : null;

function computeSignature(payload: string) {
  if (!discourseSecret) {
    throw new Error('Discourse SSO secret is not configured');
  }

  return crypto.createHmac('sha256', discourseSecret).update(payload).digest('hex');
}

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(received, 'hex');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function sanitizeUsername(username: string) {
  const clean = username.replace(/[^a-zA-Z0-9_.-]/g, '_');

  if (clean.length) {
    return clean;
  }

  const randomSegment = crypto.randomBytes(4).toString('hex');
  return `user_${randomSegment}`;
}

function buildRedirectUrl(
  nonce: string,
  returnUrl: string,
  email: string,
  externalId: string,
  username?: string,
  fullName?: string
) {
  const outgoing = new URLSearchParams();
  outgoing.set('nonce', nonce);
  outgoing.set('email', email);
  outgoing.set('external_id', externalId);

  if (username) {
    outgoing.set('username', sanitizeUsername(username));
  }

  if (fullName) {
    outgoing.set('name', fullName);
  }

  const encodedPayload = Buffer.from(outgoing.toString()).toString('base64');
  const signature = computeSignature(encodedPayload);

  return `${returnUrl}?sso=${encodeURIComponent(encodedPayload)}&sig=${signature}`;
}

function validateReturnUrl(returnUrl: string | null) {
  if (!returnUrl) {
    return null;
  }

  if (!discourseReturnBase) {
    return returnUrl;
  }

  try {
    const parsed = new URL(returnUrl);
    const allowedBase = new URL(discourseReturnBase);

    if (parsed.origin !== allowedBase.origin) {
      console.warn(
        'Rejecting Discourse SSO return URL from unexpected origin',
        parsed.origin
      );
      return null;
    }

    return parsed.toString();
  } catch (error) {
    console.warn('Received invalid Discourse return URL', error);
    return null;
  }
}

function pickVerifiedEmail(user: NonNullable<Awaited<ReturnType<typeof authenticateWithStytch>>['user']>) {
  const verifiedEmails =
    user.email_addresses?.filter((address) => address.verified)?.map((e) => e.email_address) ||
    [];

  if (verifiedEmails.length > 0) {
    return verifiedEmails[0];
  }

  return (
    (user.emails && user.emails.find((email) => email.email_verified)?.email) ||
    user.email_addresses?.[0]?.email_address ||
    null
  );
}

async function authenticateWithStytch(request: NextRequest) {
  if (!stytchClient) {
    throw new Error('Stytch server client is not configured');
  }

  const sessionToken = request.cookies.get('stytch_session')?.value;
  const sessionJwt = request.cookies.get('stytch_session_jwt')?.value;

  if (!sessionToken && !sessionJwt) {
    return null;
  }

  try {
    return await stytchClient.sessions.authenticate({
      session_token: sessionToken,
      session_jwt: sessionJwt
    });
  } catch (error) {
    console.error('Failed to authenticate Stytch session for Discourse SSO', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (!discourseSecret) {
    return NextResponse.json(
      { message: 'Discourse SSO is not configured' },
      { status: 500 }
    );
  }

  const sso = request.nextUrl.searchParams.get('sso');
  const sig = request.nextUrl.searchParams.get('sig');

  if (!sso || !sig) {
    return NextResponse.json(
      { message: 'Missing Discourse SSO parameters' },
      { status: 400 }
    );
  }

  const computedSignature = computeSignature(sso);

  if (!signaturesMatch(computedSignature, sig)) {
    return NextResponse.json(
      { message: 'Invalid Discourse SSO signature' },
      { status: 400 }
    );
  }

  let payload: URLSearchParams;

  try {
    const rawPayload = Buffer.from(sso, 'base64').toString('utf8');
    payload = new URLSearchParams(rawPayload);
  } catch (error) {
    console.error('Failed to decode Discourse SSO payload', error);
    return NextResponse.json(
      { message: 'Could not decode SSO payload' },
      { status: 400 }
    );
  }

  const nonce = payload.get('nonce');
  const returnSsoUrl = validateReturnUrl(
    payload.get('return_sso_url') || process.env.DISCOURSE_SSO_RETURN_URL
  );

  if (!nonce || !returnSsoUrl) {
    return NextResponse.json(
      { message: 'Missing required SSO values' },
      { status: 400 }
    );
  }

  const authResult = await authenticateWithStytch(request);

  if (!authResult) {
    const redirectBack = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const redirectUrl = new URL('/auth', request.nextUrl.origin);
    redirectUrl.searchParams.set('redirect', encodeURIComponent(redirectBack));

    return NextResponse.redirect(redirectUrl);
  }

  const user = authResult.user;

  const primaryEmail = pickVerifiedEmail(user);

  if (!primaryEmail) {
    return NextResponse.json(
      { message: 'Authenticated user is missing an email address' },
      { status: 400 }
    );
  }

  const usernameCandidate =
    user.username || primaryEmail.split('@')[0] || user.user_id;
  const fullName =
    user.name?.first_name || user.name?.last_name
      ? [user.name?.first_name, user.name?.middle_name, user.name?.last_name]
          .filter(Boolean)
          .join(' ')
      : undefined;

  const redirectUrl = buildRedirectUrl(
    nonce,
    returnSsoUrl,
    primaryEmail,
    user.user_id,
    usernameCandidate,
    fullName
  );

  return NextResponse.redirect(redirectUrl);
}
