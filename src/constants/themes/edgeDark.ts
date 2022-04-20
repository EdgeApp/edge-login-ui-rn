import { Platform } from 'react-native'

import { Theme } from '../../types/Theme'
import { scale } from '../../util/scaling'

const palette = {
  white: '#FFFFFF',
  black: '#000000',
  royalBlue: '#003B65',
  darkBlue: '#0C446A',
  edgeNavy: '#0D2145',
  edgeBlue: '#0E4B75',
  edgeMint: '#66EDA8',
  blueGray: '#A4C7DF',
  gray: '#87939E',
  lightGray: '#D9E3ED',
  mutedBlue: '#2F5E89',
  accentGreen: '#77C513',
  accentRed: '#E85466',
  accentBlue: '#0073D9',
  accentOrange: '#F1AA19',
  blackOp25: 'rgba(0, 0, 0, .25)',
  blackOp50: 'rgba(0, 0, 0, .5)',
  whiteOp75: 'rgba(255, 255, 255, .75)',
  whiteOp10: 'rgba(255, 255, 255, .1)',
  grayOp80: 'rgba(135, 147, 158, .8)',
  accentOrangeOp30: 'rgba(241, 170, 25, .3)',
  lightGrayOp75: 'rgb(217, 227, 237, .75)',
  transparent: 'transparent',

  // Fonts
  SFUITextRegular: 'SF-UI-Text-Regular',
  QuicksandLight: 'Quicksand-Light',
  QuicksandRegular: 'Quicksand-Regular',
  QuicksandMedium: 'Quicksand-Medium',
  QuicksandSemiBold: 'Quicksand-SemiBold',
  QuicksandBold: 'Quicksand-Bold'
}

export const edgeDark: Theme = {
  // The app scaling factor, which is the height of "normal" text:
  rem(size: number): number {
    return Math.round(scale(16, 0.3) * size)
  },

  fontFamily: 'System',
  fontWeightBold: 'bold',

  // Icons
  icon: palette.white,
  iconDeactivated: palette.whiteOp75,
  iconTappable: palette.edgeMint,

  // background
  backgroundGradientColors: [palette.edgeNavy, palette.darkBlue],

  // modal
  modal: palette.edgeNavy,
  modalBlurType: 'light',

  // text
  primaryText: palette.white,
  secondaryText: palette.blueGray,
  dangerText: palette.accentRed,
  warningText: palette.accentOrange,
  linkText: palette.edgeMint,
  positiveText: palette.accentGreen,

  // tile
  tileBackground: palette.edgeBlue,

  // buttons
  primaryButtonOutline: palette.transparent,
  primaryButton: palette.edgeMint,
  primaryButtonText: palette.edgeBlue,

  secondaryButtonOutline: palette.edgeMint,
  secondaryButton: palette.transparent,
  secondaryButtonText: palette.edgeMint,

  alertModalPrimaryButtonOutline: palette.edgeBlue,
  alertModalPrimaryButton: palette.edgeBlue,
  alertModalPrimaryButtonText: palette.white,

  alertModalTertiaryButtonOutline: palette.transparent,
  alertModalTertiaryButton: palette.transparent,
  alertModalTertiaryButtonText: palette.edgeBlue,

  // Dropdown colors:
  dropdownWarning: palette.accentOrange,
  dropdownError: palette.accentRed,
  dropdownText: palette.white,

  // Security alert modal:
  securityAlertModalHeaderCircle: palette.accentOrange,
  securityAlertModalDangerIcon: palette.accentRed,
  securityAlertModalWarningIcon: palette.accentOrange,
  securityAlertModalRowBorder: palette.lightGray,
  securityAlertModalText: palette.black,

  // Lines
  lineDivider: palette.whiteOp10,
  thinLineWidth: 1,
  mediumLineWidth: 2,

  // Fonts
  fontFaceDefault: 'System',
  fontFaceBold: 'System',
  fontFaceSymbols:
    Platform.OS === 'android'
      ? palette.SFUITextRegular
      : palette.QuicksandRegular
}
