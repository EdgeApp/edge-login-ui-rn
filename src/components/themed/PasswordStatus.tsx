import { EdgePasswordRules } from 'edge-core-js'
import * as React from 'react'
import { View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'

import s from '../../common/locales/strings'
import { fixSides, mapSides, sidesToMargin } from '../../util/sides'
import { Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from './EdgeText'
import { IconSignal } from './IconSignal'

interface Props {
  marginRem?: number[] | number
  passwordEval?: EdgePasswordRules
}

export const PasswordStatus = (props: Props) => {
  const { marginRem, passwordEval } = props
  const theme = useTheme()
  const styles = getStyles(theme)
  const spacings = sidesToMargin(mapSides(fixSides(marginRem, 0.5), theme.rem))

  if (passwordEval == null) return null

  const { passed, tooShort, noLowerCase, noUpperCase, noNumber } = passwordEval
  const list = [
    { title: s.strings.must_ten_characters, value: !tooShort },
    {
      title: s.strings.must_one_lowercase,
      value: !noLowerCase
    },
    {
      title: s.strings.must_one_uppercase,
      value: !noUpperCase
    },
    { title: s.strings.must_one_number, value: !noNumber }
  ]

  return (
    <View
      style={[styles.container, passed && styles.passedContainer, spacings]}
    >
      <View style={styles.top}>
        <IconSignal
          enabled={passed}
          enabledIcon={props => <FontAwesome {...props} name="check-circle" />}
          disabledIcon={props => <SimpleLineIcons {...props} name="info" />}
        />
        <EdgeText style={[styles.message, passed && styles.passed]}>
          {s.strings.password_requirements}
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
    </View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    borderWidth: 0.25,
    borderRadius: theme.rem(0.25),
    borderColor: theme.warningText,
    padding: theme.rem(1),
    justifyContent: 'flex-start'
  },
  containerPassed: {
    borderColor: theme.positiveText
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.rem(0.5)
  },
  message: {
    flexShrink: 1,
    color: theme.warningText,
    fontFamily: theme.fontFaceBold,
    fontSize: theme.rem(0.75),
    marginLeft: theme.rem(1)
  },
  passwordConditionRow: {
    marginLeft: theme.rem(0.4),
    flexDirection: 'row'
  },
  passwordConditionText: {
    flexShrink: 1,
    color: theme.warningText,
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
