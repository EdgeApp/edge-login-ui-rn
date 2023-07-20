import { asMaybePasswordError, asMaybeUsernameError } from 'edge-core-js'
import * as React from 'react'
import {
  Keyboard,
  LayoutChangeEvent,
  TouchableOpacity,
  View
} from 'react-native'
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

import { launchPasswordRecovery, login } from '../../actions/LoginAction'
import s from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { useImports } from '../../hooks/useImports'
import { LoginUserInfo, useLocalUsers } from '../../hooks/useLocalUsers'
import { Branding } from '../../types/Branding'
import { useDispatch, useSelector } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { logEvent } from '../../util/analytics'
import { base58 } from '../../util/base58'
import { LoginAttempt } from '../../util/loginAttempt'
import { LogoImageHeader } from '../abSpecific/LogoImageHeader'
import { UserListItem } from '../abSpecific/UserListItem'
import { ButtonsModal } from '../modals/ButtonsModal'
import { GradientFadeOut } from '../modals/GradientFadeout'
import { showQrCodeModal } from '../modals/QrCodeModal'
import { TextInputModal } from '../modals/TextInputModal'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { MainButton } from '../themed/MainButton'
import {
  OutlinedTextInput,
  OutlinedTextInputRef
} from '../themed/OutlinedTextInput'
import { ThemedScene } from '../themed/ThemedScene'

const MAX_DISPLAYED_LOCAL_USERS = 5

export interface PasswordLoginParams {
  username: string
}

interface Props extends SceneProps<'passwordLogin'> {
  branding: Branding
}

