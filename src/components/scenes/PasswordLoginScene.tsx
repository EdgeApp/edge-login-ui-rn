import {
  asMaybeChallengeError,
  asMaybeOtpError,
  asMaybePasswordError,
  asMaybeUsernameError,
  EdgeAccount
} from 'edge-core-js'
import * as React from 'react'
import { Keyboard, LayoutChangeEvent, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { cacheStyles } from 'react-native-patina'
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
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import { sprintf } from 'sprintf-js'

import { launchPasswordRecovery } from '../../actions/LoginAction'
import { completeLogin } from '../../actions/LoginCompleteActions'
import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { useImports } from '../../hooks/useImports'
import { LoginUserInfo, useLocalUsers } from '../../hooks/useLocalUsers'
import { Branding } from '../../types/Branding'
import { useDispatch } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { base58 } from '../../util/base58'
import { attemptLogin, LoginAttempt } from '../../util/loginAttempt'
import { LogoImageHeader } from '../abSpecific/LogoImageHeader'
import { UserListItem } from '../abSpecific/UserListItem'
import { EdgeAnim } from '../common/EdgeAnim'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { ButtonsModal } from '../modals/ButtonsModal'
import { ChallengeModal } from '../modals/ChallengeModal'
import { GradientFadeOut } from '../modals/GradientFadeout'
import { QrCodeModal } from '../modals/QrCodeModal'
import { TextInputModal } from '../modals/TextInputModal'
import { CreateAccountType } from '../publicApi/publicTypes'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { FilledTextInput, FilledTextInputRef } from '../themed/FilledTextInput'
import { ThemedScene } from '../themed/ThemedScene'
import { ButtonsViewUi4 } from '../ui4/ButtonsViewUi4'

const MAX_DISPLAYED_LOCAL_USERS = 5

export interface PasswordLoginParams {
  username: string
  createAccountType?: CreateAccountType
}

interface Props extends SceneProps<'passwordLogin'> {
  branding: Branding
}

export const PasswordLoginScene = (props: Props) => {
  const { branding, route } = props
  const { username, createAccountType = 'full' } = route.params
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
  const hasSavedUsers = localUsers.length > 0

  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState<
    string | undefined
  >(undefined)
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState<
    string | undefined
  >(undefined)
  const [password, setPassword] = React.useState('')
  const [spinner, setSpinner] = React.useState<boolean>(false)
  const [showUsernameList, setShowUsernameList] = React.useState(false)
  const [inputHeight, setInputHeight] = React.useState(0)
  const [usernameItemHeight, setUsernameItemHeight] = React.useState(0)
  const [isScrollEnabled, setIsScrollEnabled] = React.useState(true)
  const [scrollViewHeight, setScrollViewHeight] = React.useState(0)
  const [contentHeight, setContentHeight] = React.useState(0)

  const passwordInputRef = React.useRef<FilledTextInputRef>(null)

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
  // view
  const aGradientOpacity = useAnimatedStyle(() => {
    // Always hide the bottom ScrollView gradient if there's no entries below
    // the lower bound of the ScrollView
    if (MAX_DISPLAYED_LOCAL_USERS > localUsers.length) return { opacity: 0 }

    // Define the bounds at which the opacity should begin to change
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

  const handleScrollViewLayout = (event: {
    nativeEvent: { layout: { height: any } }
  }) => {
    const { height: scrollViewHeight } = event.nativeEvent.layout
    setScrollViewHeight(scrollViewHeight)
    setIsScrollEnabled(contentHeight > scrollViewHeight)
  }

  const handleContentLayout = (event: {
    nativeEvent: { layout: { height: any } }
  }) => {
    const { height: contentHeight } = event.nativeEvent.layout
    setContentHeight(contentHeight)
    setIsScrollEnabled(contentHeight > scrollViewHeight)
  }

  const handleUsernameLayout = useHandler((event: LayoutChangeEvent) => {
    setInputHeight(event.nativeEvent.layout.height)
  })

  const handleDropdownItemLayout = useHandler((event: LayoutChangeEvent) => {
    if (event != null && usernameItemHeight === 0) {
      const { height } = event.nativeEvent.layout
      setUsernameItemHeight(height)
    }
  })

  const handlePasswordChange = useHandler((password: string) => {
    setPasswordErrorMessage(undefined)
    setPassword(password)
  })

  const handleSubmitPassword = useHandler(() => {
    setSpinner(true)
    handleSubmitInner()
      .catch(e => console.error(e))
      .finally(() => setSpinner(false))
  })

  // Use `handleSubmitPassword` instead of this one.
  // We have this separated out to handle the CAPTCHA modal recursion.
  const handleSubmitInner = async (challengeId?: string) => {
    const otpAttempt: LoginAttempt = { type: 'password', username, password }

    try {
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
    } catch (error: unknown) {
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
        setPasswordErrorMessage(lstrings.invalid_password)
        return
      }

      const challengeError = asMaybeChallengeError?.(error)
      if (challengeError != null) {
        const result = await Airship.show<boolean | undefined>(bridge => (
          <ChallengeModal bridge={bridge} challengeError={challengeError} />
        ))
        if (result == null) return // User closed the modal
        if (result) {
          // Try again with the passed challenge ID included
          await handleSubmitInner(challengeError.challengeId)
        } else {
          setPasswordErrorMessage(lstrings.failed_captcha_error)
        }
        return
      }

      console.warn('Unknown login error: ', error)
      setPasswordErrorMessage(
        error instanceof Error ? error.message : undefined
      )
    }
  }

  const handleDelete = useHandler((userInfo: LoginUserInfo) => {
    Keyboard.dismiss()
    Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={lstrings.forget_account}
        message={sprintf(
          lstrings.forget_username_account,
          userInfo.username ?? lstrings.username
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
          await context.deleteLocalAccount(username)
        }

        setShowUsernameList(false)
      })
      .catch(showError)
  })

  const handleToggleUsernameList = useHandler(() => {
    // Dismiss the keyboard when opening the username list
    if (!showUsernameList) Keyboard.dismiss()
    setShowUsernameList(!showUsernameList)
  })

  const handleSelectUser = useHandler((userInfo: LoginUserInfo) => {
    const { loginId, username } = userInfo
    if (username == null) {
      dispatch({
        type: 'NAVIGATE',
        data: { name: 'pinLogin', params: { loginId } }
      })
    } else {
      handleChangeUsername(username)
      setShowUsernameList(false)

      const details: LoginUserInfo | undefined = localUsers.find(
        info => info.username === username
      )
      if (
        details != null &&
        (details.pinLoginEnabled || details.touchLoginEnabled)
      ) {
        dispatch({
          type: 'NAVIGATE',
          data: { name: 'pinLogin', params: { loginId } }
        })
      } else {
        if (passwordInputRef.current != null) passwordInputRef.current.focus()
      }
    }
  })

  const handleChangeUsername = useHandler((username: string) => {
    setShowUsernameList(false)
    setPasswordErrorMessage(undefined)
    setUsernameErrorMessage(undefined)
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'passwordLogin', params: { username, createAccountType } }
    })
  })

  const handleSubmitUsername = useHandler(() => {
    if (passwordInputRef.current != null) passwordInputRef.current.focus()
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
      dispatch(launchPasswordRecovery(recoveryKey))
      return true
    }
  )

  const handleForgotPassword = useHandler(async () => {
    Keyboard.dismiss()
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
  })

  const handleCreateAccount = useHandler(() => {
    onLogEvent('Password_Login_Create_Account')
    dispatch({
      type: 'NAVIGATE',
      data:
        !forceLightAccountCreate &&
        (hasSavedUsers || createAccountType === 'full')
          ? { name: 'newAccountUsername', params: {} }
          : { name: 'newAccountPin', params: {} }
    })
  })

  const handleQrModal = useHandler(() => {
    Keyboard.dismiss()
    Airship.show<EdgeAccount | undefined>(bridge => (
      <QrCodeModal
        bridge={bridge}
        accountOptions={accountOptions}
        context={context}
      />
    ))
      .then(async account => {
        if (account != null) await dispatch(completeLogin(account))
      })
      .catch(error => showError(error))
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

  // The main hints dropdown animation depending on focus state of the
  // username dropdown
  React.useEffect(() => {
    sAnimationMult.value = withTiming(showUsernameList ? 1 : 0, {
      duration: 250,
      easing: Easing.inOut(Easing.circle)
    })
  }, [sAnimationMult, showUsernameList])

  // Make scene scrollability react to keyboard visibility
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: { endCoordinates: { height: any } }) => {
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
      // Cleanup the event listeners on unmount
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [contentHeight, scrollViewHeight])

  const renderUsername = () => {
    return (
      <View style={styles.inputWrapper}>
        <View onLayout={handleUsernameLayout}>
          <FilledTextInput
            autoCorrect={false}
            autoFocus={false}
            clearIcon={!hasSavedUsers}
            error={usernameErrorMessage}
            placeholder={lstrings.username}
            returnKeyType="next"
            testID="usernameFormField"
            value={username}
            onChangeText={handleChangeUsername}
            onSubmitEditing={handleSubmitUsername}
          />
        </View>
        {hasSavedUsers ? (
          <EdgeTouchableOpacity
            testID="userDropdownIcon"
            style={[styles.dropdownButton, dropdownButtonPositionStyle]}
            onPress={handleToggleUsernameList}
          >
            {showUsernameList ? (
              <MaterialIcon
                name="expand-less"
                size={theme.rem(1.5)}
                style={styles.iconColor}
              />
            ) : (
              <MaterialIcon
                name="expand-more"
                size={theme.rem(1.5)}
                style={styles.iconColor}
              />
            )}
          </EdgeTouchableOpacity>
        ) : null}
      </View>
    )
  }

  const renderDropdownList = () => {
    return (
      <Animated.View
        style={[styles.dropContainer, mDropContainerStyle, aDropContainerStyle]}
      >
        <Animated.ScrollView
          keyboardShouldPersistTaps="always"
          scrollEventThrottle={1}
          onScroll={scrollHandler}
        >
          {localUsers.map(userInfo => {
            const { username } = userInfo
            return (
              <UserListItem
                key={username}
                userInfo={userInfo}
                onClick={handleSelectUser}
                onDelete={handleDelete}
                onLayout={handleDropdownItemLayout}
              />
            )
          })}
        </Animated.ScrollView>

        <Animated.View style={aGradientOpacity}>
          <GradientFadeOut />
        </Animated.View>
      </Animated.View>
    )
  }

  const renderPassword = () => {
    return (
      <View style={styles.inputWrapper}>
        <FilledTextInput
          ref={passwordInputRef}
          autoCorrect={false}
          autoFocus={false}
          error={passwordErrorMessage}
          placeholder={lstrings.password}
          returnKeyType="done"
          secureTextEntry
          testID="passwordFormField"
          value={password}
          onChangeText={handlePasswordChange}
          onSubmitEditing={handleSubmitPassword}
        />
      </View>
    )
  }

  const renderButtons = () => {
    return (
      <View style={styles.buttonsBox}>
        <EdgeAnim enter={{ type: 'fadeInDown', distance: 80 }}>
          <ButtonsViewUi4
            primary={{
              label: lstrings.login_button,
              onPress: handleSubmitPassword,
              disabled:
                username.length === 0 ||
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
            tertiary={{
              label: lstrings.forgot_password,
              onPress: handleForgotPassword,
              disabled: spinner
            }}
          />
        </EdgeAnim>
        <EdgeAnim enter={{ type: 'fadeInDown', distance: 80 }}>
          <EdgeTouchableOpacity onPress={handleQrModal}>
            <AntDesignIcon
              name="qrcode"
              style={styles.qrIcon}
              color={theme.icon}
              size={theme.rem(1.75)}
            />
          </EdgeTouchableOpacity>
        </EdgeAnim>
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
          <EdgeAnim enter={{ type: 'fadeInUp', distance: 60 }}>
            <LogoImageHeader branding={branding} />
          </EdgeAnim>

          <View style={styles.inputContainer}>
            <EdgeAnim enter={{ type: 'fadeInUp', distance: 40 }}>
              {renderUsername()}
            </EdgeAnim>
            {renderDropdownList()}
            <EdgeAnim enter={{ type: 'fadeInUp', distance: 20 }}>
              {renderPassword()}
            </EdgeAnim>
            {renderButtons()}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => {
  const spaceAroundInputs = theme.rem(1)

  return {
    dropContainer: {
      backgroundColor: theme.modal,
      borderRadius: theme.rem(0.5),
      borderColor: theme.iconTappable,
      borderWidth: theme.thinLineWidth,
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      margin: theme.rem(1),
      // Give it 0.5 rem between its top and the input's bottom
      marginTop: spaceAroundInputs + theme.rem(0.5),
      zIndex: 1
    },
    container: {
      flex: 1,
      paddingTop: theme.rem(2),
      paddingHorizontal: theme.rem(0.5)
    },
    inputContainer: {
      marginHorizontal: theme.rem(0.5),
      marginTop: theme.rem(2)
    },
    loginButtonBox: {
      marginVertical: theme.rem(0.25),
      width: '70%'
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
    // TODO: Integrate dropdown into FilledTextInput
    dropdownButton: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      right: 0,
      width: theme.rem(2),
      height: theme.rem(2),
      // Include spaceAroundInputs and subtract half its heigh
      marginTop: spaceAroundInputs - theme.rem(1),
      marginRight: spaceAroundInputs + theme.rem(0.5)
    },
    iconColor: {
      color: theme.iconTappable
    },
    qrIcon: {
      marginTop: theme.rem(1)
    }
  }
})
