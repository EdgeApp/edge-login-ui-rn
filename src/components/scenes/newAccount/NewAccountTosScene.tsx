import { asMaybeNetworkError, EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { Linking, ScrollView } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import { getAppConfig } from '../../../common/appConfig'
import { lstrings } from '../../../common/locales/strings'
import { useCreateAccountHandler } from '../../../hooks/useCreateAccount'
import { useHandler } from '../../../hooks/useHandler'
import { useImports } from '../../../hooks/useImports'
import { useScrollToEnd } from '../../../hooks/useScrollToEnd'
import { Branding } from '../../../types/Branding'
import { useDispatch } from '../../../types/ReduxTypes'
import { SceneProps } from '../../../types/routerTypes'
import { EdgeAnim } from '../../common/EdgeAnim'
import { SceneButtons } from '../../common/SceneButtons'
import { showError } from '../../services/AirshipInstance'
import { Theme, useTheme } from '../../services/ThemeContext'
import { Checkbox } from '../../themed/Checkbox'
import { EdgeText } from '../../themed/EdgeText'
import { ThemedScene } from '../../themed/ThemedScene'

export interface UpgradeTosParams {
  account: EdgeAccount
  password: string
  username: string
}

export interface NewAccountTosParams {
  password?: string
  pin: string
  username?: string
}

interface Props {
  branding: Branding
  hidePasswordTerms: boolean
  onBack: () => void
  onNext: () => Promise<void>
}

const TosComponent = (props: Props) => {
  const { branding, hidePasswordTerms, onBack, onNext } = props
  const theme = useTheme()

  const styles = getStyles(theme)

  const [termValues, setTermValues] = React.useState<boolean[]>(
    hidePasswordTerms ? [false, false, false] : [false, false, false, false]
  )
  const showNext = !termValues.includes(false)
  const scrollViewRef = useScrollToEnd(showNext)

  const { appName = lstrings.app_name_default } = branding
  const terms: string[] = [
    sprintf(lstrings.terms_one, appName),
    hidePasswordTerms ? lstrings.terms_two_alt : lstrings.terms_two,
    ...(hidePasswordTerms ? [] : [sprintf(lstrings.terms_three, appName)]),
    sprintf(lstrings.terms_four, appName)
  ]

  const handleStatusChange = useHandler((index: number, value: boolean) => {
    const newTermValues = [...termValues]
    newTermValues[index] = value
    setTermValues(newTermValues)
  })

  return (
    <ThemedScene
      onBack={onBack}
      title={lstrings.account_confirmation}
      paddingRem={[0.5, 0.5, 0]}
    >
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content}>
        <EdgeAnim enter={{ type: 'fadeInRight', distance: 50 }}>
          <EdgeText
            style={styles.subtitle}
          >{`${lstrings.review_tos}`}</EdgeText>
        </EdgeAnim>
        {terms.map((term, index) => (
          <EdgeAnim
            key={index}
            enter={{ type: 'fadeInRight', distance: 50 * (index + 2) }}
          >
            <Checkbox
              textStyle={styles.term}
              value={termValues[index]}
              onChange={(value: boolean) => handleStatusChange(index, value)}
              marginRem={[0, 0, 1.33, 0]}
            >
              {term}
            </Checkbox>
          </EdgeAnim>
        ))}
        <EdgeAnim
          enter={{ type: 'fadeInDown' }}
          exit={{ type: 'fadeOutDown' }}
          visible={showNext}
        >
          <EdgeText
            style={styles.agreeText}
            numberOfLines={2}
            onPress={async () =>
              await Linking.openURL(getAppConfig().termsOfServiceSite)
            }
          >
            {lstrings.read_understood_1}
            <EdgeText style={styles.agreeTextLink}>
              {lstrings.read_understood_2}
            </EdgeText>
          </EdgeText>

          <SceneButtons
            primary={{
              label: lstrings.confirm,
              onPress: onNext
            }}
          />
        </EdgeAnim>
      </ScrollView>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    marginHorizontal: theme.rem(0.5),
    flexGrow: 1,
    flexShrink: 0
  },
  subtitle: {
    fontFamily: theme.fontFaceBold,
    color: theme.secondaryText,
    fontSize: theme.rem(1),
    marginBottom: theme.rem(1.5)
  },
  term: {
    fontSize: theme.rem(0.875)
  },
  agreeText: {
    alignSelf: 'center',
    fontSize: theme.rem(0.875),
    marginTop: theme.rem(1),
    marginHorizontal: theme.rem(2),
    textAlign: 'center',
    width: '75%'
  },
  agreeTextLink: {
    color: theme.linkText,
    fontSize: theme.rem(0.875),
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid'
  }
}))

/**
 * Terms of Service scene for new full accounts
 */
interface NewAccountTosProps extends SceneProps<'newAccountTos'> {
  branding: Branding
}
export const NewAccountTosScene = (props: NewAccountTosProps) => {
  const { route, branding } = props
  const { password, pin, username } = route.params
  const dispatch = useDispatch()

  const handleBack = useHandler((): void => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'newAccountPin', params: { ...route.params } }
    })
  })

  const { onLogEvent = () => {} } = useImports()
  const handleCreateAccount = useCreateAccountHandler()

  const handleNext = useHandler(async () => {
    let errorText
    try {
      dispatch({
        type: 'NAVIGATE',
        data: {
          name: 'newAccountWait',
          params: {
            title: lstrings.great_job,
            message: lstrings.hang_tight + '\n' + lstrings.secure_account
          }
        }
      })

      const account = await handleCreateAccount({ username, password, pin })
      if (account == null) return handleBack()

      dispatch({
        type: 'NAVIGATE',
        data: {
          name: 'newAccountReview',
          params: { ...route.params, account }
        }
      })
    } catch (error: unknown) {
      if (asMaybeNetworkError(error) != null) {
        showError(lstrings.network_error_generic)
      } else {
        showError(error)
      }
      errorText = String(error)
      dispatch({
        type: 'NAVIGATE',
        data: {
          name: 'newAccountTos',
          params: route.params
        }
      })
    }

    onLogEvent('Signup_Terms_Agree_and_Create_User', {
      error: errorText
    })
  })

  return (
    <TosComponent
      hidePasswordTerms={route.params.username == null}
      branding={branding}
      onBack={handleBack}
      onNext={handleNext}
    />
  )
}

/**
 * Terms of Service scene for upgrading existing (light) accounts
 */
interface UpgradeTosProps extends SceneProps<'upgradeTos'> {
  branding: Branding
}
export const UpgradeTosScene = (props: UpgradeTosProps) => {
  const { route, branding } = props
  const { account, password, username } = route.params
  const { onLogEvent = () => {} } = useImports()
  const dispatch = useDispatch()

  const handleBack = useHandler((): void => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'upgradeUsername', params: { ...route.params } }
    })
  })

  const handleNext = useHandler(async () => {
    let errorText
    try {
      await account.changeUsername({
        username,
        password
      })
      const pin = await account.getPin()

      dispatch({
        type: 'NAVIGATE',
        data: {
          name: 'upgradeAccountReview',
          params: { ...route.params, pin }
        }
      })
    } catch (error: unknown) {
      if (asMaybeNetworkError(error) != null) {
        showError(lstrings.network_error_generic)
      } else {
        showError(error)
      }
      errorText = String(error)
    }

    onLogEvent('Backup_Terms_Agree_and_Create_User', { error: errorText })
  })

  return (
    <TosComponent
      branding={branding}
      hidePasswordTerms={false}
      onBack={handleBack}
      onNext={handleNext}
    />
  )
}
