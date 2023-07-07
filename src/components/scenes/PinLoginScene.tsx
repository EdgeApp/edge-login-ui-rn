import { asMaybePasswordError, EdgeUserInfo } from 'edge-core-js'
import * as React from 'react'
import {
  FlatList,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { cacheStyles } from 'react-native-patina'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SvgXml } from 'react-native-svg'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { sprintf } from 'sprintf-js'

import { completeLogin } from '../../actions/LoginCompleteActions'
import { FaceIdXml } from '../../assets/xml/FaceId'
import s from '../../common/locales/strings'
import { useImports } from '../../hooks/useImports'
import { LoginUserInfo, useLocalUsers } from '../../hooks/useLocalUsers'
import { getLoginKey } from '../../keychain'
import { Branding } from '../../types/Branding'
import { useDispatch, useSelector } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { FourDigit } from '../abSpecific/FourDigitComponent'
import { LogoImageHeader } from '../abSpecific/LogoImageHeader'
import { PinKeypad } from '../abSpecific/PinKeypad'
import { UserListItem } from '../abSpecific/UserListItem'
import { ButtonsModal } from '../modals/ButtonsModal'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { ThemedScene } from '../themed/ThemedScene'

interface Props extends SceneProps<'pinLogin'> {
  branding: Branding
}

interface ErrorInfo {
  message: string
  wait: number
}

export function PinLoginScene(props: Props) {
  const { branding } = props
  const { accountOptions, context } = useImports()
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
  const touch = useSelector(state => state.touch.type)
  const isTouchIdDisabled = hasWait || pin.length === 4 || touchBusy

  // User state:
  const localUsers = useLocalUsers()
  const initialUsername = useSelector(state => state.login.username)

  const [userInfo, setUserInfo] = React.useState<LoginUserInfo | undefined>(
    () =>
      localUsers.find(user => user.username === initialUsername) ??
      localUsers[0]
  )

  const dropdownItems = React.useMemo(
    () =>
      localUsers.filter(
        user => user.pinLoginEnabled || (touch && user.touchLoginEnabled)
      ),
    [touch, localUsers]
  )

  // ---------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------

  // Runs once at start:
  React.useEffect(() => {
    if (userInfo != null && touch !== 'FaceID') {
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
        data: { name: 'passwordLogin', params: {} }
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
      data: { name: 'passwordLogin', params: {} }
    })
  }

  const handleDelete = (userInfo: LoginUserInfo) => {
    setShowUserList(false)
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
  }

  const handlePinLogin = async (
    userInfo: EdgeUserInfo,
    pin: string
  ): Promise<void> => {
    try {
      const account = await context.loginWithPIN(userInfo.loginId, pin, {
        ...accountOptions,
        useLoginId: true
      })
      await dispatch(completeLogin(account))
    } catch (error: unknown) {
      console.log('LOG IN WITH PIN ERROR ', error)

      setErrorInfo({
        message:
          error instanceof Error ? translatePinError(error) : String(error),
        wait: Math.ceil(asMaybePasswordError(error)?.wait ?? 0)
      })
      setPin('')
      setTouchBusy(false)
    }
  }

  const handleTouchLogin = async (userInfo: EdgeUserInfo): Promise<void> => {
    const { username } = userInfo
    if (username == null) return

    try {
      const loginKey = await getLoginKey(
        username,
        `Touch to login user: "${username}"`,
        s.strings.login_with_password
      )
      if (loginKey == null) return

      setTouchBusy(true)
      const account = await context.loginWithKey(
        username,
        loginKey,
        accountOptions
      )
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
      handlePinLogin(userInfo, newPin).catch(showError)
    }
  }

  const handleSelectUser = (userInfo: LoginUserInfo) => {
    setShowUserList(false)
    setUserInfo(userInfo)
    setErrorInfo(undefined)
    handleTouchLogin(userInfo).catch(showError)

    // Also send the username to the password scene:
    if (userInfo.username != null) {
      dispatch({ type: 'AUTH_UPDATE_USERNAME', data: userInfo.username })
    }
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
          ': ' + sprintf(s.strings.account_locked_for, errorInfo.wait)
      }
    }

    return (
      <View style={styles.innerView}>
        <TouchableOpacity
          style={styles.usernameShadow}
          onPress={handleShowDrop}
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
              {userInfo?.username ?? s.strings.missing_username}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        {userInfo == null || !userInfo.pinLoginEnabled ? (
          <View style={styles.spacer} />
        ) : (
          <FourDigit
            error={errorMessage}
            pin={pin}
            spinner={hasWait || pin.length === 4 || touchBusy}
          />
        )}
        {renderTouchImage()}
        <Text style={styles.touchImageText}>{renderTouchImageText()}</Text>
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

    if (touch === 'FaceID') {
      return (
        <TouchableOpacity onPress={handleTouchId} disabled={isTouchIdDisabled}>
          <SvgXml
            xml={FaceIdXml}
            color={theme.iconTappable}
            width={theme.rem(3)}
            height={theme.rem(3)}
          />
        </TouchableOpacity>
      )
    }
    if (touch === 'TouchID') {
      return (
        <TouchableOpacity onPress={handleTouchId} disabled={isTouchIdDisabled}>
          <MaterialCommunityIcons
            name="fingerprint"
            size={theme.rem(3)}
            color={theme.iconTappable}
          />
        </TouchableOpacity>
      )
    }
    return null
  }

  const renderTouchImageText = () => {
    if (userInfo == null || !userInfo.touchLoginEnabled) return ''
    if (touch === 'FaceID') {
      return s.strings.use_faceId
    }
    if (touch === 'TouchID' && Platform.OS === 'ios') {
      return s.strings.use_touchId
    }
    if (touch === 'TouchID' && Platform.OS !== 'ios') {
      return s.strings.use_fingerprint
    }
    return ''
  }

  return (
    <ThemedScene
      backButtonText={s.strings.exit_pin}
      onBack={handleBack}
      noUnderline
      branding={branding}
    >
      <View style={styles.featureBoxContainer}>
        <TouchableWithoutFeedback onPress={handleHideDrop}>
          <View style={styles.featureBox}>
            <LogoImageHeader branding={branding} />
            <View style={styles.featureBoxBody}>{renderBottomHalf()}</View>
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.spacer_full} />
        {userInfo == null || !userInfo.pinLoginEnabled ? null : (
          <PinKeypad
            disabled={hasWait || pin.length === 4}
            onPress={handlePress}
          />
        )}
        <SafeAreaView edges={['bottom']} />
      </View>
    </ThemedScene>
  )
}

function translatePinError(error: Error): string {
  if (error.name === 'PasswordError') return s.strings.invalid_pin
  if (error.name === 'UsernameError') return s.strings.pin_not_enabled
  if (error.name === 'NetworkError') {
    return `${error.message} ${s.strings.pin_network_error_full_password}`
  }
  return error.message
}

const getStyles = cacheStyles((theme: Theme) => ({
  listView: {
    height: theme.rem(16),
    width: theme.rem(10)
  },
  featureBoxContainer: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around'
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
