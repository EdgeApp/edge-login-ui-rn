import {
  asArray,
  asBoolean,
  asNumber,
  asObject,
  asOptional,
  asString,
  asValue,
  Cleaner
} from 'cleaners'

const asFunction: Cleaner<() => any> = raw => {
  if (typeof raw === 'function') return raw
  throw new TypeError()
}

const asGradientCoords = asObject({
  x: asNumber,
  y: asNumber
})
type GradientCoords = ReturnType<typeof asGradientCoords>

/**
 * A gradient needs at least two stops to interpolate between, which
 * `LinearGradient` enforces in its own prop types. A plain `string[]` says
 * nothing about length, so themes declare the tuple instead.
 */
export type GradientColors = readonly [string, string, ...string[]]

const asGradientColors: Cleaner<GradientColors> = raw => {
  const [first, second, ...rest] = asArray(asString)(raw)
  if (first == null || second == null) {
    throw new TypeError('A gradient needs at least two colors')
  }
  return [first, second, ...rest]
}

const asThemeGradientParams = asObject({
  colors: asGradientColors,
  start: asGradientCoords,
  end: asGradientCoords
})
type ThemeGradientParams = ReturnType<typeof asThemeGradientParams>

const asThemeShadowParams = asObject({
  shadowColor: asString,
  shadowOffset: asObject({
    width: asNumber,
    height: asNumber
  }),
  shadowOpacity: asNumber,
  shadowRadius: asNumber,
  elevation: asNumber
})
type ThemeShadowParams = ReturnType<typeof asThemeShadowParams>

const asTextShadowParams = asObject({
  textShadowColor: asString,
  textShadowOffset: asObject({
    width: asNumber,
    height: asNumber
  }),
  textShadowRadius: asNumber
})
type TextShadowParams = ReturnType<typeof asTextShadowParams>

export const themeNoShadow: ThemeShadowParams = {
  shadowColor: '#000000',
  shadowOffset: {
    width: 0,
    height: 0
  },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0
}

export const textNoShadow: TextShadowParams = {
  textShadowColor: '#000000',
  textShadowOffset: {
    width: 0,
    height: 0
  },
  textShadowRadius: 0
}

