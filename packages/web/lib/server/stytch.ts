import { envs, Client } from 'stytch';

let cachedClient: Client | null = null;

export function getStytchClient() {
  if (cachedClient) return cachedClient;

  const projectId = process.env.STYTCH_PROJECT_ID;
  const secret = process.env.STYTCH_SECRET;

  if (!projectId || !secret) {
    throw new Error(
      'Missing STYTCH_PROJECT_ID or STYTCH_SECRET environment variables required for server-side Stytch operations.'
    );
  }

  const environment =
    process.env.STYTCH_PROJECT_ENV === 'live' ? envs.live : envs.test;

  cachedClient = new Client({
    project_id: projectId,
    secret,
    env: environment
  });

  return cachedClient;
}
