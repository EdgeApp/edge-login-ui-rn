import { EdgeAccount, EdgePendingVoucher } from 'edge-core-js'
import * as React from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import { submitLogin } from '../../../actions/LoginCompleteActions'
import { lstrings } from '../../../common/locales/strings'
import { useImports } from '../../../hooks/useImports'
import { useDispatch } from '../../../types/ReduxTypes'
import { SceneProps } from '../../../types/routerTypes'
import { toLocalTime } from '../../../util/utils'
import { showError } from '../../services/AirshipInstance'
import { Theme, ThemeProps, useTheme } from '../../services/ThemeContext'
import { IconHeaderRow } from '../../themed/IconHeaderRow'
import { LinkRow } from '../../themed/LinkRow'
import { MainButton } from '../../themed/MainButton'
import { ThemedScene } from '../../themed/ThemedScene'
import { MessageText, Warning } from '../../themed/ThemedText'

export interface SecurityAlertParams {
  account: EdgeAccount
}

interface OwnProps extends SceneProps<'securityAlert'> {}
interface StateProps {
  account: EdgeAccount
}
interface DispatchProps {
  startResecure: (account: EdgeAccount) => void
  onDone: () => void
}
type Props = OwnProps & StateProps & DispatchProps & ThemeProps

interface State {
  needsResecure: boolean
  otpResetDate: Date | undefined
  pendingVouchers: EdgePendingVoucher[]
  showSkip: boolean
  spinReset: boolean
  spinVoucher: { [voucherId: string]: boolean }
}

export class SecurityAlertsSceneComponent extends React.Component<
  Props,
  State
