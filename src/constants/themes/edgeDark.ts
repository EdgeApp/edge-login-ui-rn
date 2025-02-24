import { Platform } from 'react-native'

import { textNoShadow, Theme, themeNoShadow } from '../../types/Theme'
import { scale } from '../../util/scaling'

const palette = {
  white: '#FFFFFF',
  black: '#000000',
  royalBlue: '#003B65',
  darkBlue: '#0C446A',
  edgeNavy: '#0D2145',
  edgeBlue: '#0E4B75',
  edgeMint: '#66EDA8',
  darkAqua: '#1b2f3b',
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
  whiteOp25: 'rgba(255, 255, 255, .25)',
  whiteOp75: 'rgba(255, 255, 255, .75)',
  whiteOp10: 'rgba(255, 255, 255, .1)',
  grayOp80: 'rgba(135, 147, 158, .8)',
  accentOrangeOp30: 'rgba(241, 170, 25, .3)',
  lightGrayOp75: 'rgb(217, 227, 237, .75)',
  transparent: 'transparent',

  // Fonts
  SFUITextRegular: 'SF-UI-Text-Regular',
  QuicksandMedium: 'Quicksand-Medium',
  QuicksandRegular: 'Quicksand-Regular',

  // UI4 palette
  whiteOp37: 'rgba(255, 255, 255, .37)',
  darkGreyOp30: 'hsla(0, 0%, 53%, 0.3)',
  blackOp65: 'rgba(0, 0, 0, .65)',
  graySecondary: 'hsla(0, 0%, 100%, 0.20)',

  // Background:
  backgroundBlack: '#1a1a1a',

  // Gradients
  darkestGreen: '#20312f',
  darkGreen: '#00604d',

  dangerOuter: 'rgba(240, 81, 35, 0.44)',
  dangerInner: 'rgba(237, 28, 36, 0.44)',
  warningOuter: 'rgba(119, 43, 15, 0.44)',
  warningInner: 'rgba(130, 91, 33, 0.44)',
  errorOuter: 'rgba(148, 71, 46, 0.44)',
  errorInner: 'rgba(150, 44, 49, 0.44)'
}

