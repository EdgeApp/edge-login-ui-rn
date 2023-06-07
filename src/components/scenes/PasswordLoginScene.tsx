import { EdgeContext, OtpError } from 'edge-core-js'
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
import { useImports } from '../../hooks/useImports'
import { LoginUserInfo } from '../../hooks/useLocalUsers'
import { BiometryType } from '../../keychain'
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
import { Theme, ThemeProps, useTheme } from '../services/ThemeContext'
import { LineFormField } from '../themed/LineFormField'
import { MainButton } from '../themed/MainButton'
import { ThemedScene } from '../themed/ThemedScene'

interface OwnProps extends SceneProps<'passwordLogin'> {
  branding: Branding
}
interface StateProps {
  context: EdgeContext
  localUsers: LoginUserInfo[]
  loginSuccess: boolean
  touch: BiometryType
  username: string
}
interface DispatchProps {
  gotoCreatePage: () => void
  gotoPinLoginPage: () => void
  handleQrModal: () => void
  login: (attempt: LoginAttempt) => Promise<void>
  exitScene: () => void
  saveOtpError: (otpAttempt: LoginAttempt, otpError: OtpError) => void
  updateUsername: (username: string) => void
  handleSubmitRecoveryKey: (recoveryKey: string) => Promise<boolean | string>
}
type Props = OwnProps & StateProps & DispatchProps & ThemeProps

interface State {
  errorMessage: string
  focusFirst: boolean
  focusSecond: boolean
  password: string
  usernameList: boolean
}

class PasswordLoginSceneComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      errorMessage: '',
      focusFirst: true,
      focusSecond: false,
      password: '',
      usernameList: false
    }
  }

  handlePasswordChange = (password: string) => {
    this.setState({ errorMessage: '', password })
  }

  handleSubmit = async () => {
    const { login, saveOtpError, username } = this.props
    const { password } = this.state

    this.handleBlur()
    Keyboard.dismiss()

    const attempt: LoginAttempt = { type: 'password', username, password }
    await login(attempt).catch(error => {
      if (error != null && error.name === 'OtpError') {
        saveOtpError(attempt, error)
      } else {
        console.log(error)
        const errorMessage = error != null ? error.message : ''
        this.setState({ errorMessage })
      }
    })
  }

  handleBack = () => {
    this.props.exitScene()
  }

  handleBlur = () => {
    Keyboard.dismiss()
    this.setState({
      focusFirst: false,
      focusSecond: false
    })
  }

  handleDelete = (userInfo: LoginUserInfo) => {
    const { context } = this.props
    const { username } = userInfo
    if (username == null) {
      showError('Cannot delete local-only account')
      return
    }

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

  render() {
    const { theme } = this.props
    const styles = getStyles(theme)

    return (
      <KeyboardAwareScrollView
        style={styles.container}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.mainScrollView}
      >
        <TouchableWithoutFeedback onPress={this.handleBlur}>
          <ThemedScene
            onBack={this.handleBack}
            noUnderline
            branding={this.props.branding}
          >
            {this.renderOverImage()}
          </ThemedScene>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    )
  }

  renderOverImage() {
    const { theme } = this.props
    const styles = getStyles(theme)

    if (this.props.loginSuccess) {
      /* return (
        <View style={style.featureBox}>
          <Text>LOGIN SUCCESS</Text>
        </View>
      ) */
      return null
    }
    return (
      <View style={styles.featureBoxContainer}>
        <TouchableWithoutFeedback onPress={this.handleBlur}>
          <View style={styles.featureBox}>
            <LogoImageHeader branding={this.props.branding} />
            {this.renderUsername()}
            <View style={styles.shimTiny} />
            <LineFormField
              testID="passwordFormField"
              onChangeText={this.handlePasswordChange}
              value={this.state.password}
              label={s.strings.password}
              error={this.state.errorMessage}
              autoCorrect={false}
              secureTextEntry
              returnKeyType="go"
              forceFocus={this.state.focusSecond}
              onFocus={this.handleFocus2}
              onSubmitEditing={this.handleSubmit}
            />
            {this.renderButtons()}
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }

  renderUsername() {
    const { theme } = this.props
    const styles = getStyles(theme)

    return (
      <View>
        <View style={styles.usernameWrapper}>
          <LineFormField
            testID="usernameFormField"
            onChangeText={this.handleChangeUsername}
            value={this.props.username}
            label={s.strings.username}
            returnKeyType="next"
            autoCorrect={false}
            autoFocus={this.state.focusFirst}
            forceFocus={this.state.focusFirst}
            onFocus={this.handleFocus1}
            onSubmitEditing={this.handleSetNextFocus}
          />
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={this.handleToggleUsernameList}
          >
            {this.state.usernameList ? (
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
        {!this.state.usernameList ? null : this.renderDropdownList()}
      </View>
    )
  }

  renderDropdownList() {
    const { localUsers, theme } = this.props
    const styles = getStyles(theme)

    return (
      <ScrollView style={styles.dropDownList}>
        {localUsers.map(userInfo => {
          const { username } = userInfo
          if (username == null) return null
          return (
            <UserListItem
              key={username}
              userInfo={userInfo}
              onClick={this.handleSelectUser}
              onDelete={this.handleDelete}
            />
          )
        })}
      </ScrollView>
    )
  }

  renderButtons() {
    const { handleQrModal, theme } = this.props
    const styles = getStyles(theme)
    const buttonType = theme.preferPrimaryButton ? 'primary' : 'secondary'

    return (
      <View style={styles.buttonsBox}>
        <MainButton
          type="textOnly"
          onPress={this.handleForgotPassword}
          label={s.strings.forgot_password}
        />
        <View style={styles.loginButtonBox}>
          <MainButton
            label={s.strings.login_button}
            testID="loginButton"
            type={buttonType}
            onPress={this.handleSubmit}
          />
        </View>
        <MainButton
          type="textOnly"
          testID="createAccountButton"
          onPress={this.handleCreateAccount}
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

  handleToggleUsernameList = () => {
    Keyboard.dismiss()
    this.setState({
      focusFirst: false,
      focusSecond: false,
      usernameList: !this.state.usernameList
    })
  }

  handleFocus1 = () => {
    this.setState({
      focusFirst: true,
      focusSecond: false
    })
  }

  handleFocus2 = () => {
    this.setState({
      focusFirst: false,
      focusSecond: true
    })
  }

  handleSetNextFocus = () => {
    this.setState({
      focusFirst: false,
      focusSecond: true
    })
  }

  handleSelectUser = (userInfo: LoginUserInfo) => {
    const { username } = userInfo
    if (username == null) return // These don't exist in the list
    this.handleChangeUsername(username)
    this.setState({
      usernameList: false
    })

    const details: LoginUserInfo | undefined = this.props.localUsers.find(
      info => info.username === username
    )
    if (
      details != null &&
      (details.pinLoginEnabled ||
        (details.touchLoginEnabled && this.props.touch))
    ) {
      this.props.gotoPinLoginPage()
      return
    }
    this.handleSetNextFocus()
  }

  handleChangeUsername = (data: string) => {
    this.setState({ errorMessage: '' })
    this.props.updateUsername(data)
  }

  handleForgotPassword = () => {
    Keyboard.dismiss()
    logEvent('Login_Password_Forgot_Password')
    Airship.show(bridge => (
      <TextInputModal
        bridge={bridge}
        onSubmit={this.props.handleSubmitRecoveryKey}
        title={s.strings.password_recovery}
        message={s.strings.initiate_password_recovery}
        inputLabel={s.strings.recovery_token}
      />
    ))
  }

  handleCreateAccount = () => {
    logEvent('Login_Password_Create_Account')
    this.props.gotoCreatePage()
  }
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: theme.backgroundGradientColors[0]
  },
  mainScrollView: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  featureBoxContainer: {
    width: '100%'
  },
  featureBox: {
    position: 'relative',
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

export function PasswordLoginScene(props: OwnProps) {
  const { branding, route } = props
  const { context } = useImports()
  const dispatch = useDispatch()
  const theme = useTheme()

  const [loginSuccess, setLoginSuccess] = React.useState(false)
  const localUsers = useSelector(state => state.previousUsers.userList)
  const touch = useSelector(state => state.touch.type)
  const username = useSelector(state => state.login.username)

  const dispatchProps: DispatchProps = {
    gotoCreatePage() {
      dispatch({
        type: 'NAVIGATE',
        data: { name: 'newAccountWelcome', params: {} }
      })
    },
    gotoPinLoginPage() {
      dispatch({
        type: 'NAVIGATE',
        data: { name: 'pinLogin', params: {} }
      })
    },
    handleQrModal() {
      Keyboard.dismiss()
      dispatch(showQrCodeModal())
    },
    async login(attempt) {
      await dispatch(login(attempt))
      setLoginSuccess(true)
    },
    exitScene() {
      dispatch(
        maybeRouteComplete({
          type: 'NAVIGATE',
          data: { name: 'landing', params: {} }
        })
      )
    },
    saveOtpError(otpAttempt, otpError) {
      dispatch({
        type: 'NAVIGATE',
        data: { name: 'otpError', params: { otpAttempt, otpError } }
      })
    },
    updateUsername(data: string) {
      dispatch({ type: 'AUTH_UPDATE_USERNAME', data: data })
    },
    async handleSubmitRecoveryKey(
      recoveryKey: string
    ): Promise<boolean | string> {
      if (base58.parseUnsafe(recoveryKey)?.length !== 32)
        return s.strings.recovery_token_invalid
      dispatch(launchPasswordRecovery(recoveryKey))
      return true
    }
  }
  return (
    <PasswordLoginSceneComponent
      {...dispatchProps}
      branding={branding}
      context={context}
      localUsers={localUsers}
      loginSuccess={loginSuccess}
      route={route}
      theme={theme}
      touch={touch}
      username={username}
    />
  )
}
