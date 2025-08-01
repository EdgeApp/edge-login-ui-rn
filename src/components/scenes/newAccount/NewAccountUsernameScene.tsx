import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import { maybeRouteComplete } from '../../../actions/LoginInitActions'
import { lstrings } from '../../../common/locales/strings'
import { useHandler } from '../../../hooks/useHandler'
import { useImports } from '../../../hooks/useImports'
import { useKeyboardPadding } from '../../../hooks/useKeyboardPadding'
import { Branding } from '../../../types/Branding'
import { useDispatch, useSelector } from '../../../types/ReduxTypes'
import { SceneProps } from '../../../types/routerTypes'
import { EdgeAnim } from '../../common/EdgeAnim'
import { SceneButtons } from '../../common/SceneButtons'
import { ChallengeModal, retryOnChallenge } from '../../modals/ChallengeModal'
import { Airship } from '../../services/AirshipInstance'
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
  title?: string
  onBack?: () => void
  onNext: (username: string) => void | Promise<void>
}

export const ChangeUsernameComponent = (props: Props) => {
  const { branding, initUsername, title, onBack, onNext } = props
  const { context } = useImports()
  const theme = useTheme()
  const styles = getStyles(theme)
  const keyboardPadding = useKeyboardPadding()
  const dispatch = useDispatch()

  const lastChallengeId =
    useSelector(state => state.createChallengeId) ?? undefined
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

  const fetchCounter = React.useRef<number>(0)
  const mounted = React.useRef<boolean>(true)

  React.useEffect(() => {
    if (lastChallengeId != null) return

    // Tag this fetch with a "counter ID" and sync with the outer context
    fetchCounter.current++
    const localCounter = fetchCounter.current

    context
      .fetchChallenge()
      .then(async challenge => {
        const { challengeId, challengeUri } = challenge

        // This fetch is stale, so discard the result.
        // Another fetch began before this one had a chance to finish.
        if (localCounter !== fetchCounter.current) return

        if (challengeUri != null) {
          const result = await Airship.show<boolean | undefined>(bridge => (
            <ChallengeModal bridge={bridge} challengeUri={challengeUri} />
          ))
          if (result !== true) return
        }
        dispatch({ type: 'CREATE_CHALLENGE', data: challengeId })
      })
      .catch(() => {
        // Automatic background task, so don't show error
      })
  }, [context, dispatch, lastChallengeId])

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
    errorText != null ||
    isFetchingAvailability ||
    timerId != null ||
    username.length === 0

  const handleNext = useHandler(async () => {
    if (!isNextDisabled) await onNext(username)
  })

  const handleChangeText = useHandler(async (text: string) => {
    if (!mounted.current) return

    // Clear the previous timer,
    if (timerId != null) {
      clearTimeout(timerId)
      setTimerId(undefined)
    }

    // Save the input and clear out previous text input status messages.
    setUsername(text.toLowerCase())
    setAvailableText(undefined)
    setErrorText(undefined)

    // Validate on the actual user input, including if the last character was
    // non-ASCII.
    if (text.length === 0) return

    // Validate username format client-side for length and ASCII-ness
    const invalidErrorMessage = getUsernameFormatError(text)
    if (invalidErrorMessage != null) {
      setAvailableText(undefined)
      setErrorText(invalidErrorMessage)
      return
    }

    // Check if username is available after a short delay after the last
    // typed character has been measured:
    const newTimerId = setTimeout(() => {
      if (!mounted.current) return

      // Tag this fetch with a "counter ID" and sync with the outer context
      fetchCounter.current++
      const localCounter = fetchCounter.current

      function onCheckDone(availableText?: string, errorText?: string) {
        if (!mounted.current) return

        // This fetch is stale, so discard the result.
        // Another fetch began before this one had a chance to finish.
        if (localCounter !== fetchCounter.current) return

        setIsFetchingAvailability(false)
        setTimerId(undefined)
        setAvailableText(availableText)
        setErrorText(errorText)
      }

      setIsFetchingAvailability(true)
      retryOnChallenge({
        cancelValue: undefined,
        saveChallenge(challengeId) {
          dispatch({ type: 'CREATE_CHALLENGE', data: challengeId })
        },
        async task(challengeId = lastChallengeId) {
          return await context.usernameAvailable(text, { challengeId })
        }
      }).then(
        isAvailable => {
          if (isAvailable == null) {
            return onCheckDone(lstrings.failed_captcha_error)
          }
          if (isAvailable) {
            return onCheckDone(lstrings.username_available)
          }
          onCheckDone(undefined, lstrings.username_exists_error)
        },
        error => onCheckDone(undefined, String(error))
      )
    }, AVAILABILITY_CHECK_DELAY_MS)
    setTimerId(newTimerId)
  })

  return (
    <ThemedScene onBack={onBack} title={title}>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.mainScrollView, keyboardPadding]}
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
            returnKeyType="next"
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
          animDistanceStart={0}
        />
      </KeyboardAwareScrollView>
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
  keyboardAvoidingView: {
    flex: 1
  },
  mainScrollView: {
    flexGrow: 1,
    alignContent: 'flex-start',
    marginHorizontal: theme.rem(0.5)
  },
  description: {
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
      title={lstrings.choose_title_username}
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
      title={lstrings.choose_title_username}
      branding={branding}
      onBack={onComplete}
      onNext={handleNext}
    />
  )
}
