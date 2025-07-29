import { StytchLogin } from '@stytch/nextjs';
import { Products } from '@stytch/vanilla-js';

const LOGIN_REDIRECT_URL =
  process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL ?? 'http://localhost:3000/auth';
const SIGNUP_REDIRECT_URL =
  process.env.NEXT_PUBLIC_SIGNUP_REDIRECT_URL ?? 'http://localhost:3000/auth';

// built according to https://stytch.com/docs/quickstarts/nextjs on 11/11/2024
export const LoginOrSignupForm = () => {
  const config = {
    products: [Products.emailMagicLinks],
    emailMagicLinksOptions: {
      loginRedirectURL: LOGIN_REDIRECT_URL,
      loginExpirationMinutes: 60,
      signupRedirectURL: SIGNUP_REDIRECT_URL,
      signupExpirationMinutes: 1440
    }
  };

  const style = {
    fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Fallback'",
    colors: { primary: '#000000' },
    container: {
      borderRadius: '0px',
      borderColor: '#e0e0e0'
    },
    buttons: {
      primary: {
        backgroundColor: '#0f62fe',
        textColor: '#FFFFFF',
        borderColor: '#0f62fe',
        borderRadius: '0px'
      },
      secondary: {
        borderRadius: '0px',
        textColor: '#000000'
      }
    },
    inputs: {
      borderColor: '#e0e0e0',
      borderRadius: '0px',
      placeholderColor: 'rgba(22,22,22,0.4)'
    }
  };

  return (
    <div className='flex min-h-[80vh] flex-col items-center justify-center'>
      <StytchLogin config={config} styles={style} />
    </div>
  );
};
