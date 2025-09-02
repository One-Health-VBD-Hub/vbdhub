/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion */
import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Client, envs } from 'stytch';
import { createHmac } from 'crypto';

@Controller('discourse')
export class DiscourseController {
  private stytchClient: Client;
  private discourseSecret: string;
  private webOrigin: string;

  constructor(private readonly config: ConfigService) {
    this.stytchClient = new Client({
      project_id: this.config.get<string>('STYTCH_PROJECT_ID') || '',
      secret: this.config.get<string>('STYTCH_SECRET') || '',
      env:
        this.config.get<string>('STYTCH_ENV') === 'live' ? envs.live : envs.test
    });
    this.discourseSecret =
      this.config.get<string>('DISCOURSE_SSO_SECRET') || '';
    this.webOrigin = this.config.get<string>('WEB_ORIGIN') || '';
  }

  @Get('sso')
  async sso(
    @Query('sso') sso: string,
    @Query('sig') sig: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    if (!sso || !sig) {
      return res.status(400).send('Missing sso or sig parameter');
    }

    const expectedSig = createHmac('sha256', this.discourseSecret)
      .update(sso)
      .digest('hex');

    if (expectedSig !== sig) {
      return res.status(400).send('Invalid signature');
    }

    const decoded = Buffer.from(sso, 'base64').toString('utf8');
    const params = new URLSearchParams(decoded);
    const nonce = params.get('nonce');
    const returnUrl = params.get('return_sso_url');

    if (!nonce || !returnUrl) {
      return res.status(400).send('Invalid payload');
    }

    const cookies = req.cookies as Record<string, string>;
    const sessionJwt = cookies.stytch_session_jwt;
    const origin = `${req.protocol}://${req.hostname}`;
    const currentUrl = `${origin}${req.url}`;

    if (!sessionJwt) {
      const next = encodeURIComponent(currentUrl);
      return res.redirect(`${this.webOrigin}/auth?next=${next}`);
    }

    try {
      const { session } = (await this.stytchClient.sessions.authenticate({
        session_jwt: sessionJwt
      })) as any;
      const user = session.user as any;

      const payload = new URLSearchParams({
        nonce,
        email: user.emails?.[0]?.email ?? '',
        external_id: user.user_id,
        username: user.name.first_name || user.user_id,
        name: [user.name.first_name, user.name.last_name]
          .filter(Boolean)
          .join(' ')
      }).toString();

      const base64Payload = Buffer.from(payload).toString('base64');
      const payloadSig = createHmac('sha256', this.discourseSecret)
        .update(base64Payload)
        .digest('hex');

      return res.redirect(
        `${returnUrl}?sso=${encodeURIComponent(base64Payload)}&sig=${payloadSig}`
      );
    } catch {
      const next = encodeURIComponent(currentUrl);
      return res.redirect(`${this.webOrigin}/auth?next=${next}`);
    }
  }
}
