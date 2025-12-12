import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getStytchClient } from '@/lib/server/stytch';
import { User } from 'stytch';

// this is required to bypass all Next.js caches
export const dynamic = 'force-dynamic';

// Constant-time comparison for hex HMAC strings to avoid timing leaks
function timingSafeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a, 'hex');
  const bBuffer = Buffer.from(b, 'hex');

  if (aBuffer.length !== bBuffer.length) return false;

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

// Redirect unauthenticated users to login while preserving where they came from
function buildLoginRedirect(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();

  // force host/protocol to the configured public web URL
  const base = new URL(process.env.NEXT_PUBLIC_WEB_URL ?? '');
  loginUrl.protocol = base.protocol;
  loginUrl.hostname = base.hostname;
  loginUrl.port = ''; // strip any explicit port to keep redirects on the public origin

  loginUrl.pathname = '/auth';
  loginUrl.search = '';
  loginUrl.searchParams.set(
    'next',
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  return NextResponse.redirect(loginUrl);
}

// Ensure the Discourse return URL matches the configured host (mitigates open redirect)
function validateReturnUrl(rawUrl: string) {
  const expectedBase = process.env.DISCOURSE_RETURN_BASE_URL;
  const parsedUrl = new URL(rawUrl);

  if (expectedBase) {
    const allowedHost = new URL(expectedBase);
    if (parsedUrl.host !== allowedHost.host) {
      throw new Error(
        'Return URL host does not match configured Discourse host.'
      );
    }
  }

  return parsedUrl;
}

// Verify the incoming Discourse SSO payload signature
function verifyIncomingSignature(payload: string, signature: string) {
  const secret = process.env.DISCOURSE_CONNECT_SECRET;

  if (!secret) {
    throw new Error('DISCOURSE_CONNECT_SECRET is not configured.');
  }

  const computedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const isValid = timingSafeEqual(computedSig, signature);

  if (!isValid) {
    throw new Error('Invalid DiscourseConnect signature.');
  }
}

// Sign the outgoing payload we will send back to Discourse
function signOutgoingPayload(payload: string) {
  const secret = process.env.DISCOURSE_CONNECT_SECRET;

  if (!secret) {
    throw new Error('DISCOURSE_CONNECT_SECRET is not configured.');
  }

  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Encode URLSearchParams to base64 for Discourse
function buildOutgoingPayload(params: URLSearchParams) {
  return Buffer.from(params.toString()).toString('base64');
}

// Validate Stytch session cookies with Stytch to obtain the user record
async function authenticateCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('stytch_session')?.value;
  const sessionJwt = cookieStore.get('stytch_session_jwt')?.value;

  if (!sessionToken && !sessionJwt) {
    return null;
  }

  const stytchClient = getStytchClient();

  const response = await stytchClient.sessions.authenticate({
    session_token: sessionToken,
    session_jwt: sessionJwt
  });

  return response.user;
}

// Prefer a verified email; fall back to the first available
function pickEmail(user: User) {
  if (!user.emails || user.emails.length === 0) {
    return;
  }

  const verified = user.emails.find((email) => email.verified);
  return verified ?? user.emails[0];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const payload = searchParams.get('sso');
  const signature = searchParams.get('sig');

  // Discourse must supply both the base64 payload and the HMAC
  if (!payload || !signature) {
    return NextResponse.json(
      { error: 'Missing DiscourseConnect parameters.' },
      { status: 400 }
    );
  }

  // Reject tampered payloads before doing any other work
  try {
    verifyIncomingSignature(payload, signature);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid signature' },
      { status: 400 }
    );
  }

  const decodedPayload = Buffer.from(payload, 'base64').toString('utf8');
  const incomingParams = new URLSearchParams(decodedPayload);
  const nonce = incomingParams.get('nonce');
  const returnUrl = incomingParams.get('return_sso_url');

  // The nonce links our response to Discourse' request; the return URL is where we will redirect
  if (!nonce || !returnUrl) {
    return NextResponse.json(
      { error: 'Invalid DiscourseConnect payload.' },
      { status: 400 }
    );
  }

  // Guard against open redirects or rogue hosts
  let discourseReturnUrl: URL;
  try {
    discourseReturnUrl = validateReturnUrl(returnUrl);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid return URL.' },
      { status: 400 }
    );
  }

  let user;
  try {
    user = await authenticateCurrentUser();
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Authentication failed.'
      },
      { status: 500 }
    );
  }

  // Redirect to login if not authenticated
  if (!user) return buildLoginRedirect(request);

  // Pick the best email to pass to Discourse
  const emailRecord = pickEmail(user);

  if (!emailRecord) {
    return NextResponse.json(
      { error: 'Authenticated user has no email address.' },
      { status: 400 }
    );
  }

  // Build the payload Discourse expects, mirroring required fields from the logged-in user
  const outgoingParams = new URLSearchParams({
    nonce,
    external_id: user.user_id,
    email: emailRecord.email
  });

  if (!emailRecord.verified) {
    outgoingParams.set('require_activation', 'true');
  }

  if (user.name?.first_name || user.name?.last_name) {
    outgoingParams.set(
      'name',
      [user.name?.first_name, user.name?.last_name].filter(Boolean).join(' ')
    );
  }

  // Encode + sign our response and bounce back to Discourse
  const encodedPayload = buildOutgoingPayload(outgoingParams);
  const outgoingSignature = signOutgoingPayload(encodedPayload);

  discourseReturnUrl.searchParams.set('sso', encodedPayload);
  discourseReturnUrl.searchParams.set('sig', outgoingSignature);

  return NextResponse.redirect(discourseReturnUrl.toString());
}
