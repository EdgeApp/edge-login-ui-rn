import {
  asMaybeNetworkError,
  asMaybeOtpError,
  asMaybePasswordError,
  asMaybeUsernameError,
  EdgeAccount,
  EdgeUserInfo,
  NetworkError
} from 'edge-core-js'
import * as React from 'react'
import { Keyboard, LayoutChangeEvent, Platform, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import { SvgXml } from 'react-native-svg'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { sprintf } from 'sprintf-js'

import { launchPasswordRecovery } from '../../actions/LoginAction'
import { completeLogin } from '../../actions/LoginCompleteActions'
import { FaceIdXml } from '../../assets/xml/FaceId'
import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { useImports } from '../../hooks/useImports'
import { LoginUserInfo, useLocalUsers } from '../../hooks/useLocalUsers'
import { getLoginKey } from '../../keychain'
import { formatNumber } from '../../locales/intl'
import { Branding } from '../../types/Branding'
import { useDispatch, useSelector } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { base58 } from '../../util/base58'
import { attemptLogin, LoginAttempt } from '../../util/loginAttempt'
import { FourDigitDisplay } from '../abSpecific/FourDigitDisplay'
import { LogoImageHeader } from '../abSpecific/LogoImageHeader'
import { PinKeypad } from '../abSpecific/PinKeypad'
import { UserListItem } from '../abSpecific/UserListItem'
import { ButtonsView } from '../buttons/ButtonsView'
import { EdgeAnim } from '../common/EdgeAnim'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { UnscaledText } from '../common/UnscaledText'
import { ChevronDownIcon, ChevronUpIcon } from '../icons/ThemedIcons'
import { ButtonsModal } from '../modals/ButtonsModal'
import { retryOnChallenge } from '../modals/ChallengeModal'
import { GradientFadeOut } from '../modals/GradientFadeout'
import { LoginHelpModal } from '../modals/LoginHelpModal'
import { QrCodeModal } from '../modals/QrCodeModal'
import { TextInputModal } from '../modals/TextInputModal'
import { Airship, showError, showToast } from '../services/AirshipInstance'
import { cacheStyles, Theme, useTheme } from '../services/ThemeContext'
import { FilledTextInput, FilledTextInputRef } from '../themed/FilledTextInput'
import { LoginFlavor, LoginFlavorToggle } from '../themed/LoginFlavorToggle'
import { ThemedScene } from '../themed/ThemedScene'

const MAX_DISPLAYED_LOCAL_USERS = 5

export interface LoginParams {
  loginId?: string
  username?: string
  /**
   * Start in the password flavor even when the selected user has PIN/biometric
   * enabled (used by the `login-password` initial route and the flows that fall
   * back to password entry).
   */
  passwordOnly?: boolean
}

interface Props extends SceneProps<'login'> {
  branding: Branding
}

interface PinErrorInfo {
  message: string
  wait: number
}

export const LoginScene = (props: Props): React.ReactElement => {
  const { branding, route } = props
  const {
    loginId: initialLoginId,
    username: initialUsername = '',
    passwordOnly = false
  } = route.params
  const {
    accountOptions,
    context,
    forceLightAccountCreate = false,
    onComplete,
    onLogEvent = () => {},
    onPerfEvent
  } = useImports()

  const dispatch = useDispatch()
  const theme = useTheme()
  const styles = getStyles(theme)

  const localUsers = useLocalUsers()
  const hasMultipleUsers = localUsers.length > 1
  const hasSavedUsers = localUsers.length > 0

  // Resolve the user identified by the route params, used to seed local state:
  const initialUser = React.useMemo<LoginUserInfo | undefined>(
    () => findSeedUser(localUsers, initialLoginId, initialUsername),
    // Only seed on mount; selection afterwards is managed in local state and
    // re-seeded by the route-params effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const initialPinEnabled =
    initialUser != null &&
    (initialUser.pinLoginEnabled || initialUser.touchLoginEnabled)

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------

  const [flavor, setFlavor] = React.useState<LoginFlavor>(
    !passwordOnly && initialPinEnabled ? 'pin' : 'password'
  )
  const [activeLoginId, setActiveLoginId] = React.useState<string | undefined>(
    initialUser?.loginId ?? initialLoginId
  )
  const [activeUsername, setActiveUsername] = React.useState(
    initialUser?.username ?? initialUsername
  )

  const [password, setPassword] = React.useState('')
  const [pin, setPin] = React.useState('')
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState<
    string | undefined
  >(undefined)
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState<
    string | undefined
  >(undefined)
  const [pinErrorInfo, setPinErrorInfo] = React.useState<
    PinErrorInfo | undefined
  >(undefined)
  const [spinner, setSpinner] = React.useState(false)
  const [biometricBusy, setBiometricBusy] = React.useState(false)
  const [showUsernameList, setShowUsernameList] = React.useState(false)
  const [inputHeight, setInputHeight] = React.useState(0)
  const [usernameItemHeight, setUsernameItemHeight] = React.useState(0)
  const [isScrollEnabled, setIsScrollEnabled] = React.useState(true)
  const [scrollViewHeight, setScrollViewHeight] = React.useState(0)
  const [contentHeight, setContentHeight] = React.useState(0)

  const passwordInputRef = React.useRef<FilledTextInputRef>(null)
  const lastParamsKey = React.useRef(
    paramsKey(initialLoginId, initialUsername, passwordOnly)
  )
  // Once the user picks a flavor (toggle, user selection, or typing), stop
  // deriving it from the resolved account:
  const hasPickedFlavorRef = React.useRef(false)

  // ---------------------------------------------------------------------
  // Selectors / derived
  // ---------------------------------------------------------------------

  const biometryType = useSelector(state => state.touch.biometryType)

  const activeUser = React.useMemo<LoginUserInfo | undefined>(() => {
    if (activeLoginId != null) {
      const byId = localUsers.find(user => user.loginId === activeLoginId)
      if (byId != null) return byId
    }
    if (activeUsername !== '') {
      return localUsers.find(user => user.username === activeUsername)
    }
    return undefined
  }, [localUsers, activeLoginId, activeUsername])

  const pinEnabled =
    activeUser != null &&
    (activeUser.pinLoginEnabled || activeUser.touchLoginEnabled)
  const hasWait = pinErrorInfo != null && pinErrorInfo.wait > 0
  const isBiometricDisabled = pin.length === 4 || biometricBusy

  const mDropContainerStyle = React.useMemo(() => {
    return { top: inputHeight }
  }, [inputHeight])

  const dropdownButtonPositionStyle = React.useMemo(() => {
    return { top: inputHeight / 2 }
  }, [inputHeight])

  const sAnimationMult = useSharedValue(0)
  const sScrollY = useSharedValue(0)

  const dFinalHeight = useDerivedValue(() => {
    return (
      usernameItemHeight *
      Math.min(localUsers.length, MAX_DISPLAYED_LOCAL_USERS)
    )
  }, [usernameItemHeight, localUsers])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e: { contentOffset: { y: number } }) => {
      sScrollY.value = e.contentOffset.y
    }
  })

  // Gradually hide the bottom ScrollView gradient as the last item scrolls into
  // view:
  const aGradientOpacity = useAnimatedStyle(() => {
    if (MAX_DISPLAYED_LOCAL_USERS > localUsers.length) return { opacity: 0 }

    const minScroll =
      usernameItemHeight * (localUsers.length - MAX_DISPLAYED_LOCAL_USERS - 1)
    const maxScroll =
      usernameItemHeight * (localUsers.length - MAX_DISPLAYED_LOCAL_USERS)

    return {
      opacity: interpolate(
        sScrollY.value,
        [minScroll, maxScroll],
        [1, 0],
        Extrapolate.CLAMP
      )
    }
  })

  const aDropContainerStyle = useAnimatedStyle(
    () => ({
      height: dFinalHeight.value * sAnimationMult.value,
      opacity: showUsernameList
        ? withTiming(1, { duration: 50, easing: Easing.exp })
        : withTiming(0, { duration: 200, easing: Easing.exp })
    }),
    [showUsernameList]
  )

  // ---------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------

  const handleScrollViewLayout = useHandler((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout
    setScrollViewHeight(height)
    setIsScrollEnabled(contentHeight > height)
  })

  const handleContentLayout = useHandler((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout
    setContentHeight(height)
    setIsScrollEnabled(height > scrollViewHeight)
  })

  const handleUsernameLayout = useHandler((event: LayoutChangeEvent) => {
    setInputHeight(event.nativeEvent.layout.height)
  })

  const handleDropdownItemLayout = useHandler((event: LayoutChangeEvent) => {
    if (event != null && usernameItemHeight === 0) {
      const { height } = event.nativeEvent.layout
      setUsernameItemHeight(height)
    }
  })

  const handleToggleUsernameList = useHandler(() => {
    if (!showUsernameList) Keyboard.dismiss()
    setShowUsernameList(!showUsernameList)
  })

  const handleSelectPassword = useHandler(() => {
    hasPickedFlavorRef.current = true
    setShowUsernameList(false)
    setFlavor('password')
    setPinErrorInfo(undefined)
  })

  const handleSelectPin = useHandler(() => {
    if (!pinEnabled) {
      showToast(lstrings.pin_not_enabled_enter_password)
      return
    }
    hasPickedFlavorRef.current = true
    setShowUsernameList(false)
    setFlavor('pin')
    setPin('')
    setPasswordErrorMessage(undefined)
  })

  const handleSelectUser = useHandler((userInfo: LoginUserInfo) => {
    hasPickedFlavorRef.current = true
    setShowUsernameList(false)
    setActiveLoginId(userInfo.loginId)
    setActiveUsername(userInfo.username ?? '')
    setPassword('')
    setPin('')
    setPinErrorInfo(undefined)
    setPasswordErrorMessage(undefined)
    setUsernameErrorMessage(undefined)

    const nextPinEnabled =
      userInfo.pinLoginEnabled || userInfo.touchLoginEnabled
    if (nextPinEnabled && userInfo.username == null) {
      // Guest/light accounts have no username, so password login is impossible:
      // jump straight to the PIN/biometric flavor.
      setFlavor('pin')
    } else if (flavor === 'pin' && !nextPinEnabled) {
      // Auto-toggle back to the password flavor with the selected username:
      setFlavor('password')
      showToast(lstrings.pin_not_enabled_enter_password)
    }
  })

  const handleChangeUsername = useHandler((text: string) => {
    hasPickedFlavorRef.current = true
    setShowUsernameList(false)
    setActiveLoginId(undefined)
    setActiveUsername(text.toLowerCase())
    setPasswordErrorMessage(undefined)
    setUsernameErrorMessage(undefined)
  })

  const handleDelete = useHandler((userInfo: LoginUserInfo) => {
    Keyboard.dismiss()
    Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={lstrings.forget_account}
        message={sprintf(
          lstrings.forget_username_account,
          getDisplayUsername(userInfo)
        )}
        buttons={{
          ok: { label: lstrings.forget },
          cancel: { label: lstrings.cancel, type: 'secondary' }
        }}
      />
    ))
      .then(async button => {
        if (button !== 'ok') return
        if (context.forgetAccount != null) {
          await context.forgetAccount(userInfo.loginId)
        } else {
          const { username } = userInfo
          if (username == null) throw new Error('No username')
          // @ts-expect-error This legacy method has been removed:
          await context.deleteLocalAccount(username)
        }
        setShowUsernameList(false)

        // If we forgot the active user, move the selection to a remaining
        // account so PIN/biometric login no longer targets the removed loginId:
        if (userInfo.loginId === activeLoginId) {
          const nextUser = localUsers.find(
            user => user.loginId !== userInfo.loginId
          )
          // Treat this as a deliberate flavor resolution for the remaining
          // account, so the route-param re-seed effect (which derives flavor
          // from the now-stale `initialLoginId`/`initialUsername`) does not
          // override it and force the password flavor on a PIN-capable account:
          hasPickedFlavorRef.current = true
          setActiveLoginId(nextUser?.loginId)
          setActiveUsername(nextUser?.username ?? '')
          setPassword('')
          setPin('')
          setPinErrorInfo(undefined)
          const nextPinEnabled =
            nextUser != null &&
            (nextUser.pinLoginEnabled || nextUser.touchLoginEnabled)
          if (flavor === 'pin' && !nextPinEnabled) {
            setFlavor('password')
          }
        }
      })
      .catch((err: unknown) => {
        if (asMaybeNetworkError(err) != null) {
          showError(lstrings.network_error_generic)
          return
        }
        showError(err)
      })
  })

  const handlePasswordChange = useHandler((value: string) => {
    // Typing a password is a deliberate commitment to the password flavor, so
    // stop the route re-seed effect from deriving the flavor (and hiding the
    // password UI) if `localUsers` / biometry state resolves mid-entry:
    hasPickedFlavorRef.current = true
    setPasswordErrorMessage(undefined)
    setPassword(value)
  })

  const handleSubmitUsername = useHandler(() => {
    if (passwordInputRef.current != null) passwordInputRef.current.focus()
  })

  const handleSubmitPassword = useHandler(() => {
    const otpAttempt: LoginAttempt = {
      type: 'password',
      username: activeUsername,
      password
    }

    setSpinner(true)
    retryOnChallenge({
      cancelValue: undefined,
      async task(challengeId) {
        Keyboard.dismiss()
        const account = await attemptLogin(
          context,
          otpAttempt,
          {
            ...accountOptions,
            challengeId
          },
          onPerfEvent
        )
        onPerfEvent({ name: 'passwordLoginEnd' })
        onLogEvent('Pasword_Login')
        await dispatch(completeLogin(account))
      }
    })
      .catch(async error => {
        onPerfEvent({ name: 'passwordLoginEnd', error })

        const otpError = asMaybeOtpError(error)
        if (otpError != null) {
          dispatch({
            type: 'NAVIGATE',
            data: { name: 'otpError', params: { otpAttempt, otpError } }
          })
          return
        }

        const usernameError = asMaybeUsernameError(error)
        if (usernameError != null) {
          setUsernameErrorMessage(lstrings.invalid_account)
          return
        }

        const passwordError = asMaybePasswordError(error)
        if (passwordError != null) {
          const { wait } = passwordError
          if (wait != null && wait >= 0.1) {
            setPasswordErrorMessage(
              sprintf(
                lstrings.password_wait_1s,
                formatNumber(wait, { maxDecimals: 1 })
              )
            )
          } else {
            setPasswordErrorMessage(lstrings.invalid_credentials)
          }
          return
        }

        if (asMaybeNetworkError(error) != null) {
          setPasswordErrorMessage(lstrings.network_error_generic)
          return
        }

        console.warn('Unknown login error: ', error)
        setPasswordErrorMessage(
          error instanceof Error ? error.message : undefined
        )
      })
      .finally(() => setSpinner(false))
  })

  const handleCreateAccount = useHandler(() => {
    onLogEvent('Password_Login_Create_Account')
    dispatch({
      type: 'NAVIGATE',
      data: forceLightAccountCreate
        ? { name: 'newAccountPin', params: {} }
        : { name: 'newAccountUsername', params: {} }
    })
  })

  const handleSubmitRecoveryKey = useHandler(
    async (recoveryKey: string): Promise<boolean | string> => {
      recoveryKey = recoveryKey
        .replace('edge://recovery?token=', '')
        .replace('edgesecure://recovery?token=', '')
        .replace('https://deep.edge.app/recovery#', '')
        .replace('https://recovery.edgesecure.co/recovery?token=', '')

      if (base58.parseUnsafe(recoveryKey)?.length !== 32)
        return lstrings.recovery_token_invalid
      dispatch(launchPasswordRecovery(recoveryKey)).catch((err: unknown) => {
        if (asMaybeNetworkError(err) != null) {
          showError(lstrings.network_error_generic)
          return
        }
        showError(err)
      })
      return true
    }
  )

  const handleRecovery = useHandler(
    async (): Promise<void> => {
      onLogEvent('Password_Login_Forgot_Password')
      await Airship.show(bridge => (
        <TextInputModal
          bridge={bridge}
          onSubmit={handleSubmitRecoveryKey}
          title={lstrings.password_recovery}
          message={lstrings.initiate_password_recovery}
          inputLabel={lstrings.recovery_token}
        />
      ))
    }
  )

  const handleQrModal = useHandler(
    async (): Promise<void> => {
      const account = await Airship.show<EdgeAccount | undefined>(bridge => (
        <QrCodeModal
          bridge={bridge}
          accountOptions={accountOptions}
          context={context}
        />
      ))
      if (account != null) await dispatch(completeLogin(account))
    }
  )

  const handleTroubleSigningIn = useHandler(() => {
    Keyboard.dismiss()
    Airship.show<'qr' | 'recovery' | undefined>(bridge => (
      <LoginHelpModal bridge={bridge} />
    ))
      .then(async result => {
        if (result === 'qr') await handleQrModal()
        else if (result === 'recovery') await handleRecovery()
      })
      .catch((err: unknown) => {
        if (asMaybeNetworkError(err) != null) {
          showError(lstrings.network_error_generic)
          return
        }
        showError(err)
      })
  })

  const handlePinLogin = useHandler(
    async (userInfo: LoginUserInfo, newPin: string): Promise<void> => {
      try {
        const { loginId } = userInfo
        onPerfEvent({ name: 'pinLoginBegin' })
        const account = await context.loginWithPIN(loginId, newPin, {
          ...accountOptions,
          useLoginId: true
        })
        onPerfEvent({ name: 'pinLoginEnd' })
        await dispatch(completeLogin(account))
      } catch (error: unknown) {
        onPerfEvent({ name: 'pinLoginEnd', error })

        const passwordError = asMaybePasswordError(error)
        const usernameError = asMaybeUsernameError(error)
        const networkError = asMaybeNetworkError(error)
        setPinErrorInfo({
          message:
            passwordError != null
              ? lstrings.invalid_pin
              : usernameError != null
              ? lstrings.pin_not_enabled
              : networkError != null
              ? translateNetworkError(networkError, userInfo)
              : error instanceof Error
              ? error.message
              : String(error),
          wait: Math.ceil(passwordError?.wait ?? 0)
        })
        setPin('')
        setBiometricBusy(false)
      }
    }
  )

  const handleBiometricLogin = useHandler(
    async (userInfo: EdgeUserInfo): Promise<void> => {
      if (biometricBusy) return
      setBiometricBusy(true)

      try {
        const { loginId } = userInfo
        const loginKey = await getLoginKey(
          userInfo,
          `Touch to login user: "${getDisplayUsername(userInfo)}"`,
          lstrings.login_with_password
        )
        if (loginKey == null) return

        const account = await context.loginWithKey(loginId, loginKey, {
          ...accountOptions,
          useLoginId: true
        })
        onLogEvent('Biometric_Login')
        await dispatch(completeLogin(account))
      } finally {
        setBiometricBusy(false)
      }
    }
  )

  const handleBiometricId = useHandler(() => {
    if (activeUser == null) return
    handleBiometricLogin(activeUser).catch((err: unknown) => {
      if (asMaybeNetworkError(err) != null) {
        showError(lstrings.network_error_generic)
        return
      }
      showError(err)
    })
  })

  const handleKeypadPress = useHandler((value: string) => {
    const newPin =
      value === 'back' ? pin.slice(0, -1) : pin.concat(value).slice(0, 4)
    setPin(newPin)
    setPinErrorInfo(undefined)
    if (newPin.length === 4 && pin.length === 3 && activeUser != null) {
      handlePinLogin(activeUser, newPin)
        .then(() => {
          onLogEvent('Pin_Login')
        })
        .catch(showError)
    }
  })

  const handleBack = useHandler(() => {
    if (onComplete != null) onComplete()
    else {
      dispatch({
        type: 'NAVIGATE',
        data: { name: 'landing', params: {} }
      })
    }
  })

  // ---------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------

  // Animate the username dropdown in/out:
  React.useEffect(() => {
    sAnimationMult.value = withTiming(showUsernameList ? 1 : 0, {
      duration: 250,
      easing: Easing.inOut(Easing.circle)
    })
  }, [sAnimationMult, showUsernameList])

  // Make scene scrollability react to keyboard visibility:
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: { endCoordinates: { height: number } }) => {
        setIsScrollEnabled(
          contentHeight > scrollViewHeight - e.endCoordinates.height
        )
      }
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsScrollEnabled(contentHeight > scrollViewHeight)
      }
    )

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [contentHeight, scrollViewHeight])

  // Countdown timer for the PIN lockout:
  React.useEffect(() => {
    if (pinErrorInfo == null || pinErrorInfo.wait <= 0) return

    const id = setTimeout(() => {
      setPinErrorInfo({ ...pinErrorInfo, wait: pinErrorInfo.wait - 1 })
    }, 1000)

    return () => clearTimeout(id)
  }, [pinErrorInfo])

  // Re-seed the scene when a new NAVIGATE to `login` changes the route params
  // (the router reuses this component instance across same-name navigations, so
  // mount-time seeding does not re-run), and keep the default flavor in sync
  // with the resolved account until the user picks one (covers `localUsers` /
  // biometry state resolving after mount):
  React.useEffect(() => {
    const nextKey = paramsKey(initialLoginId, initialUsername, passwordOnly)
    const seedUser = findSeedUser(localUsers, initialLoginId, initialUsername)

    if (lastParamsKey.current !== nextKey) {
      lastParamsKey.current = nextKey
      hasPickedFlavorRef.current = false
      setActiveLoginId(seedUser?.loginId ?? initialLoginId)
      setActiveUsername(seedUser?.username ?? initialUsername)
      setPassword('')
      setPin('')
      setPinErrorInfo(undefined)
      setPasswordErrorMessage(undefined)
      setUsernameErrorMessage(undefined)
      setShowUsernameList(false)
    }

    if (!hasPickedFlavorRef.current) {
      const seedPinEnabled =
        seedUser != null &&
        (seedUser.pinLoginEnabled || seedUser.touchLoginEnabled)
      setFlavor(!passwordOnly && seedPinEnabled ? 'pin' : 'password')
    }
  }, [initialLoginId, initialUsername, passwordOnly, localUsers])

  // For a loginId-only navigation, `activeUsername` starts empty and the user is
  // resolved by `activeLoginId` once `localUsers` loads. Backfill the username so
  // the password flavor (which binds to `activeUsername`) shows it and can log in.
  // The `activeLoginId != null` guard keeps this from clobbering a typed username
  // (typing clears `activeLoginId`):
  React.useEffect(() => {
    if (
      activeLoginId != null &&
      activeUsername === '' &&
      activeUser?.username != null
    ) {
      setActiveUsername(activeUser.username)
    }
  }, [activeUser, activeLoginId, activeUsername])

  // ---------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------

  const renderUsername = (): React.ReactElement => {
    const usernameLabel =
      activeUsername !== '' ? activeUsername : getDisplayUsername(activeUser)

    if (flavor === 'pin') {
      if (!hasMultipleUsers) {
        return (
          <View style={styles.inputWrapper} onLayout={handleUsernameLayout}>
            <View style={styles.pinUsernamePlain}>
              <UnscaledText
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                numberOfLines={1}
                style={styles.pinUsernamePlainText}
              >
                {usernameLabel}
              </UnscaledText>
            </View>
          </View>
        )
      }
      return (
        <View style={styles.inputWrapper} onLayout={handleUsernameLayout}>
          <EdgeTouchableOpacity
            testID="usernameDropdownButton"
            style={styles.pinUsernameBox}
            onPress={handleToggleUsernameList}
          >
            <UnscaledText
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              numberOfLines={1}
              style={styles.pinUsernameBoxText}
            >
              {usernameLabel}
            </UnscaledText>
            {showUsernameList ? (
              <ChevronUpIcon size={theme.rem(1.5)} style={styles.iconColor} />
            ) : (
              <ChevronDownIcon size={theme.rem(1.5)} style={styles.iconColor} />
            )}
          </EdgeTouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.inputWrapper}>
        <View onLayout={handleUsernameLayout}>
          <FilledTextInput
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={false}
            clearIcon={!hasSavedUsers}
            error={usernameErrorMessage}
            placeholder={lstrings.username}
            returnKeyType="next"
            testID="usernameFormField"
            value={activeUsername}
            onChangeText={handleChangeUsername}
            onSubmitEditing={handleSubmitUsername}
          />
        </View>
        {hasMultipleUsers ? (
          <EdgeTouchableOpacity
            testID="userDropdownIcon"
            style={[styles.dropdownButton, dropdownButtonPositionStyle]}
            onPress={handleToggleUsernameList}
          >
            {showUsernameList ? (
              <ChevronUpIcon size={theme.rem(1.5)} style={styles.iconColor} />
            ) : (
              <ChevronDownIcon size={theme.rem(1.5)} style={styles.iconColor} />
            )}
          </EdgeTouchableOpacity>
        ) : null}
      </View>
    )
  }

  const renderDropdownList = (): React.ReactElement => {
    return (
      <Animated.View
        style={[styles.dropContainer, mDropContainerStyle, aDropContainerStyle]}
      >
        <Animated.ScrollView
          keyboardShouldPersistTaps="always"
          scrollEventThrottle={1}
          onScroll={scrollHandler}
        >
          {localUsers.map(userInfo => (
            <UserListItem
              key={userInfo.loginId}
              userInfo={userInfo}
              onClick={handleSelectUser}
              onDelete={handleDelete}
              onLayout={handleDropdownItemLayout}
            />
          ))}
        </Animated.ScrollView>

        <Animated.View style={aGradientOpacity}>
          <GradientFadeOut />
        </Animated.View>
      </Animated.View>
    )
  }

  const renderPasswordBody = (): React.ReactElement => {
    return (
      <>
        <EdgeAnim enter={{ type: 'fadeInUp', distance: 20 }}>
          <View style={styles.inputWrapper}>
            <FilledTextInput
              ref={passwordInputRef}
              autoCorrect={false}
              autoFocus={false}
              error={passwordErrorMessage}
              maxLength={100}
              placeholder={lstrings.password}
              returnKeyType="done"
              secureTextEntry
              testID="passwordFormField"
              value={password}
              onChangeText={handlePasswordChange}
              onSubmitEditing={handleSubmitPassword}
            />
          </View>
        </EdgeAnim>
        <View style={styles.buttonsBox}>
          <EdgeAnim enter={{ type: 'fadeInDown', distance: 80 }}>
            <ButtonsView
              primary={{
                label: lstrings.login_button,
                onPress: handleSubmitPassword,
                disabled:
                  activeUsername.length === 0 ||
                  password.length === 0 ||
                  usernameErrorMessage != null ||
                  passwordErrorMessage != null,
                spinner
              }}
              secondary={{
                label: lstrings.landing_create_account_button,
                onPress: handleCreateAccount,
                disabled: spinner
              }}
            />
          </EdgeAnim>
        </View>
      </>
    )
  }

  const renderBiometricImage = (): React.ReactElement | null => {
    if (activeUser == null || !activeUser.touchLoginEnabled) return null

    if (biometryType === 'FaceID') {
      return (
        <EdgeTouchableOpacity
          onPress={handleBiometricId}
          disabled={isBiometricDisabled}
        >
          <SvgXml
            xml={FaceIdXml}
            color={theme.iconTappable}
            width={theme.rem(3)}
            height={theme.rem(3)}
          />
        </EdgeTouchableOpacity>
      )
    }
    if (biometryType === 'TouchID') {
      return (
        <EdgeTouchableOpacity
          onPress={handleBiometricId}
          disabled={isBiometricDisabled}
        >
          <MaterialCommunityIcons
            name="fingerprint"
            size={theme.rem(3)}
            color={theme.iconTappable}
          />
        </EdgeTouchableOpacity>
      )
    }
    return null
  }

  const renderBiometricImageText = (): string => {
    if (activeUser == null || !activeUser.touchLoginEnabled) return ''
    if (biometryType === 'FaceID') return lstrings.use_faceId
    if (biometryType === 'TouchID' && Platform.OS === 'ios')
      return lstrings.use_touchId
    if (biometryType === 'TouchID' && Platform.OS !== 'ios')
      return lstrings.use_fingerprint
    return ''
  }

  const renderPinBody = (): React.ReactElement => {
    let errorMessage = ''
    if (pinErrorInfo != null) {
      errorMessage = pinErrorInfo.message
      if (pinErrorInfo.wait > 0) {
        errorMessage +=
          ': ' + sprintf(lstrings.account_locked_for, pinErrorInfo.wait)
      }
    }

    const showKeypad = activeUser != null && activeUser.pinLoginEnabled

    return (
      <View style={styles.pinBody}>
        {!showKeypad ? (
          <View style={styles.pinSpacer} />
        ) : (
          <FourDigitDisplay
            error={errorMessage}
            pin={pin}
            spinner={hasWait || pin.length === 4}
          />
        )}
        <EdgeAnim enter={{ type: 'fadeInDown', distance: 20 }}>
          {renderBiometricImage()}
        </EdgeAnim>
        <EdgeAnim enter={{ type: 'fadeInDown', distance: 40 }}>
          <UnscaledText style={styles.biometricImageText}>
            {renderBiometricImageText()}
          </UnscaledText>
        </EdgeAnim>
        {!showKeypad ? null : (
          <EdgeAnim enter={{ type: 'fadeInDown', distance: 40 }}>
            <PinKeypad
              disabled={hasWait || pin.length === 4}
              onPress={handleKeypadPress}
            />
          </EdgeAnim>
        )}
      </View>
    )
  }

  return (
    <ThemedScene noUnderline branding={branding} onBack={handleBack}>
      <KeyboardAwareScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={isScrollEnabled}
        onLayout={handleScrollViewLayout}
      >
        <View onLayout={handleContentLayout}>
          <EdgeAnim
            style={styles.logoContainer}
            enter={{ type: 'fadeInUp', distance: 60 }}
          >
            <LogoImageHeader branding={branding} />
          </EdgeAnim>

          <EdgeAnim enter={{ type: 'fadeInUp', distance: 50 }}>
            <LoginFlavorToggle
              flavor={flavor}
              pinEnabled={pinEnabled}
              onSelectPassword={handleSelectPassword}
              onSelectPin={handleSelectPin}
            />
          </EdgeAnim>

          <View style={styles.inputContainer}>
            <EdgeAnim enter={{ type: 'fadeInUp', distance: 40 }}>
              {renderUsername()}
            </EdgeAnim>
            {renderDropdownList()}
            {flavor === 'password' ? renderPasswordBody() : renderPinBody()}
            <EdgeAnim enter={{ type: 'fadeInDown', distance: 80 }}>
              <EdgeTouchableOpacity
                accessible
                testID="troubleSigningIn"
                style={styles.troubleButton}
                onPress={handleTroubleSigningIn}
              >
                <UnscaledText style={styles.troubleText}>
                  {lstrings.trouble_signing_in}
                </UnscaledText>
              </EdgeTouchableOpacity>
            </EdgeAnim>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ThemedScene>
  )
}

