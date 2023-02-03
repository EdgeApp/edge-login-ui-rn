import { OtpError } from 'edge-core-js'
import * as React from 'react'
import {
  FlatList,
  Keyboard,
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
import { deleteUserFromDevice } from '../../actions/UserActions'
import s from '../../common/locales/strings'
import { BiometryType } from '../../keychain'
import { LoginUserInfo } from '../../reducers/PreviousUsersReducer'
import { Branding } from '../../types/Branding'
import { Dispatch, RootState } from '../../types/ReduxTypes'
import { LoginAttempt } from '../../util/loginAttempt'
import { LogoImageHeader } from '../abSpecific/LogoImageHeader'
import { UserListItem } from '../abSpecific/UserListItem'
import { BackgroundImage } from '../common/BackgroundImage'
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
  const [focusFirst, setFocusFirst] = React.useState(true)
  const [focusSecond, setFocusSecond] = React.useState(false)
  const [password, setPassword] = React.useState('')
  const [usernameList, setUsernameList] = React.useState(false)

  const handlePasswordChange = (password: string) => {
    setErrorMessage('')
    setPassword(password)
  }

  const handleSubmit = async () => {
    handleBlur()
    Keyboard.dismiss()

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

  const handleBlur = () => {
    Keyboard.dismiss()
    setFocusFirst(false)
    setFocusSecond(false)
  }

  const handleDelete = (username: string) => {
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
        return await deleteUserFromDevice(username)
      })
      .catch(showError)
  }

  const renderOverImage = () => {
    if (loginSuccess) return null
    return (
      <View style={styles.featureBoxContainer}>
        <HeaderParentButtons branding={branding} />
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
              autoFocus={focusSecond}
              onFocus={handleFocus2}
              onSubmitEditing={handleSubmit}
            />
            {renderButtons()}
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }

  const renderUsername = () => {
    return (
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
        {usernameList && renderDropdownList()}
      </View>
    )
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
    Keyboard.dismiss()
    setFocusFirst(false)
    setFocusSecond(false)
    setUsernameList(!usernameList)
  }

  const handleFocus1 = () => {
    setFocusFirst(true)
    setFocusSecond(false)
  }

  const handleFocus2 = () => {
    setFocusFirst(false)
    setFocusSecond(true)
  }

  const handleSetNextFocus = () => {
    setFocusFirst(false)
    setFocusSecond(true)
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
    handleSetNextFocus()
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
  return (
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps="always"
      contentContainerStyle={styles.mainScrollView}
    >
      <BackgroundImage
        branding={branding}
        content={renderOverImage()}
        onPress={handleBlur}
      />
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
