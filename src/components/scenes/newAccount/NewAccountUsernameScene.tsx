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
import { logEvent } from '../../../util/analytics'
import { Theme, useTheme } from '../../services/ThemeContext'
import { EdgeText } from '../../themed/EdgeText'
import { MainButton } from '../../themed/MainButton'
import { OutlinedTextInput } from '../../themed/OutlinedTextInput'
import { ThemedScene } from '../../themed/ThemedScene'

interface Props {
  branding: Branding
}
const AVAILABILITY_CHECK_DELAY_MS = 400

type Timeout = ReturnType<typeof setTimeout>

export const NewAccountUsernameScene = ({ branding }: Props) => {
  const dispatch = useDispatch()
  const theme = useTheme()
  const styles = getStyles(theme)

  const [username, setUsername] = React.useState('')
  const [timerId, setTimerId] = React.useState<Timeout | undefined>(undefined)
  const [isNextInProgress, setIsNextInProgress] = React.useState<boolean>(false)
  const [availableStatus, setAvailableStatus] = React.useState<
    boolean | undefined
  >(false) // True/false on completed check, undefined if unchecked
  const [availableText, setAvailableText] = React.useState<string | undefined>(
    undefined
  )
  const [errorText, setErrorText] = React.useState<string | undefined>(
    undefined
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
    if (!mounted.current) return false
    setAvailableStatus(undefined)

    const isAvailable = await dispatch(fetchIsUsernameAvailable(username))

    if (!mounted.current) return false
    setAvailableStatus(isAvailable)
    return isAvailable
  }

  // Special considerations for the call to action (next) button:
  // 1. We want to avoid making the user wait for a fetch to check username
  //    availability if the fetch was already done prior to pressing the button.
  // 2. If the user quickly tapped next right after their last keyboard input,
  //    before waiting for the username availability check, then we want to
  //    check availability before proceeding past the scene
  const handleBack = useHandler(() => {
    dispatch(maybeRouteComplete({ type: 'NEW_ACCOUNT_WELCOME' }))
  })

  const handleNext = useHandler(async () => {
    setIsNextInProgress(true)
    const isNextSuccess =
      availableStatus == null
        ? await fetchIsAvailable(username)
        : availableStatus
    if (isNextSuccess) dispatch(completeUsername(username))

    if (!mounted.current) return
    setIsNextInProgress(false)
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
    setAvailableStatus(undefined)

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
          // If the user pressed next before this timer triggered, we're already
          // checking availability on the most recent input
          if (!mounted.current || isNextInProgress) return

          // Tag this fetch with a "counter ID" and sync with the outer context
          fetchCounter.current++
          const localCounter = fetchCounter

          const isAvailable = await fetchIsAvailable(text)

          // This fetch is stale. Another fetch began before this one had a
          // chance to finish. Discard this result.
          if (localCounter !== fetchCounter) return

          // If the counter from the outer context matches this local counter,
          // it means no new fetches began during the execution of
          // fetchIsAvailable.

          // Update UI elements
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
            clearIcon={availableStatus != null}
            showSpinner={availableStatus == null}
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
            disabled={errorText != null || username.length === 0}
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
    dispatch({ type: 'NEW_ACCOUNT_PASSWORD' })
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
