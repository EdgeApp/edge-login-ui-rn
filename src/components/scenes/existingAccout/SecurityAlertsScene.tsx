import { EdgeAccount, EdgePendingVoucher } from 'edge-core-js'
import * as React from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { AirshipBridge } from 'react-native-airship'
import { cacheStyles } from 'react-native-patina'
import Feather from 'react-native-vector-icons/Feather'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { submitLogin } from '../../../actions/LoginCompleteActions'
import { lstrings } from '../../../common/locales/strings'
import { useImports } from '../../../hooks/useImports'
import { useDispatch } from '../../../types/ReduxTypes'
import { SceneProps } from '../../../types/routerTypes'
import { toLocalTime } from '../../../util/utils'
import { EdgeTouchableWithoutFeedback } from '../../common/EdgeTouchableWithoutFeedback'
import { Space } from '../../layout/Space'
import { Airship, showError } from '../../services/AirshipInstance'
import { Theme, ThemeProps, useTheme } from '../../services/ThemeContext'
import { EdgeText, Paragraph, WarningText } from '../../themed/EdgeText'
import { IconHeaderRow } from '../../themed/IconHeaderRow'
import { LinkRow } from '../../themed/LinkRow'
import { ModalTitle } from '../../themed/ModalParts'
import { ThemedScene } from '../../themed/ThemedScene'
import { MessageText } from '../../themed/ThemedText'
import { AlertCard } from '../../ui4/AlertCard'
import { ButtonsView, StyledButtonContainer } from '../../buttons/ButtonsView'
import { EdgeButton } from '../../buttons/EdgeButton'
import { EdgeCard } from '../../ui4/EdgeCard'
import { EdgeModal } from '../../ui4/EdgeModal'

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
    const { otpResetDate, pendingVouchers } = this.state

    const count = pendingVouchers.length + (otpResetDate != null ? 1 : 0)

    const renderButtons = () => {
      if (__DEV__) {
        return (
          <ButtonsView
            layout="column"
            primary={
              pendingVouchers.length <= 1
                ? undefined
                : {
                    label: lstrings.deny_all,
                    onPress: this.handleDenyAll
                  }
            }
            secondary={{
              label: lstrings.skip_button,
              onPress: this.handleSkip
            }}
          />
        )
      } else {
        return pendingVouchers.length <= 1 ? null : (
          <ButtonsView
            layout="column"
            primary={{
              label: lstrings.deny_all,
              onPress: this.handleDenyAll
            }}
          />
        )
      }
    }

    return (
      <ThemedScene>
        <ScrollView style={{ flexGrow: 1, flexShrink: 0 }}>
          <IconHeaderRow
            renderIcon={theme => (
              <FontAwesome
                name="exclamation-triangle"
                size={theme.rem(2.5)}
                color={theme.warningText}
              />
            )}
          >
            <MessageText>
              {count > 1
                ? lstrings.alert_scene_message_many_new
                : lstrings.alert_scene_message}
            </MessageText>
          </IconHeaderRow>
          <AlertCard
            type="warning"
            body={lstrings.alert_scene_warning_review}
          />
          {this.renderVouchers()}
          {this.renderReset()}
        </ScrollView>
        {renderButtons()}
      </ThemedScene>
    )
  }

  // TODO: Pending removal after server endpoint removal
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
      <EdgeCard key={voucher.voucherId}>
        <View style={styles.textBlock}>
          {voucher.deviceDescription != null ? (
            <EdgeText>
              {lstrings.alert_scene_device + voucher.deviceDescription}
            </EdgeText>
          ) : null}
          <EdgeText>{lstrings.alert_scene_ip + voucher.ipDescription}</EdgeText>
          <EdgeText>
            {lstrings.alert_scene_date + toLocalTime(voucher.created)}
          </EdgeText>
        </View>

        <View style={styles.textBlock}>
          <EdgeText numberOfLines={2}>
            <WarningText>
              {lstrings.alert_scene_reset_date + toLocalTime(voucher.activates)}
            </WarningText>
          </EdgeText>
        </View>
        {spinVoucher[voucher.voucherId] ? (
          <ActivityIndicator
            color={theme.primaryButton[0]}
            style={styles.cardSpinner}
          />
        ) : (
          // TODO: Codify this into a ButtonView variant if we need this
          // combination elsewhere. Hard-coded because it's assumed to be a
          // weird one-off situation.
          <StyledButtonContainer layout="row">
            <EdgeButton
              label={lstrings.allow}
              onPress={this.handleApproveVoucher(voucher)}
              type="secondary"
              layout="row"
            />
            <Space aroundRem={0.5} />
            <EdgeButton
              label={lstrings.deny}
              onPress={this.handleDeny(voucher)}
              type="destructive"
              layout="row"
            />
          </StyledButtonContainer>
        )}
      </EdgeCard>
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
          spinReset: false
        })
      )
  }

  handleDeny = (pendingVoucher: EdgePendingVoucher) => async () => {
    const { account } = this.props
    this.setState({ needsResecure: true })

    const { rejectVoucher = nopVoucher } = account

    await rejectVoucher(pendingVoucher.voucherId)
  }

  handleApproveVoucher = (pendingVoucher: EdgePendingVoucher) => async () => {
    const { account } = this.props

    const modalResult = await Airship.show<'allow' | 'deny' | 'dismiss'>(
      (bridge: AirshipBridge<'allow' | 'deny' | 'dismiss'>) => (
        <ApproveVoucherModal bridge={bridge} />
      )
    )

    if (modalResult === 'allow') {
      this.setState(state => ({
        spinVoucher: { ...state.spinVoucher, [pendingVoucher.voucherId]: true }
      }))

      const { approveVoucher = nopVoucher } = account
      try {
        await approveVoucher(pendingVoucher.voucherId)
        this.setState(state => ({
          spinVoucher: {
            ...state.spinVoucher,
            [pendingVoucher.voucherId]: false
          }
        }))
      } catch (error) {
        showError(error)
      }
    } else if (modalResult === 'deny') {
      this.handleDeny(pendingVoucher)
    }
  }

  handleDenyAll = async () => {
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

    await Promise.all(promises)
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

const ApproveVoucherModal = (props: {
  bridge: AirshipBridge<'allow' | 'deny' | 'dismiss'>
}) => {
  const { bridge } = props
  const [isAgreed, setIsAgreed] = React.useState(false)
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <EdgeModal
      bridge={bridge}
      title={
        <ModalTitle
          icon={
            <Ionicons
              name="warning"
              size={theme.rem(1.75)}
              color={theme.warningText}
            />
          }
        >
          {lstrings.access_confirmation_title}
        </ModalTitle>
      }
      scroll
      onCancel={() => bridge.resolve('dismiss')}
    >
      <Paragraph>{lstrings.access_confirmation_body}</Paragraph>
      <EdgeTouchableWithoutFeedback onPress={() => setIsAgreed(!isAgreed)}>
        <View style={styles.checkBoxContainer}>
          <EdgeText style={styles.checkboxText}>
            {lstrings.i_understand_agree}
          </EdgeText>
          <View
            style={[
              styles.checkCircleContainer,
              isAgreed ? styles.checkCircleContainerAgreed : undefined
            ]}
          >
            {isAgreed && (
              <Feather
                name="check"
                color={theme.iconTappable}
                size={theme.rem(0.75)}
              />
            )}
          </View>
        </View>
      </EdgeTouchableWithoutFeedback>
      <StyledButtonContainer layout="column" parentType="modal">
        <EdgeButton
          disabled={!isAgreed}
          layout="column"
          type="secondary"
          onPress={() => bridge.resolve('allow')}
        >
          <View style={styles.allowButton}>
            <Ionicons
              name="warning"
              size={theme.rem(1.25)}
              color={theme.warningText}
            />
            <EdgeText style={styles.allowButtonText}>{lstrings.allow}</EdgeText>
            <Ionicons
              name="warning"
              size={theme.rem(1.25)}
              color={theme.warningText}
            />
          </View>
        </EdgeButton>
        <Space aroundRem={0.5} />
        <EdgeButton
          label={lstrings.deny}
          layout="column"
          type="destructive"
          onPress={() => bridge.resolve('deny')}
        />
      </StyledButtonContainer>
    </EdgeModal>
  )
}

async function nopVoucher(voucherId: string): Promise<void> {
  return await Promise.resolve()
}

const getStyles = cacheStyles((theme: Theme) => ({
  allowButton: {
    flexDirection: 'row'
  },
  allowButtonText: {
    marginHorizontal: theme.rem(0.5)
  },
  checkBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.rem(0.5),
    marginTop: theme.rem(1),
    padding: theme.rem(1),
    borderWidth: theme.thinLineWidth,
    borderColor: theme.primaryText,
    borderRadius: theme.cardBorderRadius
  },
  checkCircleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.rem(1.25),
    height: theme.rem(1.25),
    borderWidth: theme.thinLineWidth,
    borderColor: theme.icon,
    borderRadius: theme.rem(0.75)
  },
  checkCircleContainerAgreed: {
    borderColor: theme.iconTappable
  },
  checkboxText: {
    flex: 1,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.75)
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexShrink: 1,
    margin: theme.rem(0.5)
  },
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
  },
  textBlock: {
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
