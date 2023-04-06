import * as React from 'react'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import {
  checkUsernameForAvailabilty,
  validateUsername
} from '../../../actions/CreateAccountActions'
import { maybeRouteComplete } from '../../../actions/LoginInitActions'
import s from '../../../common/locales/strings'
import { useHandler } from '../../../hooks/useHandler'
import { Branding } from '../../../types/Branding'
import { useDispatch, useSelector } from '../../../types/ReduxTypes'
import { Theme, useTheme } from '../../services/ThemeContext'
import { EdgeText } from '../../themed/EdgeText'
import { MainButton } from '../../themed/MainButton'
import { OutlinedTextInput } from '../../themed/OutlinedTextInput'
import { ThemedScene } from '../../themed/ThemedScene'

interface Props {
  branding: Branding
  onBack?: (() => void) | undefined
}

export const NewAccountUsernameScene = ({ branding, onBack }: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)
  const { username, usernameErrorMessage } = useSelector(state => state.create)
  const dispatch = useDispatch()

  const handleNext = useHandler(async () => {
    if (usernameErrorMessage != null || username == null) {
      return
    }
    await checkUsernameForAvailabilty(username)
  })

  const handleOnBack = useHandler(async () => {
    if (onBack != null) {
      await onBack()
    } else {
      await dispatch({ type: 'NEW_ACCOUNT_WELCOME' })
    }
  })

  const error =
    usernameErrorMessage == null || usernameErrorMessage === ''
      ? undefined
      : usernameErrorMessage
  return (
    <ThemedScene onBack={handleOnBack} title={s.strings.choose_title_username}>
      <View style={styles.content}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.mainScrollView}
          keyboardShouldPersistTaps="handled"
        >
          <EdgeText style={styles.description} numberOfLines={2}>
            {sprintf(
              s.strings.username_desc,
              branding.appName || s.strings.app_name_default
            )}
          </EdgeText>

          <OutlinedTextInput
            autoCorrect={false}
            autoFocus
            label={s.strings.username}
            onChangeText={validateUsername}
            onSubmitEditing={handleNext}
            returnKeyType="go"
            marginRem={1}
            value={username ?? ''}
            clearIcon
            error={error}
            searchIcon={false}
          />

          <MainButton
            alignSelf="center"
            label={s.strings.next_label}
            type="secondary"
            marginRem={[1.5, 0.5]}
            disabled={error != null}
            onPress={handleNext}
          />
        </KeyboardAwareScrollView>
      </View>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    flex: 1,
    marginHorizontal: theme.rem(0.5),
    marginTop: theme.rem(1.5)
  },
  mainScrollView: {
    flex: 1,
    alignContent: 'flex-start'
  },
  description: {
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.875),
    marginBottom: theme.rem(1)
  }
}))
