import { OtpError } from 'edge-core-js'
import * as React from 'react'
import {
  FlatList,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { ScrollView } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import { sprintf } from 'sprintf-js'

import { launchPasswordRecovery, login } from '../../actions/LoginAction'
import { deleteUserFromDevice } from '../../actions/UserActions'
import s from '../../common/locales/strings'
import { BiometryType } from '../../keychain'
import { LoginUserInfo } from '../../reducers/PreviousUsersReducer'
import { Branding } from '../../types/Branding'
import { Dispatch, RootState } from '../../types/ReduxTypes'
import { LoginAttempt } from '../../util/loginAttempt'
import { LogoImageHeader } from '../abSpecific/LogoImageHeader'
import { UserListItem } from '../abSpecific/UserListItem'
import { ThemedScene } from '../themed/ThemedScene'
import { HeaderParentButtons } from '../common/HeaderParentButtons'
import { ButtonsModal } from '../modals/ButtonsModal'
import { showQrCodeModal } from '../modals/QrCodeModal'
import { TextInputModal } from '../modals/TextInputModal'
import { Airship, showError } from '../services/AirshipInstance'
import { connect } from '../services/ReduxStore'
import { Theme, ThemeProps, withTheme } from '../services/ThemeContext'
import { LineFormField } from '../themed/LineFormField'
import { MainButton } from '../themed/MainButton'

interface OwnProps {
  branding: Branding
}
interface StateProps {
  loginSuccess: boolean
  previousUsers: LoginUserInfo[]
  touch: BiometryType
  username: string
  usernameOnlyList: string[]
}
interface DispatchProps {
  deleteUserFromDevice: (username: string) => Promise<void>
  gotoCreatePage: () => void
  gotoPinLoginPage: () => void
  handleQrModal: () => void
  login: (attempt: LoginAttempt) => Promise<void>
  saveOtpError: (otpAttempt: LoginAttempt, otpError: OtpError) => void
  updateUsername: (username: string) => void
  handlePasswordRecovery: (recoveryKey: string) => Promise<boolean>
}

type Props = OwnProps & StateProps & DispatchProps & ThemeProps

const PasswordLoginSceneComponent = ({
  branding,
  deleteUserFromDevice,
  gotoCreatePage,
  gotoPinLoginPage,
  handlePasswordRecovery,
  handleQrModal,
  login,
  loginSuccess,
  previousUsers,
  saveOtpError,
  theme,
  touch,
  updateUsername,
  username,
  usernameOnlyList
}: Props) => {
  const styles = getStyles(theme)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [focusUsername, setFocusUsername] = React.useState(true)
  const [focusPassword, setFocusPassword] = React.useState(false)
  const [password, setPassword] = React.useState('')
  const [usernameList, setUsernameList] = React.useState(false)

  const handlePasswordChange = (password: string) => {
    setErrorMessage('')
    setPassword(password)
  }
  const changeFocus = (
    hideKeyboard: boolean = true,
    toUsername: boolean = false,
    toPassword: boolean = false
  ) => {
    if (hideKeyboard) Keyboard.dismiss()
    if (toUsername) setFocusUsername(toUsername)
    if (toPassword) setFocusPassword(toPassword)
  }
  const handleBlur = () => changeFocus(true, false, false)
  const handleFocusUsername = () => changeFocus(false, true, false)
  const handleFocusPassword = () => changeFocus(false, false, true)

  const handleSubmit = async () => {
    handleBlur()
    const attempt: LoginAttempt = { type: 'password', username, password }
    await login(attempt).catch(error => {
      if (error != null && error.name === 'OtpError') {
        saveOtpError(attempt, error)
      } else {
        console.log(error)
        const errorMessage = error != null ? error.message : ''
        setErrorMessage(errorMessage)
      }
    })
  }

  const handleDelete = (username: string) => {
    handleBlur()
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
        return await deleteUserFromDevice(username)
      })
      .catch(showError)
  }

  const renderCaretDropdown = () => {
    return (
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
    )
  }

  {
    /* {usernameList && renderDropdownList()} */
  }

  const renderDropdownList = () => {
    return (
      <FlatList
        style={styles.dropDownList}
        data={usernameOnlyList}
        renderItem={renderRow}
        keyExtractor={(_, index) => index.toString()}
      />
    )
  }

  const renderRow = (data: { item: string }) => {
    return (
      <UserListItem
        data={data.item}
        onClick={handleSelectUser}
        onDelete={handleDelete}
      />
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

  const handleToggleUsernameList = () => {
    handleBlur()
    setUsernameList(!usernameList)
  }

  const handleSelectUser = (username: string) => {
    handleChangeUsername(username)
    setUsernameList(false)

    const details: LoginUserInfo | undefined = previousUsers.find(
      info => info.username === username
    )
    if (
      details != null &&
      (details.pinEnabled || (details.touchEnabled && touch))
    ) {
      gotoPinLoginPage()
      return
    }
    handleFocusPassword()
  }

  const handleChangeUsername = (data: string) => {
    setErrorMessage('')
    updateUsername(data)
  }

  const handleForgotPassword = () => {
    Keyboard.dismiss()
    Airship.show(bridge => (
      <TextInputModal
        bridge={bridge}
        onSubmit={handlePasswordRecovery}
        title={s.strings.password_recovery}
        message={s.strings.initiate_password_recovery}
        inputLabel={s.strings.recovery_token}
      />
    ))
  }

  const handleCreateAccount = () => {
    gotoCreatePage()
  }
  if (loginSuccess) return null
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <HeaderParentButtons branding={branding} />
      </View>
      <View style={styles.loginContainer}>
        <LogoImageHeader branding={branding} />
        <LineFormField
          onChangeText={handleChangeUsername}
          value={username}
          label={s.strings.username}
          returnKeyType="next"
          autoCorrect={false}
          autoFocus={focusUsername}
          onFocus={handleFocusUsername}
          onSubmitEditing={handleFocusPassword}
          multiline={false}
        />
        <View style={styles.shimTiny} />
        <LineFormField
          onChangeText={handlePasswordChange}
          value={password}
          label={s.strings.password}
          error={errorMessage}
          autoCorrect={false}
          secureTextEntry
          returnKeyType="go"
          autoFocus={focusPassword}
          onSubmitEditing={handleSubmit}
          multiline={false}
        />
        {renderButtons()}
      </View>
    </View>
  )
}