export const PasswordLoginScene = (props: Props) => {
  const { branding, route } = props
  const { username } = route.params
  const { context } = useImports()
  const dispatch = useDispatch()
  const theme = useTheme()
  const styles = getStyles(theme)

  const localUsers = useLocalUsers()
  const numUsers = localUsers.length

  const touch = useSelector(state => state.touch.type)

  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState<
    string | undefined
  >(undefined)
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState<
    string | undefined
  >(undefined)
  const [password, setPassword] = React.useState('')
  const [showUsernameList, setShowUsernameList] = React.useState(false)
  const [dropdownY, setDropdownY] = React.useState(0)
  const [usernameItemHeight, setUsernameItemHeight] = React.useState(0)
  const [isScrollEnabled, setIsScrollEnabled] = React.useState(true)
  const [scrollViewHeight, setScrollViewHeight] = React.useState(0)
  const [contentHeight, setContentHeight] = React.useState(0)

  const passwordInputRef = React.useRef<OutlinedTextInputRef>(null)

  const mDropContainerStyle = React.useMemo(() => {
    return { top: dropdownY, ...styles.dropContainer }
  }, [styles, dropdownY])

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
    setDropdownY(event.nativeEvent.layout.y + theme.rem(3.5))
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

  const handleSubmit = useHandler(async () => {
    Keyboard.dismiss()

    const otpAttempt: LoginAttempt = { type: 'password', username, password }
    await dispatch(login(otpAttempt)).catch(error => {
      if (error != null && error.name === 'OtpError') {
        dispatch({
          type: 'NAVIGATE',
          data: { name: 'otpError', params: { otpAttempt, otpError: error } }
        })
      } else {
        console.log(error)
        const usernameError = asMaybeUsernameError(error)
        if (usernameError != null) {
          setUsernameErrorMessage(s.strings.invalid_account)
          return
        }

        const passwordError = asMaybePasswordError(error)
        if (passwordError != null) {
          setPasswordErrorMessage(s.strings.invalid_password)
          return
        }

        console.warn('Unknown login error: ', error)
        const unknownErrorMessage = error != null ? error.message : undefined
        setPasswordErrorMessage(unknownErrorMessage)
      }
    })
  })

  const handleDelete = useHandler((userInfo: LoginUserInfo) => {
    Keyboard.dismiss()
    Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={s.strings.forget_account}
        message={sprintf(
          s.strings.forget_username_account,
          userInfo.username ?? s.strings.username
        )}
        buttons={{
          ok: { label: s.strings.forget },
          cancel: { label: s.strings.cancel, type: 'secondary' }
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
      })
      .catch(showError)
  })

  const handleToggleUsernameList = useHandler(() => {
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
        (details.pinLoginEnabled || (details.touchLoginEnabled && touch))
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
    setPasswordErrorMessage(undefined)
    setUsernameErrorMessage(undefined)
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'passwordLogin', params: { username } }
    })
  })

  const handleSubmitRecoveryKey = useHandler(
    async (recoveryKey: string): Promise<boolean | string> => {
      if (base58.parseUnsafe(recoveryKey)?.length !== 32)
        return s.strings.recovery_token_invalid
      dispatch(launchPasswordRecovery(recoveryKey))
      return true
    }
  )

  const handleForgotPassword = useHandler(() => {
    Keyboard.dismiss()
    logEvent('Login_Password_Forgot_Password')
    Airship.show(bridge => (
      <TextInputModal
        bridge={bridge}
        onSubmit={handleSubmitRecoveryKey}
        title={s.strings.password_recovery}
        message={s.strings.initiate_password_recovery}
        inputLabel={s.strings.recovery_token}
      />
    ))
  })

  const handleCreateAccount = useHandler(() => {
    logEvent('Login_Password_Create_Account')
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'newAccountUsername', params: {} }
    })
  })

  const handleQrModal = useHandler(() => {
    Keyboard.dismiss()
    dispatch(showQrCodeModal())
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
    const isMultiLocalUsers = numUsers > 1

    return (
      <View style={styles.usernameWrapper}>
        <View style={styles.inputField} onLayout={handleUsernameLayout}>
          <OutlinedTextInput
            autoCorrect={false}
            autoFocus
            clearIcon={!isMultiLocalUsers}
            error={usernameErrorMessage}
            label={s.strings.username}
            marginRem={[0.5, 1, 0.5, 1]}
            returnKeyType="next"
            testID="usernameFormField"
            value={username}
            onChangeText={handleChangeUsername}
          />
        </View>
        {isMultiLocalUsers ? (
          <TouchableOpacity
            testID="userDropdownIcon"
            style={styles.dropdownButton}
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
          </TouchableOpacity>
        ) : null}
      </View>
    )
  }

  const renderDropdownList = () => {
    return (
      <Animated.View style={[mDropContainerStyle, aDropContainerStyle]}>
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
      <View style={styles.inputField}>
        <OutlinedTextInput
          ref={passwordInputRef}
          autoCorrect={false}
          autoFocus={false}
          error={passwordErrorMessage}
          label={s.strings.password}
          marginRem={[0.5, 1, 0.5, 1]}
          returnKeyType="done"
          secureTextEntry
          testID="passwordFormField"
          value={password}
          onChangeText={handlePasswordChange}
          onSubmitEditing={handleSubmit}
        />
      </View>
    )
  }

  const renderButtons = () => {
    const buttonType = theme.preferPrimaryButton ? 'primary' : 'secondary'
    return (
      <View style={styles.buttonsBox}>
        <MainButton
          type="textOnly"
          onPress={handleForgotPassword}
          label={s.strings.forgot_password}
        />
        <View style={styles.loginButtonBox}>
          <MainButton
            label={s.strings.login_button}
            testID="loginButton"
            type={buttonType}
            disabled={
              username.length === 0 ||
              password.length === 0 ||
              usernameErrorMessage != null ||
              passwordErrorMessage != null
            }
            onPress={handleSubmit}
          />
        </View>
        <MainButton
          type="textOnly"
          testID="createAccountButton"
          onPress={handleCreateAccount}
          label={s.strings.create_an_account}
        />
        <TouchableOpacity onPress={handleQrModal}>
          <AntDesignIcon
            name="qrcode"
            color={theme.icon}
            size={theme.rem(1.75)}
          />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ThemedScene noUnderline branding={branding}>
      <KeyboardAwareScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={isScrollEnabled}
        onLayout={handleScrollViewLayout}
      >
        <View onLayout={handleContentLayout}>
          <LogoImageHeader branding={branding} />

          <View style={styles.inputContainer}>
            {renderUsername()}
            {renderDropdownList()}
            {renderPassword()}
            {renderButtons()}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  dropContainer: {
    backgroundColor: theme.modal,
    borderRadius: theme.rem(0.5),
    zIndex: 1,
    borderColor: theme.iconTappable,
    borderWidth: theme.thinLineWidth,
    overflow: 'hidden',
    position: 'absolute',
    marginHorizontal: theme.rem(1),
    flex: 1
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
    alignItems: 'center'
  },
  usernameWrapper: {
    flexDirection: 'row'
  },
  inputField: {
    flex: 1,
    marginBottom: theme.rem(1)
  },
  // TODO: Integrate dropdown into OutlinedTextInput
  dropdownButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: theme.rem(1.25),
    width: theme.rem(2.5),
    height: theme.rem(2),
    bottom: theme.rem(1.85)
  },
  iconColor: {
    color: theme.iconTappable
  }
}))
