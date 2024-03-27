import * as React from 'react'
import { View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'

import { lstrings } from '../../common/locales/strings'
import { EdgeAnim } from '../common/EdgeAnim'
import { Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from './EdgeText'
import { IconSignal } from './IconSignal'

/**
 * 'met' or 'unmet' while user is editing the password fields, 'error' if any
 * requirements are still unmet upon submission.
 *
 * 'met': green, 'unmet': white, 'error': red
 * */
export type PasswordRequirementStatus = 'met' | 'unmet' | 'error'

/** Conditions that must be met in order for the password to be accepted. */
export interface PasswordRequirements {
  minLengthMet: PasswordRequirementStatus
  hasNumber: PasswordRequirementStatus
  hasLowercase: PasswordRequirementStatus
  hasUppercase: PasswordRequirementStatus

  // Initially undefined and omitted from the list until the user starts on the
  // pw confirmation text field
  confirmationMatches?: PasswordRequirementStatus
}

interface Props {
  passwordReqs: PasswordRequirements
}

export const PasswordStatus = (props: Props) => {
  const { passwordReqs } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const {
    minLengthMet,
    hasNumber,
    hasLowercase,
    hasUppercase,
    confirmationMatches
  } = passwordReqs

  const list = [
    { title: lstrings.must_ten_characters, validationStatus: minLengthMet },
    {
      title: lstrings.must_one_lowercase,
      validationStatus: hasLowercase
    },
    {
      title: lstrings.must_one_uppercase,
      validationStatus: hasUppercase
    },
    { title: lstrings.must_one_number, validationStatus: hasNumber }
  ]

  if (confirmationMatches != null)
    list.push({
      title: lstrings.password_must_match,
      validationStatus: confirmationMatches
    })

  const passwordValid = !list.some(
    ({ validationStatus }) =>
      validationStatus === 'unmet' || validationStatus === 'error'
  )

  return (
    <EdgeAnim
      enter={{ type: 'fadeInUp', distance: 100 }}
      style={[styles.container, passwordValid && styles.passedContainer]}
    >
      <View style={styles.top}>
        <IconSignal
          enabled={passwordValid}
          enabledIcon={props => <FontAwesome {...props} name="check-circle" />}
          disabledIcon={props => <SimpleLineIcons {...props} name="info" />}
        />
        <EdgeText style={[styles.message, passwordValid && styles.passed]}>
          {lstrings.password_requirements}
        </EdgeText>
      </View>
      {list.map(({ title, validationStatus }) => {
        const color =
          validationStatus === 'met'
            ? styles.passed
            : validationStatus === 'error'
            ? styles.error
            : undefined

        return (
          <EdgeAnim
            enter={{ type: 'fadeInDown', distance: 10 }}
            style={styles.passwordConditionRow}
            key={title}
          >
            <View style={styles.passwordConditionRow}>
              <EdgeText
                style={[
                  styles.passwordConditionText,
                  styles.passwordConditionDot,
                  color
                ]}
              >{`\u2022`}</EdgeText>
              <EdgeText style={[styles.passwordConditionText, color]}>
                {title}
              </EdgeText>
            </View>
          </EdgeAnim>
        )
      })}
    </EdgeAnim>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    // TODO: Sync CardUi4 w/ GUI after finalizing design requirements for this component.
    backgroundColor: theme.cardBaseColor,
    borderRadius: theme.rem(1),
    padding: theme.rem(1),
    justifyContent: 'flex-start',
    margin: theme.rem(0.5)
  },
  error: {
    color: theme.dangerText
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.rem(0.5)
  },
  message: {
    flexShrink: 1,
    fontFamily: theme.fontFaceBold,
    marginLeft: theme.rem(0.5)
  },
  passwordConditionRow: {
    marginLeft: theme.rem(0.4),
    flexDirection: 'row'
  },
  passwordConditionText: {
    flexShrink: 1,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.75),
    marginBottom: theme.rem(0.15)
  },
  passwordConditionDot: {
    marginRight: theme.rem(0.5)
  },
  passed: {
    color: theme.positiveText
  },
  passedContainer: {
    borderColor: theme.positiveText
  }
}))
