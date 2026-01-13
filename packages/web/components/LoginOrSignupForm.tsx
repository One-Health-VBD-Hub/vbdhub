import { StytchLogin } from '@stytch/nextjs';
import { OTPMethods, Products } from '@stytch/vanilla-js';

// built according to https://stytch.com/docs/quickstarts/nextjs on 11/11/2024
export const LoginOrSignupForm = () => {
  const config = {
    products: [Products.otp],
    otpOptions: {
      methods: [OTPMethods.Email],
      expirationMinutes: 15
    }
  };

  const style = {
    fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Fallback'",
    colors: { primary: '#000000' },
    container: {
      borderRadius: '0px',
      borderColor: '#e0e0e0',
      width: 'auto'
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

  return <StytchLogin config={config} styles={style} />;
};
