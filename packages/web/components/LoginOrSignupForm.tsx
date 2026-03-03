import { StytchLogin, OTPMethods, Products } from '@stytch/nextjs';
import { styleToTheme } from '@stytch/nextjs/compat';
import { useMediaQuery } from 'usehooks-ts';

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

export const LoginOrSignupForm = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  const config = {
    products: [Products.otp],
    otpOptions: {
      methods: [OTPMethods.Email],
      expirationMinutes: 10
    }
  };

  const presentation = styleToTheme(style);

  return (
    <StytchLogin
      config={config}
      presentation={{
        ...presentation,
        theme: {
          ...presentation.theme,
          // Keep compact OTP sizing in this constrained auth layout.
          'mobile-breakpoint': '319px',
          spacing: isMobile ? '3.6px' : '4.2px'
        }
      }}
    />
  );
};
