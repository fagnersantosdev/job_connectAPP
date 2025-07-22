import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#e4f0fd',
  primary: '#06437e',
  buttonBackground: '#f5b700',
  buttonText: '#ffffff',
  buttonSelectedBorder: '#f5b700',
  buttonSelectedBackground: '#f5f5f5',
  buttonDefaultBorder: '#cccccc',
  textDefault: '#333333',
};

export const SIZES = {
  logoWidth: 300,
  logoHeight: 200,
  logoMarginBottom: 20,
  titleFontSize: 24,
  buttonPaddingVertical: 12,
  buttonPaddingHorizontal: 40,
  borderRadius: 12,
  spacingVertical: 8,
  marginTopLogin: 20,
  loginFontSize: 14,
  buttonFontSize: 16,
  marginTopStartButton: 20,
  marginTopFooter: 100,
  footerFontSize: 12,
};

export const styles = StyleSheet.create({
  logo: {
    width: SIZES.logoWidth,
    height: SIZES.logoHeight,
    marginBottom: SIZES.logoMarginBottom,
    resizeMode: 'contain',
  },
  title: {
    fontSize: SIZES.titleFontSize,
    fontWeight: '600',
    marginBottom: 20,
    color: COLORS.primary,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: SIZES.buttonPaddingVertical,
    borderRadius: SIZES.borderRadius,
    marginVertical: SIZES.spacingVertical,
    width: '80%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.buttonDefaultBorder,
  },
  selectedButton: {
    borderColor: COLORS.buttonSelectedBorder,
    backgroundColor: COLORS.buttonSelectedBackground,
  },
  selectButtonText: {
    marginLeft: 10,
    fontSize: SIZES.buttonFontSize,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loginText: {
    marginTop: SIZES.marginTopLogin,
    fontSize: SIZES.loginFontSize,
    color: COLORS.textDefault,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: COLORS.buttonBackground,
    paddingVertical: SIZES.buttonPaddingVertical,
    paddingHorizontal: SIZES.buttonPaddingHorizontal,
    borderRadius: SIZES.borderRadius,
    marginTop: SIZES.marginTopStartButton,
  },
  startButtonText: {
    color: COLORS.buttonText,
    fontWeight: 'bold',
    fontSize: SIZES.buttonFontSize,
  },
  footerText: {
    marginTop: SIZES.marginTopFooter,
    fontSize: SIZES.footerFontSize,
    color: COLORS.textDefault,
    textAlign: 'center',
  },
});
