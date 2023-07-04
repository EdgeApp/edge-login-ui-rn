import { asMaybePasswordError, asMaybeUsernameError } from 'edge-core-js'
import * as React from 'react'
import { Keyboard, ScrollView, TouchableOpacity, View } from 'react-native'
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
import { MainButton } from '../themed/MainButton'
import {
  OutlinedTextInput,
  OutlinedTextInputRef
} from '../themed/OutlinedTextInput'
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

  const isMultiLocalUsers = localUsers.length > 1

  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState<
    string | undefined
  >(undefined)
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState<
    string | undefined
  >(undefined)
  const [password, setPassword] = React.useState('')
  const [showUsernameList, setShowUsernameList] = React.useState(false)

  const passwordInputRef = React.useRef<OutlinedTextInputRef>(null)

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

  const handleBack = useHandler(() => {
    dispatch(
      maybeRouteComplete({
        type: 'NAVIGATE',
        data: { name: 'landing', params: {} }
      })
    )
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
    setShowUsernameList(!showUsernameList)
  })

  const handleSelectUser = useHandler((userInfo: LoginUserInfo) => {
    const { username } = userInfo
    if (username == null) return // These don't exist in the list
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
        data: { name: 'pinLogin', params: {} }
      })
    } else {
      if (passwordInputRef.current != null) passwordInputRef.current.focus()
    }
  })

  const handleChangeUsername = useHandler((data: string) => {
    setPasswordErrorMessage(undefined)
    setUsernameErrorMessage(undefined)
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
    <View style={styles.usernameWrapper}>
      <View style={styles.usernameField}>
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

  const renderDropdownList = () => {
    return (
      <ScrollView
        style={styles.dropdownList}
        keyboardShouldPersistTaps="handled"
      >
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
    <ThemedScene onBack={handleBack} noUnderline branding={branding}>
      <KeyboardAwareScrollView
        style={styles.container}
        keyboardShouldPersistTaps="always"
      >
        <LogoImageHeader branding={branding} />

        <View style={styles.inputFieldContainer}>
          {renderUsername()}
          {showUsernameList ? renderDropdownList() : null}
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
        {renderButtons()}
      </KeyboardAwareScrollView>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    flex: 1
  },
  inputFieldContainer: {
    marginHorizontal: theme.rem(1)
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
  usernameField: {
    flex: 1,
    flexGrow: 1
  },
  dropdownList: {
    flexGrow: 0,
    maxHeight: theme.rem(12.5),
    backgroundColor: theme.backgroundGradientColors[0]
  },
  dropdownButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: theme.rem(1.5),
    width: theme.rem(2),
    height: theme.rem(2),
    bottom: theme.rem(0.75)
  },
  iconColor: {
    color: theme.iconTappable
  }
}))
