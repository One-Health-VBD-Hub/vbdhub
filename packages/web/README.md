## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## DiscourseConnect migration notes

When DiscourseConnect replaces native Discourse login, existing forum accounts are not deleted. Discourse tries to match the incoming SSO user by email; if the verified email we send matches an existing forum user, that account is reused and linked by `external_id`. If the email differs, Discourse will create a new account instead of reusing the old one, so users would appear to "lose" access to their previous posts until the accounts are linked.

To avoid surprises when enabling SSO after native signups have existed for a while:

- Ensure the email address in the VBDHub user record matches the forum email for each user. Discourse will attach the SSO `external_id` to that account on first SSO login.
- If emails differ (or you want to pre-link accounts), use Discourse's `/admin/users/sync_sso` endpoint with an admin API key to push the same payload we send via SSO (including `external_id`, `email`, `username`, and `name`). This will retroactively bind existing forum accounts to the SSO identities without creating duplicates.
- Once DiscourseConnect is enabled, native login is disabled; users must authenticate through VBDHub. Accounts and historical posts remain intact as long as the email mapping or manual sync is performed.

Relevant settings: keep `discourse_connect_overrides_avatar`/`auth_overrides_username` in mind if you need Discourse to update usernames or avatars from the SSO payload.