const paramsKey = (
  loginId: string | undefined,
  username: string,
  passwordOnly: boolean
): string => `${loginId ?? ''} ${username} ${passwordOnly ? '1' : '0'}`

const findSeedUser = (
  localUsers: LoginUserInfo[],
  loginId: string | undefined,
  username: string
): LoginUserInfo | undefined => {
  if (loginId != null) {
    const byId = localUsers.find(user => user.loginId === loginId)
    if (byId != null) return byId
  }
  if (username !== '') {
    return localUsers.find(user => user.username === username)
  }
  return undefined
}

const getDisplayUsername = (
  userInfo?: LoginUserInfo | EdgeUserInfo
): string => {
  return (
    userInfo?.username ??
    sprintf(
      lstrings.guest_account_id_1s,
      userInfo?.loginId.slice(userInfo.loginId.length - 3) ?? ''
    )
  )
}

function translateNetworkError(
  error: NetworkError,
  userInfo: LoginUserInfo
): string {
  if (userInfo.username != null) {
    return sprintf(
      lstrings.network_error_generic_1s,
      lstrings.pin_network_error_full_password
    )
  }
  if (userInfo.keyLoginEnabled) {
    return sprintf(
      lstrings.network_error_generic_1s,
      lstrings.pin_network_error_biometric
    )
  }
  return error.message
}

