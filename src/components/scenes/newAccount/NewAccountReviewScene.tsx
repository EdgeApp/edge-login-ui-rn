import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { ScrollView } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { completeLogin } from '../../../actions/LoginCompleteActions'
import { lstrings } from '../../../common/locales/strings'
import { useHandler } from '../../../hooks/useHandler'
import { useImports } from '../../../hooks/useImports'
import { useDispatch } from '../../../types/ReduxTypes'
import { SceneProps } from '../../../types/routerTypes'
import { EdgeAnim } from '../../common/EdgeAnim'
import { SceneButtons } from '../../common/SceneButtons'
import { Theme, useTheme } from '../../services/ThemeContext'
import { AccountInfo } from '../../themed/AccountInfo'
import { EdgeText } from '../../themed/EdgeText'
import { FormError } from '../../themed/FormError'
import { ThemedScene } from '../../themed/ThemedScene'

export interface NewAccountReviewParams {
  account: EdgeAccount
  password?: string
  pin: string
  username?: string
}

export interface UpgradeAccountReviewParams {
  password: string
  pin?: string
  username: string
}

interface Props {
  password?: string
  pin?: string
  username?: string
  onNext: () => void
}
const AccountReviewComponent = (props: Props) => {
  const { username, password, pin, onNext } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <ThemedScene title={lstrings.review}>
      <ScrollView contentContainerStyle={styles.content}>
        <EdgeAnim enter={{ type: 'fadeInUp', distance: 60 }}>
          <EdgeText style={styles.description} numberOfLines={2}>
            {lstrings.tap_to_review_button}
          </EdgeText>
        </EdgeAnim>
        <EdgeAnim enter={{ type: 'fadeInUp', distance: 40 }}>
          <FormError
            marginRem={[0, 0, 2]}
            title={lstrings.alert_dropdown_warning}
            numberOfLines={2}
            isWarning
          >
            {lstrings.warning_message}
          </FormError>
        </EdgeAnim>
        <EdgeAnim enter={{ type: 'fadeInDown', distance: 40 }}>
          <AccountInfo
            marginRem={[0, 2.5]}
            username={username}
            password={password}
            pin={pin}
          />
        </EdgeAnim>
      </ScrollView>
      <SceneButtons
        absolute
        primary={{ label: lstrings.create, onPress: onNext }}
        animDistanceStart={60}
      />
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    marginHorizontal: theme.rem(0.5),
    marginTop: theme.rem(1.5)
  },
  description: {
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.875),
    marginBottom: theme.rem(2)
  }
}))

/**
 * The review scene for new accounts.
 */
export const NewAccountReviewScene = (
  props: SceneProps<'newAccountReview'>
) => {
  const { route } = props
  const { account } = route.params
  const { onLogEvent = () => {} } = useImports()
  const dispatch = useDispatch()

  const handleNext = useHandler(() => {
    onLogEvent(`Signup_Review_Done`)
    dispatch(completeLogin(account))
  })

  return <AccountReviewComponent {...route.params} onNext={handleNext} />
}

/**
 * The review scene for upgrading (light) accounts.
 */
export const UpgradeReviewScene = (
  props: SceneProps<'upgradeAccountReview'>
) => {
  const { route } = props
  const { onComplete, onLogEvent = () => {} } = useImports()

  const handleNext = useHandler(() => {
    onLogEvent(`Backup_Review_Done`)

    if (onComplete != null) onComplete()
  })

  return <AccountReviewComponent {...route.params} onNext={handleNext} />
}