> {
  cleanups: Array<() => unknown> | undefined

  constructor(props: Props) {
    super(props)
    const { otpResetDate, pendingVouchers = [] } = props.account
    this.state = {
      needsResecure: props.account.recoveryLogin,
      otpResetDate: otpResetDate != null ? new Date(otpResetDate) : undefined,
      pendingVouchers,
      showSkip: false,
      spinReset: false,
      spinVoucher: {}
    }
  }

  componentDidMount() {
    const { account } = this.props
    this.checkEmpty()
    this.cleanups = [
      account.watch('otpResetDate', otpResetDate => {
        const date = otpResetDate != null ? new Date(otpResetDate) : undefined
        this.setState({ otpResetDate: date }, this.checkEmpty)
      }),
      account.watch('pendingVouchers', pendingVouchers =>
        this.setState({ pendingVouchers }, this.checkEmpty)
      )
    ]
  }

  componentWillUnmount() {
    if (this.cleanups != null) this.cleanups.forEach(f => f())
  }

  render() {
    const { otpResetDate, pendingVouchers, showSkip } = this.state

    const count = pendingVouchers.length + (otpResetDate != null ? 1 : 0)

    return (
      <ThemedScene>
        <ScrollView style={{ flex: 1 }}>
          <IconHeaderRow
            renderIcon={theme => (
              <FontAwesome name="exclamation-triangle" size={theme.rem(2.5)} />
            )}
          >
            <MessageText>
              {count > 1
                ? lstrings.alert_scene_message_many
                : lstrings.alert_scene_message}
            </MessageText>
          </IconHeaderRow>
          <MessageText>
            <Warning>{lstrings.alert_scene_warning}</Warning>
          </MessageText>
          {this.renderVouchers()}
          {this.renderReset()}
          {showSkip ? (
            <LinkRow
              label={lstrings.skip_button}
              onPress={this.handleSkip}
              renderIcon={() => null}
            />
          ) : null}
        </ScrollView>
        <MainButton
          label={lstrings.alert_scene_deny}
          marginRem={1}
          onPress={this.handleDeny}
        />
      </ThemedScene>
    )
  }

  renderReset(): React.ReactNode {
    const { theme } = this.props
    const { otpResetDate, spinReset } = this.state
    const styles = getStyles(theme)

    if (otpResetDate == null) return null

    return (
      <View style={styles.tile}>
        <MessageText>{lstrings.alert_scene_reset_message}</MessageText>
        <MessageText>
          {lstrings.alert_scene_reset_date}
          {otpResetDate.toLocaleString()}
        </MessageText>
        {spinReset ? (
          <ActivityIndicator
            color={theme.primaryButton[0]}
            style={styles.cardSpinner}
          />
        ) : (
          <LinkRow
            label={lstrings.alert_scene_approve}
            onPress={this.handleApproveReset}
            renderIcon={theme => (
              <AntDesignIcon name="check" size={theme.rem(1)} />
            )}
          />
        )}
      </View>
    )
  }

  renderVouchers(): React.ReactNode {
    const { theme } = this.props
    const { pendingVouchers, spinVoucher } = this.state
    const styles = getStyles(theme)

    return pendingVouchers.map(voucher => (
      <View style={styles.tile} key={voucher.voucherId}>
        <MessageText>
          {voucher.deviceDescription != null
            ? lstrings.alert_scene_device + voucher.deviceDescription + '\n'
            : null}
          {lstrings.alert_scene_ip + voucher.ipDescription + '\n'}
          {lstrings.alert_scene_date + toLocalTime(voucher.created)}
        </MessageText>
        <MessageText>
          {lstrings.alert_scene_reset_date + toLocalTime(voucher.activates)}
        </MessageText>
        {spinVoucher[voucher.voucherId] ? (
          <ActivityIndicator
            color={theme.primaryButton[0]}
            style={styles.cardSpinner}
          />
        ) : (
          <LinkRow
            label={lstrings.alert_scene_approve}
            onPress={() => this.handleApproveVoucher(voucher.voucherId)}
            renderIcon={theme => (
              <AntDesignIcon name="check" size={theme.rem(1)} />
            )}
          />
        )}
      </View>
    ))
  }

  handleApproveReset = () => {
    const { account } = this.props
    this.setState({ spinReset: true })

    account
      .disableOtp()
      .catch(error => showError(error))
      .then(() =>
        this.setState({
          showSkip: true,
          spinReset: false
        })
      )
  }

  handleApproveVoucher = (voucherId: string) => {
    const { account } = this.props
    this.setState(state => ({
      spinVoucher: { ...state.spinVoucher, [voucherId]: true }
    }))

    const { approveVoucher = nopVoucher } = account
    approveVoucher(voucherId)
      .catch(error => showError(error))
      .then(() =>
        this.setState(state => ({
          showSkip: true,
          spinVoucher: { ...state.spinVoucher, [voucherId]: false }
        }))
      )
  }

  handleDeny = async () => {
    const { account } = this.props
    const { otpResetDate, pendingVouchers } = this.state
    this.setState({ needsResecure: true })

    const { rejectVoucher = nopVoucher } = account
    const promises = pendingVouchers.map(
      async voucher => await rejectVoucher(voucher.voucherId)
    )
    if (otpResetDate != null) {
      promises.push(account.cancelOtpReset())
    }

    try {
      await Promise.all(promises)
    } finally {
      this.setState({ showSkip: true })
    }
  }

  handleSkip = () => {
    const { onDone } = this.props
    onDone()
  }

  checkEmpty = () => {
    const { account, startResecure, onDone } = this.props
    const { needsResecure, otpResetDate, pendingVouchers } = this.state

    if (otpResetDate == null && pendingVouchers.length <= 0) {
      if (needsResecure) startResecure(account)
      else onDone()
    }
  }
}

async function nopVoucher(voucherId: string): Promise<void> {
  return await Promise.resolve()
}

const getStyles = cacheStyles((theme: Theme) => ({
  tile: {
    backgroundColor: theme.tileBackground,
    borderRadius: theme.rem(0.5),
    margin: theme.rem(0.5),
    padding: theme.rem(0.5)
  },
  cardSpinner: {
    alignSelf: 'flex-end',
    height: theme.rem(1.5),
    margin: theme.rem(0.5)
  }
}))

export function SecurityAlertsScene(props: OwnProps) {
  const { route } = props
  const { account } = route.params
  const { onComplete = () => {}, onLogin } = useImports()
  const dispatch = useDispatch()
  const theme = useTheme()

  const handleDone = (): void => {
    if (onLogin != null) dispatch(submitLogin(account))
    else onComplete()
  }

  const handleResecure = (): void => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'resecurePassword', params: { account } }
    })
  }

  return (
    <SecurityAlertsSceneComponent
      account={account}
      route={route}
      startResecure={handleResecure}
      theme={theme}
      onDone={handleDone}
    />
  )
}
