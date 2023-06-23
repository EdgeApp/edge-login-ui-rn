import * as React from 'react'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import { fetchIsUsernameAvailable } from '../../../actions/CreateAccountActions'
import { maybeRouteComplete } from '../../../actions/LoginInitActions'
import s from '../../../common/locales/strings'
import { useHandler } from '../../../hooks/useHandler'
import { Branding } from '../../../types/Branding'
import { Dispatch, useDispatch, useSelector } from '../../../types/ReduxTypes'
import { SceneProps } from '../../../types/routerTypes'
import { logEvent } from '../../../util/analytics'
import { Theme, useTheme } from '../../services/ThemeContext'
import { EdgeText } from '../../themed/EdgeText'
import { MainButton } from '../../themed/MainButton'
import { OutlinedTextInput } from '../../themed/OutlinedTextInput'
import { ThemedScene } from '../../themed/ThemedScene'

interface Props extends SceneProps<'newAccountUsername'> {
  branding: Branding
}
const AVAILABILITY_CHECK_DELAY_MS = 400

type Timeout = ReturnType<typeof setTimeout>

export const NewAccountUsernameScene = (props: Props) => {
  const { branding } = props
  const dispatch = useDispatch()
  const theme = useTheme()
  const styles = getStyles(theme)

  const initUsername = useSelector(state => state.create.username)

  const [username, setUsername] = React.useState(initUsername ?? '')
  const [timerId, setTimerId] = React.useState<Timeout | undefined>(undefined)
  const [availableText, setAvailableText] = React.useState<string | undefined>(
    undefined
  )
  const [errorText, setErrorText] = React.useState<string | undefined>(
    undefined
  )
  const [isFetchingAvailability, setIsFetchingAvailability] = React.useState(
    false
  )

  const mounted = React.useRef<boolean>(true)
  const fetchCounter = React.useRef<number>(0)

  React.useEffect(
    () => () => {
      mounted.current = false
    },
    []
  )

  const fetchIsAvailable = async (username: string): Promise<boolean> => {
    return await dispatch(fetchIsUsernameAvailable(username))
  }

  // TODO:
  // Special considerations for the call to action (next) button:
  // 1. We want to avoid making the user wait for a fetch to check username
  //    availability if the fetch was already done prior to pressing the button.
  // 2. If the user quickly tapped next right after their last keyboard input,
  //    before waiting for the username availability check, then we want to
  //    check availability before proceeding past the scene

  const isNextDisabled =
    isFetchingAvailability ||
    timerId != null ||
    errorText != null ||
    username.length === 0

  const handleBack = useHandler(() => {
    dispatch(
      maybeRouteComplete({
        type: 'NAVIGATE',
        data: { name: 'newAccountWelcome', params: {} }
      })
    )
  })
  const handleNext = useHandler(async () => {
    if (!isNextDisabled) dispatch(completeUsername(username))
  })

  const handleChangeText = useHandler(async (text: string) => {
    if (!mounted.current) return

    // Clear the previous timer,
    if (timerId != null) {
      clearTimeout(timerId)
      setTimerId(undefined)
    }

    // Save the input and clear out previous text input status messages.
    setUsername(text)
    setErrorText(undefined)
    setAvailableText(undefined)

    // Validate on the actual user input, including if the last character was
    // non-ASCII.
    if (text.length > 0) {
      // Validate username format client-side for length and ASCII-ness
      const invalidErrorMessage = getUsernameFormatError(text)

      if (invalidErrorMessage != null) {
        setAvailableText(undefined)
        setErrorText(invalidErrorMessage)
      } else {
        // Check if username is available after a short delay after the last
        // typed character has been measured:

        // Start a new timer that will check availability after timer expiration
        const newTimerId = setTimeout(async () => {
          if (!mounted.current) return
          setIsFetchingAvailability(true)

          // Tag this fetch with a "counter ID" and sync with the outer context
          fetchCounter.current++
          const localCounter = fetchCounter.current

          const isAvailable = await fetchIsAvailable(text)
          if (!mounted.current) return

          // This fetch is stale. Another fetch began before this one had a
          // chance to finish. Discard this result.
          if (localCounter !== fetchCounter.current) return

          // If the counter from the outer context matches this local counter,
          // it means no new fetches began during the execution of
          // fetchIsAvailable.

          // Update UI elements
          setIsFetchingAvailability(false)
          setTimerId(undefined)
          if (isAvailable) setAvailableText(s.strings.username_available)
          else setErrorText(s.strings.username_exists_error)
        }, AVAILABILITY_CHECK_DELAY_MS)
        setTimerId(newTimerId)
      }
    }
  })

  return (
    <ThemedScene onBack={handleBack} title={s.strings.choose_title_username}>
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
            onChangeText={handleChangeText}
            onSubmitEditing={handleNext}
            returnKeyType="go"
            marginRem={1}
            value={username ?? ''}
            clearIcon={!isFetchingAvailability}
            showSpinner={isFetchingAvailability}
            editableOnSpinner
            error={errorText}
            valid={availableText}
            searchIcon={false}
          />
          <MainButton
            alignSelf="center"
            label={s.strings.next_label}
            type="secondary"
            marginRem={[1.5, 0.5]}
            disabled={isNextDisabled}
            onPress={handleNext}
          />
        </KeyboardAwareScrollView>
      </View>
    </ThemedScene>
  )
}

const isAscii = (text: string): boolean => {
  return /^[\x20-\x7E]*$/.test(text)
}

const getUsernameFormatError = (text: string): null | string => {
  if (text.length < 3) {
    return s.strings.username_3_characters_error
  } else if (!isAscii(text)) {
    return s.strings.username_ascii_error
  } else {
    return null
  }
}

/**
 * Sets the username if available and proceeds to password creation.
 */
function completeUsername(username: string) {
  return (dispatch: Dispatch): void => {
    logEvent(`Signup_Username_Available`)
    dispatch({ type: 'CREATE_UPDATE_USERNAME', data: { username } })
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'newAccountPassword', params: {} }
    })
  }
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