export const asOptionalTheme = asObject<Partial<Theme>>({
  // The app scaling factor, which is the height of "normal" text:
  rem: asOptional(asFunction),

  preferPrimaryButton: asOptional(asBoolean),
  fontFamily: asOptional(asString),
  fontWeightBold: asOptional(
    asValue(
      'normal',
      'bold',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900'
    )
  ),

  // Icons
  icon: asOptional(asString),
  iconDeactivated: asOptional(asString),
  iconTappable: asOptional(asString),

  // Modal:
  modal: asOptional(asString),
  modalCloseIcon: asOptional(asString),
  modalBorderColor: asOptional(asString),
  modalBorderWidth: asOptional(asNumber),
  modalBorderRadiusRem: asOptional(asNumber),
  modalBackground: asOptional(asString),
  modalSceneOverlayColor: asOptional(asString),
  modalDragbarColor: asOptional(asString),

  // Text colors:
  primaryText: asOptional(asString),
  secondaryText: asOptional(asString),
  dangerText: asOptional(asString),
  warningText: asOptional(asString),
  linkText: asOptional(asString),
  positiveText: asOptional(asString),
  deactivatedText: asOptional(asString),

  // Tile:
  tileBackground: asOptional(asString),

  // Buttons
  buttonBorderRadiusRem: asOptional(asNumber),

  keypadButtonOutline: asOptional(asString),
  keypadButtonOutlineWidth: asOptional(asNumber),
  keypadButton: asOptional(asGradientColors),
  keypadButtonColorStart: asOptional(asGradientCoords),
  keypadButtonColorEnd: asOptional(asGradientCoords),
  keypadButtonText: asOptional(asString),
  keypadButtonTextShadow: asOptional(asTextShadowParams),
  keypadButtonShadow: asOptional(asThemeShadowParams),
  keypadButtonBorderRadiusRem: asOptional(asNumber),
  keypadButtonFontSizeRem: asOptional(asNumber),
  keypadButtonFont: asOptional(asString),

  primaryButtonOutline: asOptional(asString),
  primaryButtonOutlineWidth: asOptional(asNumber),
  primaryButton: asOptional(asGradientColors),
  primaryButtonColorStart: asOptional(asGradientCoords),
  primaryButtonColorEnd: asOptional(asGradientCoords),
  primaryButtonText: asOptional(asString),
  primaryButtonTextShadow: asOptional(asTextShadowParams),
  primaryButtonShadow: asOptional(asThemeShadowParams),
  primaryButtonFontSizeRem: asOptional(asNumber),
  primaryButtonFont: asOptional(asString),

  secondaryButtonOutline: asOptional(asString),
  secondaryButtonOutlineWidth: asOptional(asNumber),
  secondaryButton: asOptional(asGradientColors),
  secondaryButtonColorStart: asOptional(asGradientCoords),
  secondaryButtonColorEnd: asOptional(asGradientCoords),
  secondaryButtonText: asOptional(asString),
  secondaryButtonTextShadow: asOptional(asTextShadowParams),
  secondaryButtonShadow: asOptional(asThemeShadowParams),
  secondaryButtonFontSizeRem: asOptional(asNumber),
  secondaryButtonFont: asOptional(asString),

  escapeButtonOutline: asOptional(asString),
  escapeButtonOutlineWidth: asOptional(asNumber),
  escapeButton: asOptional(asGradientColors),
  escapeButtonColorStart: asOptional(asGradientCoords),
  escapeButtonColorEnd: asOptional(asGradientCoords),
  escapeButtonText: asOptional(asString),
  escapeButtonTextShadow: asOptional(asTextShadowParams),
  escapeButtonShadow: asOptional(asThemeShadowParams),
  escapeButtonFontSizeRem: asOptional(asNumber),
  escapeButtonFont: asOptional(asString),

  pinUsernameButtonOutline: asOptional(asString),
  pinUsernameButtonOutlineWidth: asOptional(asNumber),
  pinUsernameButton: asOptional(asGradientColors),
  pinUsernameButtonColorStart: asOptional(asGradientCoords),
  pinUsernameButtonColorEnd: asOptional(asGradientCoords),
  pinUsernameButtonText: asOptional(asString),
  pinUsernameButtonTextShadow: asOptional(asTextShadowParams),
  pinUsernameButtonShadow: asOptional(asThemeShadowParams),
  pinUsernameButtonBorderRadiusRem: asOptional(asNumber),
  pinUsernameButtonFontSizeRem: asOptional(asNumber),
  pinUsernameButtonFont: asOptional(asString),

  // Outline Text Input
  outlineTextInputColor: asOptional(asString),
  outlineTextInputTextColor: asOptional(asString),
  outlineTextInputBorderWidth: asOptional(asNumber),
  outlineTextInputBorderColor: asOptional(asString),
  outlineTextInputBorderColorFocused: asOptional(asString),
  outlineTextInputLabelColor: asOptional(asString),
  outlineTextInputLabelColorFocused: asOptional(asString),

  // Dropdown colors:
  dropdownWarning: asOptional(asString),
  dropdownError: asOptional(asString),
  dropdownText: asOptional(asString),

  // Native iOS date modal:
  dateModalTextLight: asOptional(asString),
  dateModalTextDark: asOptional(asString),
  dateModalBackgroundLight: asOptional(asString),
  dateModalBackgroundDark: asOptional(asString),

  // Card
  cardBorder: asOptional(asNumber),
  cardBorderColor: asOptional(asString),
  cardBorderRadius: asOptional(asNumber),

  // Lines
  lineDivider: asOptional(asString),
  thinLineWidth: asOptional(asNumber),
  mediumLineWidth: asOptional(asNumber),

  // Font
  fontFaceDefault: asOptional(asString),
  fontFaceMedium: asOptional(asString),
  fontFaceBold: asOptional(asString),
  fontFaceSymbols: asOptional(asString)
})

export type OptionalTheme = ReturnType<typeof asOptionalTheme>

type FontWeight =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'

export interface Theme {
  // The app scaling factor, which is the height of "normal" text:
  rem: (size: number) => number

  preferPrimaryButton: boolean
  fontFamily: string
  fontWeightBold: FontWeight

  // Used to control the OS status bar, modal blur,
  // and other binary light / dark choices:
  isDark: boolean

  // Icons
  icon: string
  iconDeactivated: string
  iconTappable: string

  // Modal
  modal: string
  modalCloseIcon: string
  modalBorderColor: string
  modalBorderWidth: number
  modalBorderRadiusRem: number
  modalBackground: string
  modalSceneOverlayColor: string
  modalDragbarColor: string

  // Text colors:
  primaryText: string
  secondaryText: string
  dangerText: string
  warningText: string
  linkText: string
  positiveText: string
  deactivatedText: string

  // Tile:
  tileBackground: string

