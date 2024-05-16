import {
  asMaybeNetworkError,
  asMaybePasswordError,
  asMaybeUsernameError,
  EdgeUserInfo,
  NetworkError
} from 'edge-core-js'
import * as React from 'react'
import { FlatList, Keyboard, Platform, Text, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { cacheStyles } from 'react-native-patina'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SvgXml } from 'react-native-svg'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { sprintf } from 'sprintf-js'

import { completeLogin } from '../../actions/LoginCompleteActions'
import { FaceIdXml } from '../../assets/xml/FaceId'
import { lstrings } from '../../common/locales/strings'
import { useImports } from '../../hooks/useImports'
import { LoginUserInfo, useLocalUsers } from '../../hooks/useLocalUsers'
import { getLoginKey } from '../../keychain'
import { Branding } from '../../types/Branding'
import { useDispatch, useSelector } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { FourDigitDisplay } from '../abSpecific/FourDigitDisplay'
import { LogoImageHeader } from '../abSpecific/LogoImageHeader'
import { PinKeypad } from '../abSpecific/PinKeypad'
import { UserListItem } from '../abSpecific/UserListItem'
import { EdgeAnim } from '../common/EdgeAnim'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { EdgeTouchableWithoutFeedback } from '../common/EdgeTouchableWithoutFeedback'
import { ButtonsModal } from '../modals/ButtonsModal'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { ThemedScene } from '../themed/ThemedScene'

export interface PinLoginParams {
  loginId: string
}

interface Props extends SceneProps<'pinLogin'> {
  branding: Branding
}

interface ErrorInfo {
  message: string
  wait: number
}