{
  /* <BackgroundImage
        branding={branding}
        content={renderOverImage()}
        onPress={handleBlur}
      /> */
}
const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: theme.backgroundGradientColors[0],
    flexWrap: 'nowrap',
    flexGrow: 1
  },
  headerContainer: {
    height: theme.rem(2),
  },
  footerContainer: {
    height: theme.rem(2)
  },
  loginContainer: {
    alignSelf: 'center',
    marginTop: theme.rem(5),
    width: '70%'
  },
  featureBox: {},
  shimTiny: {
    width: '100%',
    height: theme.rem(0)
  },
  buttonsBox: {
    width: '100%',
    alignItems: 'center'
  },
  loginButtonBox: {
    marginVertical: theme.rem(0.25),
    width: '70%'
  },
  usernameWrapper: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'black'
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

export const PasswordLoginScene = connect<StateProps, DispatchProps, OwnProps>(
  (state: RootState) => ({
    loginSuccess: state.login.loginSuccess,
    previousUsers: state.previousUsers.userList,
    touch: state.touch.type,
    username: state.login.username,
    usernameOnlyList: state.previousUsers.usernameOnlyList
  }),
  (dispatch: Dispatch) => ({
    async deleteUserFromDevice(username) {
      return await dispatch(deleteUserFromDevice(username))
    },
    gotoCreatePage() {
      dispatch({ type: 'NEW_ACCOUNT_WELCOME' })
    },
    gotoPinLoginPage() {
      dispatch({ type: 'START_PIN_LOGIN' })
    },
    handleQrModal() {
      Keyboard.dismiss()
      dispatch(showQrCodeModal())
    },
    async login(attempt) {
      return await dispatch(login(attempt))
    },
    saveOtpError(attempt, error) {
      dispatch({ type: 'OTP_ERROR', data: { attempt, error } })
    },
    updateUsername(data: string) {
      dispatch({ type: 'AUTH_UPDATE_USERNAME', data: data })
    },
    async handlePasswordRecovery(recoveryKey: string): Promise<boolean> {
      dispatch(launchPasswordRecovery(recoveryKey))
      return await Promise.resolve(true)
    }
  })
)(withTheme(PasswordLoginSceneComponent))