  // Buttons
  buttonBorderRadiusRem: number

  keypadButtonOutline: string
  keypadButtonOutlineWidth: number
  keypadButton: GradientColors
  keypadButtonColorStart: GradientCoords
  keypadButtonColorEnd: GradientCoords
  keypadButtonText: string
  keypadButtonTextShadow: TextShadowParams
  keypadButtonShadow: ThemeShadowParams
  keypadButtonBorderRadiusRem: number
  keypadButtonFontSizeRem: number
  keypadButtonFont: string

  primaryButtonOutline: string
  primaryButtonOutlineWidth: number
  primaryButton: GradientColors
  primaryButtonColorStart: GradientCoords
  primaryButtonColorEnd: GradientCoords
  primaryButtonText: string
  primaryButtonTextShadow: TextShadowParams
  primaryButtonShadow: ThemeShadowParams
  primaryButtonFontSizeRem: number
  primaryButtonFont: string

  secondaryButtonOutline: string
  secondaryButtonOutlineWidth: number
  secondaryButton: GradientColors
  secondaryButtonColorStart: GradientCoords
  secondaryButtonColorEnd: GradientCoords
  secondaryButtonText: string
  secondaryButtonTextShadow: TextShadowParams
  secondaryButtonShadow: ThemeShadowParams
  secondaryButtonFontSizeRem: number
  secondaryButtonFont: string

  escapeButtonOutline: string
  escapeButtonOutlineWidth: number
  escapeButton: GradientColors
  escapeButtonColorStart: GradientCoords
  escapeButtonColorEnd: GradientCoords
  escapeButtonText: string
  escapeButtonTextShadow: TextShadowParams
  escapeButtonShadow: ThemeShadowParams
  escapeButtonFontSizeRem: number
  escapeButtonFont: string

  dangerButtonOutline: string
  dangerButtonOutlineWidth: number
  dangerButton: GradientColors
  dangerButtonColorStart: GradientCoords
  dangerButtonColorEnd: GradientCoords
  dangerButtonText: string
  dangerButtonTextShadow: TextShadowParams
  dangerButtonShadow: ThemeShadowParams
  dangerButtonFontSizeRem: number
  dangerButtonFont: string

  pinUsernameButtonOutline: string
  pinUsernameButtonOutlineWidth: number
  pinUsernameButton: GradientColors
  pinUsernameButtonColorStart: GradientCoords
  pinUsernameButtonColorEnd: GradientCoords
  pinUsernameButtonText: string
  pinUsernameButtonTextShadow: TextShadowParams
  pinUsernameButtonShadow: ThemeShadowParams
  pinUsernameButtonBorderRadiusRem: number
  pinUsernameButtonFontSizeRem: number
  pinUsernameButtonFont: string

  switchTrackDisabledOn: string

  // Outline Text Input
  outlineTextInputColor: string
  outlineTextInputTextColor: string
  outlineTextInputBorderWidth: number
  outlineTextInputBorderColor: string
  outlineTextInputBorderColorFocused: string
  outlineTextInputLabelColor: string
  outlineTextInputLabelColorFocused: string

  // Text Input
  textInputTextColor: string
  textInputTextColorDisabled: string
  textInputTextColorFocused: string
  textInputBackgroundColor: string
  textInputBackgroundColorDisabled: string
  textInputBackgroundColorFocused: string
  textInputBorderWidth: number
  textInputBorderColor: string
  textInputBorderColorDisabled: string
  textInputBorderColorFocused: string
  textInputBorderRadius: number
  textInputIconColor: string
  textInputIconColorDisabled: string
  textInputIconColorFocused: string
  textInputPlaceholderColor: string
  textInputPlaceholderColorDisabled: string
  textInputPlaceholderColorFocused: string
  textInputSelectionColor: string

  // Dropdown colors:
  dropdownWarning: string
  dropdownError: string
  dropdownText: string

  // Native iOS date modal:
  dateModalTextLight: string
  dateModalTextDark: string
  dateModalBackgroundLight: string
  dateModalBackgroundDark: string

  // Card
  cardBorder: number
  cardBorderColor: string
  cardBorderRadius: number

  // Lines
  lineDivider: string
  thinLineWidth: number
  mediumLineWidth: number

  // Font
  fontFaceDefault: string
  fontFaceMedium: string
  fontFaceBold: string
  fontFaceSymbols: string

  // UI4
  cardBaseColor: string
  cardGradientWarning: ThemeGradientParams
  cardGradientError: ThemeGradientParams
  cardOverlayDisabled: string
}
