import { EdgePasswordRules } from 'edge-core-js'
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

interface Props {
  passwordEval: EdgePasswordRules
}

export const PasswordStatus = (props: Props) => {
  const { passwordEval } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const { passed, tooShort, noLowerCase, noUpperCase, noNumber } = passwordEval
  const list = [
    { title: lstrings.must_ten_characters, value: !tooShort },
    {
      title: lstrings.must_one_lowercase,
      value: !noLowerCase
    },
    {
      title: lstrings.must_one_uppercase,
      value: !noUpperCase
    },
    { title: lstrings.must_one_number, value: !noNumber }
  ]

  return (
    <EdgeAnim
      enter={{ type: 'fadeInUp', distance: 100 }}
      style={[styles.container, passed && styles.passedContainer]}
    >
      <View style={styles.top}>
        <IconSignal
          enabled={passed}
          enabledIcon={props => <FontAwesome {...props} name="check-circle" />}
          disabledIcon={props => <SimpleLineIcons {...props} name="info" />}
        />
        <EdgeText style={[styles.message, passed && styles.passed]}>
          {lstrings.password_requirements}
        </EdgeText>
      </View>
      {list.map(({ title, value }) => (
        <View style={styles.passwordConditionRow} key={title}>
          <EdgeText
            style={[
              styles.passwordConditionText,
              styles.passwordConditionDot,
              value && styles.passed
            ]}
          >{`\u2022`}</EdgeText>
          <EdgeText
            style={[styles.passwordConditionText, value && styles.passed]}
          >
            {title}
          </EdgeText>
        </View>
      ))}
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
