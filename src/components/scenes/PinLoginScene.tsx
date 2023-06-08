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

import { loginWithPin, loginWithTouch } from '../../actions/LoginAction'
import { FaceIdXml } from '../../assets/xml/FaceId'
import s from '../../common/locales/strings'
import { useImports } from '../../hooks/useImports'
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

export function PinLoginScene(props: Props) {
  const { branding } = props
  const { context } = useImports()
  const dispatch = useDispatch()
  const theme = useTheme()
  const styles = getStyles(theme)

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------

  const [focusOn, setFocusOn] = React.useState<'pin' | 'List'>('pin')

  // Pin login state:
  const errorMessage = useSelector(state => state.login.errorMessage || '')
  const isLoggingInWithPin = useSelector(
    state => state.login.isLoggingInWithPin
  )
  const pin = useSelector(state => state.login.pin || '')
  const touch = useSelector(state => state.touch.type)
  const wait = useSelector(state => state.login.wait)
  const isTouchIdDisabled = !!wait || isLoggingInWithPin || pin.length === 4

  // User state:
  const userList = useSelector(state => state.previousUsers.userList)
  const username = useSelector(state => state.login.username)

  const userDetails = React.useMemo(
    () =>
      userList.find(user => user.username === username) ?? {
        username,
        pinEnabled: false,
        touchEnabled: false
      },
    [userList, username]
  )

  const dropdownItems = React.useMemo(
    () =>
      userList
        .filter(user => user.pinEnabled || (touch && user.touchEnabled))
        .map(user => user.username),
    [touch, userList]
  )

  // ---------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------

  // Runs once at start:
  React.useEffect(() => {
    if (username && touch !== 'FaceID') {
      dispatch(loginWithTouch(username)).catch(showError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (!userDetails.touchEnabled && !userDetails.pinEnabled) {
      dispatch({
        type: 'NAVIGATE',
        data: { name: 'passwordLogin', params: {} }
      })
    }
  }, [dispatch, userDetails])

  // ---------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------

  const handleBack = () => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'passwordLogin', params: {} }
    })
  }

  const handleDelete = (username: string) => {
    setFocusOn('pin')

    Keyboard.dismiss()
    Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={s.strings.forget_account}
        message={sprintf(s.strings.forget_username_account, username)}
        buttons={{
          ok: { label: s.strings.forget },
          cancel: { label: s.strings.cancel, type: 'secondary' }
        }}
      />
    ))
      .then(async button => {
        if (button !== 'ok') return
        return await context.deleteLocalAccount(username)
      })
      .catch(showError)
  }

  const handleTouchId = () => {
    dispatch(loginWithTouch(username)).catch(showError)
  }

  const handlePress = (value: string) => {
    const newPin =
      value === 'back' ? pin.slice(0, -1) : pin.concat(value).slice(0, 4)
    if (newPin.length === 4 && pin.length === 3) {
      dispatch(loginWithPin(username, newPin))
    }
    dispatch({ type: 'AUTH_UPDATE_PIN', data: newPin })
  }

  const handleSelectUser = (username: string) => {
    dispatch(loginWithTouch(username)).catch(showError)
    dispatch({ type: 'AUTH_UPDATE_USERNAME', data: username })
    setFocusOn('pin')
  }

  const handleShowDrop = () => {
    setFocusOn('List')
  }

  const handleHideDrop = () => {
    setFocusOn('pin')
  }

  // ---------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------

  const renderBottomHalf = () => {
    if (focusOn === 'pin') {
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
                {username}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {!userDetails.pinEnabled ? null : (
            <FourDigit
              error={
                wait > 0
                  ? `${errorMessage}: ${sprintf(
                      s.strings.account_locked_for,
                      wait
                    )}`
                  : errorMessage
              }
              pin={pin}
              spinner={wait > 0 || pin.length === 4 || isLoggingInWithPin}
            />
          )}
          {userDetails.pinEnabled ? null : <View style={styles.spacer} />}
          {renderTouchImage()}
          <Text style={styles.touchImageText}>{renderTouchImageText()}</Text>
        </View>
      )
    }
    return (
      <View style={styles.innerView}>
        <FlatList
          style={styles.listView}
          data={dropdownItems}
          renderItem={renderItems}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    )
  }

  const renderItems = (item: { item: string }) => {
    return (
      <UserListItem
        data={item.item}
        onClick={handleSelectUser}
        onDelete={handleDelete}
      />
    )
  }

  const renderTouchImage = () => {
    const { touchEnabled } = userDetails
    if (touchEnabled && touch === 'FaceID') {
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
    if (touchEnabled && touch === 'TouchID') {
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
    if (!touchEnabled || !touch) {
      return null
    }
    return null
  }

  const renderTouchImageText = () => {
    const { touchEnabled } = userDetails
    if (touchEnabled && touch === 'FaceID') {
      return s.strings.use_faceId
    }
    if (touchEnabled && touch === 'TouchID' && Platform.OS === 'ios') {
      return s.strings.use_touchId
    }
    if (touchEnabled && touch === 'TouchID' && Platform.OS !== 'ios') {
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
        {!userDetails.pinEnabled ? null : (
          <PinKeypad
            disabled={wait > 0 || pin.length === 4}
            onPress={handlePress}
          />
        )}
        <SafeAreaView edges={['bottom']} />
      </View>
    </ThemedScene>
  )
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