export function PinLoginScene(props: Props) {
  const { branding, route } = props
  const { loginId } = route.params
  const {
    accountOptions,
    context,
    onLogEvent = () => {},
    onPerfEvent
  } = useImports()
  const dispatch = useDispatch()
  const theme = useTheme()
  const styles = getStyles(theme)

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------

  const [pin, setPin] = React.useState('')
  const [showUserList, setShowUserList] = React.useState(false)
  const [touchBusy, setTouchBusy] = React.useState(false)

  // Error state:
  const [errorInfo, setErrorInfo] = React.useState<ErrorInfo | undefined>()
  const hasWait = errorInfo != null && errorInfo.wait > 0

  // Pin login state:
  const biometryType = useSelector(state => state.touch.biometryType)
  const isTouchIdDisabled = hasWait || pin.length === 4 || touchBusy

  // User list:
  const localUsers = useLocalUsers()
  const dropdownItems = React.useMemo(
    () =>
      localUsers.filter(user => user.pinLoginEnabled || user.touchLoginEnabled),
    [localUsers]
  )

  // Active user:
  const userInfo = React.useMemo<LoginUserInfo | undefined>(
    () =>
      dropdownItems.find(user => user.loginId === loginId) ?? dropdownItems[0],
    [dropdownItems, loginId]
  )

  // ---------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------

  // Runs once at start:
  React.useEffect(() => {
    if (userInfo != null && biometryType !== 'FaceID') {
      handleTouchLogin(userInfo).catch(showError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (
      userInfo == null ||
      (!userInfo.touchLoginEnabled && !userInfo.pinLoginEnabled)
    ) {
      dispatch({
        type: 'NAVIGATE',
        data: {
          name: 'passwordLogin',
          params: { username: userInfo?.username ?? '' }
        }
      })
    }
  }, [dispatch, userInfo])

  // Countdown timer:
  React.useEffect(() => {
    if (errorInfo == null || errorInfo.wait <= 0) return

    const id = setTimeout(() => {
      setErrorInfo({ ...errorInfo, wait: errorInfo.wait - 1 })
    }, 1000)

    return () => clearTimeout(id)
  }, [errorInfo])

  // ---------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------

  const handleBack = () => {
    dispatch({
      type: 'NAVIGATE',
      data: {
        name: 'passwordLogin',
        params: { username: userInfo?.username ?? '' }
      }
    })
  }

  const handleDelete = (userInfo: LoginUserInfo) => {
    setShowUserList(false)
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
      })
      .catch(showError)
  }

  const handlePinLogin = async (
    userInfo: LoginUserInfo,
    pin: string
  ): Promise<void> => {
    try {
      const { loginId } = userInfo
      onPerfEvent({ name: 'pinLoginBegin' })
      const account = await context.loginWithPIN(loginId, pin, {
        ...accountOptions,
        useLoginId: true
      })
      onPerfEvent({ name: 'pinLoginEnd' })
      await dispatch(completeLogin(account))
    } catch (error: unknown) {
      onPerfEvent({ name: 'pinLoginEnd', error })

      console.log('LOG IN WITH PIN ERROR ', error)

      const passwordError = asMaybePasswordError(error)
      const usernameError = asMaybeUsernameError(error)
      const networkError = asMaybeNetworkError(error)
      setErrorInfo({
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
      setTouchBusy(false)
    }
  }

  const handleTouchLogin = async (userInfo: EdgeUserInfo): Promise<void> => {
    try {
      const { loginId, username = lstrings.missing_username } = userInfo
      const loginKey = await getLoginKey(
        userInfo,
        `Touch to login user: "${username}"`,
        lstrings.login_with_password
      )
      if (loginKey == null) return

      setTouchBusy(true)
      const account = await context.loginWithKey(loginId, loginKey, {
        ...accountOptions,
        useLoginId: true
      })
      await dispatch(completeLogin(account))
    } finally {
      setTouchBusy(false)
    }
  }

  const handleTouchId = () => {
    if (userInfo == null) return
    handleTouchLogin(userInfo).catch(showError)
  }

  const handlePress = (value: string) => {
    const newPin =
      value === 'back' ? pin.slice(0, -1) : pin.concat(value).slice(0, 4)
    setPin(newPin)
    setErrorInfo(undefined)
    if (newPin.length === 4 && pin.length === 3 && userInfo != null) {
      handlePinLogin(userInfo, newPin)
        .then(() => {
          onLogEvent('Pin_Login')
        })
        .catch(showError)
    }
  }

  const handleSelectUser = (userInfo: LoginUserInfo) => {
    setShowUserList(false)
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'pinLogin', params: { loginId: userInfo.loginId } }
    })
    setErrorInfo(undefined)
    handleTouchLogin(userInfo).catch(showError)
  }

  const handleShowDrop = () => {
    setShowUserList(true)
  }

  const handleHideDrop = () => {
    setShowUserList(false)
  }

  // ---------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------

  const renderBottomHalf = () => {
    if (showUserList) {
      return (
        <View style={styles.innerView}>
          <FlatList
            style={styles.listView}
            data={dropdownItems}
            renderItem={renderItems}
            keyExtractor={item => item.loginId}
          />
        </View>
      )
    }

    let errorMessage = ''
    if (errorInfo != null) {
      errorMessage = errorInfo.message
      if (errorInfo.wait > 0) {
        errorMessage +=
          ': ' + sprintf(lstrings.account_locked_for, errorInfo.wait)
      }
    }

    const isSingleSavedUser = dropdownItems.length === 1
    let usernameLabel = ''
    if (userInfo?.username != null) {
      // Normal account: show username
      usernameLabel = userInfo.username
    } else if (!isSingleSavedUser) {
      // Light account + other saved users: "Tap to Switch..."
      usernameLabel = lstrings.tap_to_switch_user
    }
    // Light account + no other saved users: hide username label

    return (
      <View style={styles.innerView}>
        <EdgeAnim enter={{ type: 'fadeInUp', distance: 40 }}>
          <EdgeTouchableOpacity
            testID="usernameDropdownButton"
            style={styles.usernameShadow}
            onPress={isSingleSavedUser ? undefined : handleShowDrop}
            activeOpacity={isSingleSavedUser ? 1 : undefined}
          >
            <LinearGradient
              colors={theme.pinUsernameButton}
              start={theme.pinUsernameButtonColorStart}
              end={theme.pinUsernameButtonColorEnd}
              style={[styles.linearGradient, styles.usernameButton]}
            >
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                numberOfLines={1}
                style={styles.usernameText}
              >
                {usernameLabel}
              </Text>
            </LinearGradient>
          </EdgeTouchableOpacity>
        </EdgeAnim>
        {userInfo == null || !userInfo.pinLoginEnabled ? (
          <View style={styles.spacer} />
        ) : (
          <FourDigitDisplay
            error={errorMessage}
            pin={pin}
            spinner={hasWait || pin.length === 4 || touchBusy}
          />
        )}
        <EdgeAnim enter={{ type: 'fadeInDown', distance: 20 }}>
          {renderTouchImage()}
        </EdgeAnim>
        <EdgeAnim enter={{ type: 'fadeInDown', distance: 40 }}>
          <Text style={styles.touchImageText}>{renderTouchImageText()}</Text>
        </EdgeAnim>
      </View>
    )
  }

  const renderItems = (item: { item: LoginUserInfo }) => {
    return (
      <UserListItem
        userInfo={item.item}
        onClick={handleSelectUser}
        onDelete={handleDelete}
        // TODO: New dropdown visual design for this scene OR
        // New design for combined password/pin scene
        onLayout={() => {}}
      />
    )
  }

  const renderTouchImage = () => {
    if (userInfo == null || !userInfo.touchLoginEnabled) return null

    if (biometryType === 'FaceID') {
      return (
        <EdgeTouchableOpacity
          onPress={handleTouchId}
          disabled={isTouchIdDisabled}
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
          onPress={handleTouchId}
          disabled={isTouchIdDisabled}
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

  const renderTouchImageText = () => {
    if (userInfo == null || !userInfo.touchLoginEnabled) return ''
    if (biometryType === 'FaceID') {
      return lstrings.use_faceId
    }
    if (biometryType === 'TouchID' && Platform.OS === 'ios') {
      return lstrings.use_touchId
    }
    if (biometryType === 'TouchID' && Platform.OS !== 'ios') {
      return lstrings.use_fingerprint
    }
    return ''
  }

  return (
    <ThemedScene
      backButtonText={lstrings.exit_pin}
      onBack={handleBack}
      noUnderline
      branding={branding}
    >
      <View style={styles.featureBoxContainer}>
        <EdgeTouchableWithoutFeedback
          accessible={false}
          onPress={handleHideDrop}
        >
          <View style={styles.featureBox}>
            <EdgeAnim enter={{ type: 'fadeInUp', distance: 60 }}>
              <LogoImageHeader branding={branding} />
            </EdgeAnim>
            <View style={styles.featureBoxBody}>{renderBottomHalf()}</View>
          </View>
        </EdgeTouchableWithoutFeedback>
        <View style={styles.spacer_full} />
        {userInfo == null || !userInfo.pinLoginEnabled ? null : (
          <EdgeAnim enter={{ type: 'fadeInDown', distance: 40 }}>
            <PinKeypad
              disabled={hasWait || pin.length === 4}
              onPress={handlePress}
            />
          </EdgeAnim>
        )}
        <SafeAreaView edges={['bottom']} />
      </View>
    </ThemedScene>
  )
}

function translateNetworkError(
  error: NetworkError,
  userInfo: LoginUserInfo
): string {
  if (userInfo.username != null) {
    return `${error.message} ${lstrings.pin_network_error_full_password}`
  }
  if (userInfo.keyLoginEnabled) {
    return `${error.message} ${lstrings.pin_network_error_biometric}`
  }
  return error.message
}

const getStyles = cacheStyles((theme: Theme) => ({
  listView: {
    height: theme.rem(16),
    width: theme.rem(10),
    backgroundColor: theme.modal
  },
  featureBoxContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingTop: theme.rem(2),
    width: '100%'
  },
  featureBox: {
    width: '100%',
    alignItems: 'center'
  },
  featureBoxBody: {
    height: theme.rem(15),
    width: '100%'
  },
  innerView: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  touchImageText: {
    marginTop: theme.rem(0.5),
    color: theme.iconTappable
  },
  usernameText: {
    fontFamily: theme.pinUsernameButtonFont,
    color: theme.pinUsernameButtonText,
    fontSize: theme.rem(theme.pinUsernameButtonFontSizeRem),
    paddingHorizontal: theme.rem(1),
    paddingVertical: theme.rem(0.5)
  },
  usernameButton: {
    borderColor: theme.pinUsernameButtonOutline,
    borderWidth: theme.pinUsernameButtonOutlineWidth
  },
  usernameShadow: { ...theme.pinUsernameButtonShadow },
  linearGradient: {
    // flex: 1,
    paddingLeft: 0,
    paddingRight: 0,
    borderRadius: theme.rem(theme.pinUsernameButtonBorderRadiusRem)
  },
  spacer: {
    marginTop: theme.rem(2)
  },
  spacer_full: {
    flex: 1,
    zIndex: -100
  }
}))
