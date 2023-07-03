import * as React from 'react'
import {
  Keyboard,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { cacheStyles } from 'react-native-patina'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import { sprintf } from 'sprintf-js'

import { launchPasswordRecovery, login } from '../../actions/LoginAction'
import { maybeRouteComplete } from '../../actions/LoginInitActions'
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
import { showQrCodeModal } from '../modals/QrCodeModal'
import { TextInputModal } from '../modals/TextInputModal'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { LineFormField } from '../themed/LineFormField'
import { MainButton } from '../themed/MainButton'
import { ThemedScene } from '../themed/ThemedScene'

interface Props extends SceneProps<'passwordLogin'> {
  branding: Branding
}

export const PasswordLoginScene = (props: Props) => {
  const { branding } = props
  const { context } = useImports()
  const dispatch = useDispatch()
  const theme = useTheme()

  const localUsers = useLocalUsers()
  const touch = useSelector(state => state.touch.type)
  const username = useSelector(state => state.login.username)
  const styles = getStyles(theme)

  const [errorMessage, setErrorMessage] = React.useState('')
  const [focusFirst, setFocusFirst] = React.useState(true)
  const [focusSecond, setFocusSecond] = React.useState(false)
  const [password, setPassword] = React.useState('')
  const [usernameList, setUsernameList] = React.useState(false)

  const handlePasswordChange = useHandler((password: string) => {
    setErrorMessage('')
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
        const errorMessage = error != null ? error.message : ''
        setErrorMessage(errorMessage)
      }
    })
  })

  const handleBack = useHandler(() => {
    dispatch(
      maybeRouteComplete({
        type: 'NAVIGATE',
        data: { name: 'landing', params: {} }
      })
    )
  })

  const handleBlur = useHandler(() => {
    Keyboard.dismiss()
    setFocusFirst(false)
    setFocusSecond(false)
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
    Keyboard.dismiss()
    setFocusFirst(false)
    setFocusSecond(false)
    setUsernameList(!usernameList)
  })

  const handleFocus1 = useHandler(() => {
    setFocusFirst(true)
    setFocusSecond(false)
  })

  const handleFocus2 = useHandler(() => {
    setFocusFirst(false)
    setFocusSecond(true)
  })

  const handleSetNextFocus = useHandler(() => {
    setFocusFirst(false)
    setFocusSecond(true)
  })

  const handleSelectUser = useHandler((userInfo: LoginUserInfo) => {
    const { username } = userInfo
    if (username == null) return // These don't exist in the list
    handleChangeUsername(username)
    setUsernameList(false)

    const details: LoginUserInfo | undefined = localUsers.find(
      info => info.username === username
    )
    if (
      details != null &&
      (details.pinLoginEnabled || (details.touchLoginEnabled && touch))
    ) {
      dispatch({
        type: 'NAVIGATE',
        data: { name: 'pinLogin', params: {} }
      })
      return
    }
    handleSetNextFocus()
  })

  const handleChangeUsername = useHandler((data: string) => {
    setErrorMessage('')
    dispatch({ type: 'AUTH_UPDATE_USERNAME', data: data })
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
      data: { name: 'newAccountWelcome', params: {} }
    })
  })

  const handleQrModal = useHandler(() => {
    Keyboard.dismiss()
    dispatch(showQrCodeModal())
  })

  const renderUsername = () => (
    <View>
      <View style={styles.usernameWrapper}>
        <LineFormField
          testID="usernameFormField"
          onChangeText={handleChangeUsername}
          value={username}
          label={s.strings.username}
          returnKeyType="next"
          autoCorrect={false}
          autoFocus={focusFirst}
          forceFocus={focusFirst}
          onFocus={handleFocus1}
          onSubmitEditing={handleSetNextFocus}
        />
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={handleToggleUsernameList}
        >
          {usernameList ? (
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
      </View>
      {!usernameList ? null : renderDropdownList()}
    </View>
  )

  const renderDropdownList = () => {
    return (
      <ScrollView style={styles.dropDownList}>
        {localUsers.map(userInfo => {
          const { username } = userInfo
          if (username == null) return null
          return (
            <UserListItem
              key={username}
              userInfo={userInfo}
              onClick={handleSelectUser}
              onDelete={handleDelete}
            />
          )
        })}
      </ScrollView>
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
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps="always"
      contentContainerStyle={styles.mainScrollView}
    >
      <ThemedScene onBack={handleBack} noUnderline branding={branding}>
        <TouchableWithoutFeedback onPress={handleBlur}>
          <View style={styles.featureBox}>
            <LogoImageHeader branding={branding} />
            {renderUsername()}
            <View style={styles.shimTiny} />
            <LineFormField
              testID="passwordFormField"
              onChangeText={handlePasswordChange}
              value={password}
              label={s.strings.password}
              error={errorMessage}
              autoCorrect={false}
              secureTextEntry
              returnKeyType="go"
              forceFocus={focusSecond}
              onFocus={handleFocus2}
              onSubmitEditing={handleSubmit}
            />
            {renderButtons()}
          </View>
        </TouchableWithoutFeedback>
      </ThemedScene>
    </KeyboardAwareScrollView>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: theme.backgroundGradientColors[0]
  },
  mainScrollView: {
    width: '100%',
    height: '100%'
  },
  featureBox: {
    top: theme.rem(3.5),
    width: '100%',
    alignItems: 'center'
  },
  shimTiny: {
    width: '100%',
    height: theme.rem(0.75)
  },
  loginButtonBox: {
    marginVertical: theme.rem(0.25),
    width: '70%'
  },
  buttonsBox: {
    width: '100%',
    alignItems: 'center'
  },
  usernameWrapper: {
    width: '100%',
    flexDirection: 'row'
  },
  dropDownList: {
    flexGrow: 0,
    maxHeight: theme.rem(12.5),
    backgroundColor: theme.backgroundGradientColors[0]
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: theme.rem(-0.5),
    width: theme.rem(2),
    height: theme.rem(2),
    bottom: theme.rem(0.5)
  },
  iconColor: {
    color: theme.icon
  },
  iconColorPressed: {
    color: theme.iconDeactivated
  }
}))