const getStyles = cacheStyles((theme: Theme) => {
  const spaceAroundInputs = theme.rem(1)

  return {
    container: {
      flex: 1,
      paddingTop: theme.rem(2),
      paddingHorizontal: theme.rem(0.5)
    },
    // Adds breathing room below the logo so it does not crowd the flavor
    // toggle / first input. The logo asset carries little internal bottom
    // padding, so an explicit gap is needed for a ~1rem visual separation.
    logoContainer: {
      marginBottom: theme.rem(0.5)
    },
    inputContainer: {
      marginHorizontal: theme.rem(0.5),
      marginTop: theme.rem(1)
    },
    buttonsBox: {
      alignItems: 'center',
      marginTop: theme.rem(1)
    },
    inputWrapper: {
      position: 'relative',
      justifyContent: 'flex-start',
      padding: spaceAroundInputs
    },
    dropContainer: {
      backgroundColor: theme.modal,
      borderRadius: theme.rem(0.5),
      borderColor: theme.cardBorderColor,
      borderWidth: theme.thinLineWidth,
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      margin: theme.rem(1),
      marginTop: spaceAroundInputs + theme.rem(0.5),
      zIndex: 1
    },
    // TODO: Integrate dropdown into FilledTextInput
    dropdownButton: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      right: 0,
      width: theme.rem(2),
      height: theme.rem(2),
      marginTop: spaceAroundInputs - theme.rem(1),
      marginRight: spaceAroundInputs + theme.rem(0.5)
    },
    iconColor: {
      color: theme.textInputIconColor
    },
    pinUsernameBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.textInputBackgroundColor,
      borderRadius: theme.rem(0.5),
      paddingVertical: theme.rem(0.75),
      paddingHorizontal: theme.rem(1)
    },
    pinUsernameBoxText: {
      flex: 1,
      color: theme.primaryText,
      fontFamily: theme.fontFaceDefault,
      fontSize: theme.rem(1),
      marginRight: theme.rem(0.5)
    },
    pinUsernamePlain: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.rem(0.5)
    },
    pinUsernamePlainText: {
      color: theme.primaryText,
      fontFamily: theme.fontFaceDefault,
      fontSize: theme.rem(1.25)
    },
    pinBody: {
      alignItems: 'center',
      marginTop: theme.rem(1)
    },
    pinSpacer: {
      marginTop: theme.rem(2)
    },
    biometricImageText: {
      marginTop: theme.rem(0.5),
      color: theme.iconTappable
    },
    troubleButton: {
      alignItems: 'center',
      marginTop: theme.rem(1.5)
    },
    troubleText: {
      color: theme.linkText,
      fontFamily: theme.fontFaceDefault,
      fontSize: theme.rem(1)
    }
  }
})