export const edgeDark: Theme = {
  // The app scaling factor, which is the height of "normal" text:
  rem(size: number): number {
    return Math.round(scale(16, 0.3) * size)
  },

  preferPrimaryButton: false,
  fontFamily: 'System',
  fontWeightBold: 'bold',

  // Used to control the OS status bar, modal blur,
  // and other binary light / dark choices:
  isDark: true,

  // Icons
  icon: palette.white,
  iconDeactivated: palette.whiteOp75,
  iconTappable: palette.edgeMint,

  // Modal
  modal: palette.backgroundBlack,
  modalCloseIcon: palette.edgeMint,
  modalBorderColor: palette.transparent,
  modalBorderWidth: 0,
  modalBorderRadiusRem: 1,
  modalBackground: palette.whiteOp37,
  modalSceneOverlayColor: palette.black,
  modalDragbarColor: palette.darkGreyOp30,

  // text
  primaryText: palette.white,
  secondaryText: palette.blueGray,
  dangerText: palette.accentRed,
  warningText: palette.accentOrange,
  linkText: palette.edgeMint,
  positiveText: palette.accentGreen,
  deactivatedText: palette.gray,

  // tile
  tileBackground: palette.edgeBlue,

  // buttons
  buttonBorderRadiusRem: 0.25,

  keypadButtonOutline: palette.edgeMint,
  keypadButtonOutlineWidth: 1,
  keypadButton: [palette.transparent, palette.transparent],
  keypadButtonColorStart: { x: 0, y: 0 },
  keypadButtonColorEnd: { x: 1, y: 1 },
  keypadButtonText: palette.edgeMint,
  keypadButtonTextShadow: textNoShadow,
  keypadButtonShadow: themeNoShadow,
  keypadButtonBorderRadiusRem: 0.25,
  keypadButtonFontSizeRem: 1,
  keypadButtonFont: 'System',

  primaryButtonOutline: palette.transparent,
  primaryButtonOutlineWidth: 0,
  primaryButton: [palette.darkestGreen, palette.darkGreen],
  primaryButtonColorStart: { x: 0, y: 0 },
  primaryButtonColorEnd: { x: 1, y: 0 },
  primaryButtonText: palette.white,
  primaryButtonTextShadow: textNoShadow,
  primaryButtonShadow: {
    shadowColor: palette.black,
    shadowOffset: { width: -1.5, height: 1.5 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    /** @deprecated */
    elevation: 0
  },
  primaryButtonFontSizeRem: 1,
  primaryButtonFont: palette.QuicksandMedium,

  secondaryButtonOutline: palette.graySecondary,
  secondaryButtonOutlineWidth: 0,
  secondaryButton: [palette.graySecondary, palette.graySecondary],
  secondaryButtonColorStart: { x: 0, y: 0 },
  secondaryButtonColorEnd: { x: 1, y: 1 },
  secondaryButtonText: palette.white,
  secondaryButtonTextShadow: textNoShadow,
  secondaryButtonShadow: {
    shadowColor: palette.black,
    shadowOffset: { width: -1.5, height: 1.5 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    /** @deprecated */
    elevation: 0
  },
  secondaryButtonFontSizeRem: 1,
  secondaryButtonFont: palette.QuicksandRegular,

  escapeButtonOutline: palette.transparent,
  escapeButtonOutlineWidth: 0,
  escapeButton: [palette.transparent, palette.transparent],
  escapeButtonColorStart: { x: 0, y: 0 },
  escapeButtonColorEnd: { x: 1, y: 1 },
  escapeButtonText: palette.edgeMint,
  escapeButtonTextShadow: textNoShadow,
  escapeButtonShadow: themeNoShadow,
  escapeButtonFontSizeRem: 1,
  escapeButtonFont: palette.QuicksandRegular,

  dangerButtonOutline: palette.transparent,
  dangerButtonOutlineWidth: 0,
  dangerButton: [palette.dangerOuter, palette.dangerInner, palette.dangerOuter],
  dangerButtonColorStart: { x: 0, y: 0.25 },
  dangerButtonColorEnd: { x: 1, y: 0.75 },
  dangerButtonText: palette.white,
  dangerButtonTextShadow: textNoShadow,
  dangerButtonShadow: themeNoShadow,
  dangerButtonFontSizeRem: 1,
  dangerButtonFont: 'System',

  pinUsernameButtonOutline: palette.transparent,
  pinUsernameButtonOutlineWidth: 0,
  pinUsernameButton: [palette.transparent, palette.transparent],
  pinUsernameButtonColorStart: { x: 0, y: 0 },
  pinUsernameButtonColorEnd: { x: 1, y: 1 },
  pinUsernameButtonText: palette.white,
  pinUsernameButtonTextShadow: textNoShadow,
  pinUsernameButtonShadow: themeNoShadow,
  pinUsernameButtonBorderRadiusRem: 1,
  pinUsernameButtonFontSizeRem: 1.5,
  pinUsernameButtonFont: 'System',

  outlineTextInputColor: palette.transparent,
  outlineTextInputTextColor: palette.white,
  outlineTextInputBorderWidth: 1,
  outlineTextInputBorderColor: palette.blueGray,
  outlineTextInputBorderColorFocused: palette.edgeMint,
  outlineTextInputLabelColor: palette.blueGray,
  outlineTextInputLabelColorFocused: palette.edgeMint,

  // Simple Text Input
  textInputTextColor: palette.white,
  textInputTextColorDisabled: palette.gray,
  textInputTextColorFocused: palette.white,
  textInputBackgroundColor: palette.darkAqua,
  textInputBackgroundColorDisabled: palette.darkAqua,
  textInputBackgroundColorFocused: palette.darkAqua,
  textInputBorderColor: `${palette.edgeMint}00`,
  textInputBorderColorDisabled: palette.gray,
  textInputBorderColorFocused: palette.edgeMint,
  textInputBorderRadius: 100,
  textInputBorderWidth: 1,
  textInputIconColor: palette.gray,
  textInputIconColorDisabled: palette.gray,
  textInputIconColorFocused: palette.edgeMint,
  textInputPlaceholderColor: palette.gray,
  textInputPlaceholderColorDisabled: palette.gray,
  textInputPlaceholderColorFocused: palette.edgeMint,
  textInputSelectionColor: palette.whiteOp25,

  // Dropdown colors:
  dropdownWarning: palette.accentOrange,
  dropdownError: palette.accentRed,
  dropdownText: palette.white,

  // Native iOS date modal:
  dateModalTextLight: palette.accentBlue,
  dateModalTextDark: palette.white,
  dateModalBackgroundLight: palette.white,
  dateModalBackgroundDark: palette.edgeBlue,

  // Card
  cardBorder: 1,
  cardBorderColor: palette.whiteOp10,
  cardBorderRadius: 4,

  // Lines
  lineDivider: palette.whiteOp10,
  thinLineWidth: 1,
  mediumLineWidth: 2,

  // Fonts
  fontFaceDefault: 'System',
  fontFaceMedium: 'System',
  fontFaceBold: 'System',
  fontFaceSymbols:
    Platform.OS === 'android' ? palette.SFUITextRegular : 'System',

  // UI4
  cardBaseColor: palette.whiteOp10,
  cardGradientWarning: {
    colors: [
      palette.warningOuter,
      palette.warningInner,
      palette.warningInner,
      palette.warningOuter
    ],
    end: { x: 0.9, y: 0 },
    start: { x: 0, y: 0.9 }
  },
  cardGradientError: {
    colors: [
      palette.errorOuter,
      palette.errorInner,
      palette.errorInner,
      palette.errorOuter
    ],
    end: { x: 0.9, y: 0 },
    start: { x: 0, y: 0.9 }
  },
  cardOverlayDisabled: palette.blackOp65
}
