import * as React from 'react'
import { ScrollView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { completeLogin } from '../../../actions/LoginCompleteActions'
import { lstrings } from '../../../common/locales/strings'
import { useHandler } from '../../../hooks/useHandler'
import { useImports } from '../../../hooks/useImports'
import { Branding } from '../../../types/Branding'
import { useDispatch } from '../../../types/ReduxTypes'
import {
  AccountParams,
  CreateFlowParams,
  SceneProps
} from '../../../types/routerTypes'
import { Theme, useTheme } from '../../services/ThemeContext'
import { AccountInfo } from '../../themed/AccountInfo'
import { EdgeText } from '../../themed/EdgeText'
import { FormError } from '../../themed/FormError'
import { MainButton } from '../../themed/MainButton'
import { ThemedScene } from '../../themed/ThemedScene'

export interface AccountReviewParams extends AccountParams, CreateFlowParams {}

interface Props extends CreateFlowParams {
  onNext: () => void
}
const AccountReviewComponent = (props: Props) => {
  const { username, password, pin, onNext } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <ThemedScene title={lstrings.review}>
      <ScrollView contentContainerStyle={styles.content}>
        <EdgeText style={styles.description} numberOfLines={2}>
          {lstrings.tap_to_review_button}
        </EdgeText>
        <FormError
          marginRem={[0, 0, 2]}
          title={lstrings.alert_dropdown_warning}
          numberOfLines={2}
          isWarning
        >
          {lstrings.warning_message}
        </FormError>
        <AccountInfo
          marginRem={[0, 2.5]}
          username={username}
          password={password}
          pin={pin}
        />
        <View style={styles.actions}>
          <MainButton
            label={lstrings.create}
            type="secondary"
            onPress={onNext}
          />
        </View>
      </ScrollView>
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
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.rem(5),
    minHeight: theme.rem(3)
  }
}))

/**
 * The review scene for new accounts.
 */
interface NewAccountReviewProps extends SceneProps<'newAccountReview'> {
  branding: Branding
}

export const NewAccountReviewScene = (props: NewAccountReviewProps) => {
  const { route } = props
  const { onLogEvent = (event, values?) => {} } = useImports()
  const dispatch = useDispatch()

  const handleNext = useHandler(() => {
    onLogEvent(`Signup_Review_Done`)
    dispatch(completeLogin(route.params.account))
  })

  return <AccountReviewComponent {...route.params} onNext={handleNext} />
}

/**
 * The review scene for upgrading (light) accounts.
 */
interface UpgradeReviewProps extends SceneProps<'upgradeAccountReview'> {
  branding: Branding
}

export const UpgradeReviewScene = (props: UpgradeReviewProps) => {
  const { route } = props
  const { onComplete, onLogEvent = (event, values?) => {} } = useImports()

  const handleNext = useHandler(() => {
    onLogEvent(`Backup_Review_Done`)

    if (onComplete != null) onComplete()
  })

  return <AccountReviewComponent {...route.params} onNext={handleNext} />
}
