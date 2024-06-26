import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import { maybeRouteComplete } from '../../../actions/LoginInitActions'
import { lstrings } from '../../../common/locales/strings'
import { useHandler } from '../../../hooks/useHandler'
import { useImports } from '../../../hooks/useImports'
import { Branding } from '../../../types/Branding'
import { useDispatch } from '../../../types/ReduxTypes'
import { SceneProps } from '../../../types/routerTypes'
import { EdgeAnim } from '../../common/EdgeAnim'
import { SceneButtons } from '../../common/SceneButtons'
import { Theme, useTheme } from '../../services/ThemeContext'
import { EdgeText } from '../../themed/EdgeText'
import { FilledTextInput } from '../../themed/FilledTextInput'
import { ThemedScene } from '../../themed/ThemedScene'

export interface NewAccountUsernameParams {
  password?: string
  pin?: string
  username?: string
}

export interface UpgradeUsernameParams {
  account: EdgeAccount
  password?: string
  username?: string
}

const AVAILABILITY_CHECK_DELAY_MS = 400

type Timeout = ReturnType<typeof setTimeout>

interface Props {
  branding: Branding
  initUsername?: string
  onBack?: () => void
  onNext: (username: string) => void | Promise<void>
}

export const ChangeUsernameComponent = (props: Props) => {
  const { branding, initUsername, onBack, onNext } = props

  const imports = useImports()
  const theme = useTheme()
  const styles = getStyles(theme)

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
    if (onBack != null) onBack()
  })
  const handleNext = useHandler(async () => {
    if (!isNextDisabled) onNext(username)
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

          const isAvailable = await imports.context.usernameAvailable(text)
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
          if (isAvailable) {
            setErrorText(undefined)
            setAvailableText(lstrings.username_available)
          } else setErrorText(lstrings.username_exists_error)
        }, AVAILABILITY_CHECK_DELAY_MS)
        setTimerId(newTimerId)
      }
    }
  })

  return (
    <ThemedScene onBack={handleBack} title={lstrings.choose_title_username}>
      <View style={styles.content}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.mainScrollView}
          keyboardShouldPersistTaps="handled"
        >
          <EdgeAnim enter={{ type: 'fadeInUp', distance: 50 }}>
            <EdgeText style={styles.description} numberOfLines={2}>
              {sprintf(
                lstrings.username_desc,
                branding.appName || lstrings.app_name_default
              )}
            </EdgeText>
          </EdgeAnim>
          <EdgeAnim enter={{ type: 'fadeInDown', distance: 25 }}>
            <FilledTextInput
              around={1}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              placeholder={lstrings.username}
              onChangeText={handleChangeText}
              onSubmitEditing={handleNext}
              returnKeyType="go"
              value={username ?? ''}
              clearIcon={!isFetchingAvailability}
              showSpinner={isFetchingAvailability}
              error={errorText}
              valid={availableText}
            />
          </EdgeAnim>
          <SceneButtons
            primary={{
              label: lstrings.next_label,
              onPress: handleNext,
              disabled: isNextDisabled
            }}
            animDistanceStart={50}
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
    return lstrings.username_3_characters_error
  } else if (!isAscii(text)) {
    return lstrings.username_ascii_error
  } else {
    return null
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

/**
 * The username creation scene for new accounts.
 */
interface NewAccountUsernameProps extends SceneProps<'newAccountUsername'> {
  branding: Branding
}
export const NewAccountUsernameScene = (props: NewAccountUsernameProps) => {
  const { branding, route } = props
  const dispatch = useDispatch()
  const { onLogEvent = () => {} } = useImports()

  const handleBack = useHandler(() => {
    dispatch(
      maybeRouteComplete({
        type: 'NAVIGATE',
        data: { name: 'passwordLogin', params: { username: '' } }
      })
    )
  })

  const handleNext = useHandler((newUsername: string) => {
    onLogEvent(`Signup_Username_Available`)
    dispatch({
      type: 'NAVIGATE',
      data: {
        name: 'newAccountPassword',
        params: { ...route.params, username: newUsername }
      }
    })
  })

  return (
    <ChangeUsernameComponent
      initUsername={route.params.username}
      branding={branding}
      onBack={handleBack}
      onNext={handleNext}
    />
  )
}

/**
 * The change username scene for (light) accounts.
 */
interface UpgradeUsernameProps extends SceneProps<'upgradeUsername'> {
  branding: Branding
}
export const UpgradeUsernameScene = (props: UpgradeUsernameProps) => {
  const { branding, route } = props
  const dispatch = useDispatch()
  const { onComplete = () => {}, onLogEvent = () => {} } = useImports()

  const handleNext = useHandler(async (newUsername: string) => {
    onLogEvent(`Backup_Username_Available`)
    dispatch({
      type: 'NAVIGATE',
      data: {
        name: 'upgradePassword',
        params: { ...route.params, username: newUsername }
      }
    })
  })

  return (
    <ChangeUsernameComponent
      initUsername=""
      branding={branding}
      onNext={handleNext}
      onBack={onComplete}
    />
  )
}
