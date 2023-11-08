import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { Alert, Linking, ScrollView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import { completeLogin } from '../../../actions/LoginCompleteActions'
import { loadTouchState } from '../../../actions/TouchActions'
import { getAppConfig } from '../../../common/appConfig'
import { lstrings } from '../../../common/locales/strings'
import * as Constants from '../../../constants/index'
import { useHandler } from '../../../hooks/useHandler'
import { useImports } from '../../../hooks/useImports'
import { useScrollToEnd } from '../../../hooks/useScrollToEnd'
import { enableTouchId } from '../../../keychain'
import { Branding } from '../../../types/Branding'
import { Dispatch, useDispatch } from '../../../types/ReduxTypes'
import {
  AccountParams,
  CreateFlowParams,
  SceneProps
} from '../../../types/routerTypes'
import { ChallengeModal } from '../../modals/ChallengeModal'
import { Airship, showError } from '../../services/AirshipInstance'
import { Theme, useTheme } from '../../services/ThemeContext'
import { Checkbox } from '../../themed/Checkbox'
import { EdgeText } from '../../themed/EdgeText'
import { Fade } from '../../themed/Fade'
import { MainButton } from '../../themed/MainButton'
import { ThemedScene } from '../../themed/ThemedScene'

export interface AccountTosParams extends AccountParams, CreateFlowParams {}

interface Props {
  branding: Branding
  hidePasswordTerms: boolean
  onBack: () => void
  onNext: () => Promise<void>
}

const TosComponent = (props: Props) => {
  const { branding, hidePasswordTerms, onBack, onNext } = props
  const dispatch = useDispatch()
  const theme = useTheme()

  const styles = getStyles(theme)

  const [termValues, setTermValues] = React.useState<boolean[]>(
    hidePasswordTerms ? [false, false, false] : [false, false, false, false]
  )
  const showNext = !termValues.includes(false)
  const scrollViewRef = useScrollToEnd(showNext)
  const buttonType = theme.preferPrimaryButton ? 'primary' : 'secondary'

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

  const handleNextPress = useHandler(() => {
    onNext().catch((e: any) => {
      console.error(e)
      Alert.alert(
        lstrings.create_account_error_title,
        lstrings.create_account_error_message + '\n' + e.message,
        [{ text: lstrings.ok }]
      )
      dispatch({
        type: 'NAVIGATE',
        data: { name: 'newAccountUsername', params: {} }
      })
    })
  })

  return (
    <ThemedScene onBack={onBack} title={lstrings.account_confirmation}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content}>
        <EdgeText
          style={styles.subtitle}
        >{`${lstrings.review}: ${lstrings.read_understod_2}`}</EdgeText>
        {terms.map((term, index) => (
          <Checkbox
            key={index}
            textStyle={styles.term}
            value={termValues[index]}
            onChange={(value: boolean) => handleStatusChange(index, value)}
            marginRem={[0, 0, 1.33, 0]}
          >
            {term}
          </Checkbox>
        ))}
        <EdgeText
          style={styles.agreeText}
          numberOfLines={2}
          onPress={async () =>
            await Linking.openURL(getAppConfig().termsOfServiceSite)
          }
        >
          {lstrings.read_understod_1}
          <EdgeText style={styles.agreeTextLink}>
            {lstrings.read_understod_2}
          </EdgeText>
        </EdgeText>
        <View style={styles.actions}>
          <Fade visible={showNext}>
            <MainButton
              label={lstrings.confirm}
              paddingRem={0.7}
              type={buttonType}
              onPress={handleNextPress}
            />
          </Fade>
        </View>
      </ScrollView>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    marginHorizontal: theme.rem(0.5),
    marginTop: theme.rem(0.5)
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
    width: '60%',
    alignSelf: 'center',
    marginTop: theme.rem(1),
    marginHorizontal: theme.rem(2),
    fontSize: theme.rem(0.875)
  },
  agreeTextLink: {
    fontSize: theme.rem(0.875),
    color: theme.linkText
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.rem(2.75),
    minHeight: theme.rem(6)
  }
}))

const setTouchOtp = async (account: EdgeAccount, dispatch: Dispatch) => {
  await enableTouchId(account).catch(e => {
    console.log(e) // Fail quietly
  })
  await account.dataStore.setItem(
    Constants.OTP_REMINDER_STORE_NAME,
    Constants.OTP_REMINDER_KEY_NAME_CREATED_AT,
    Date.now().toString()
  )
  dispatch(loadTouchState())
}

/**
 * Terms of Service scene for new regular or light accounts
 */
interface NewAccountTosProps extends SceneProps<'newAccountTos'> {
  branding: Branding
}
export const NewAccountTosScene = (props: NewAccountTosProps) => {
  const { route, branding } = props
  const imports = useImports()
  const {
    context,

    accountOptions,
    experimentConfig,

    onLogEvent = (event, values?) => {}
  } = imports
  const dispatch = useDispatch()

  const handleBack = useHandler((): void => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'newAccountPin', params: { ...route.params } }
    })
  })

  const handleNext = useHandler(async () => {
    const { username, password, pin } = route.params

    const lightAccount = experimentConfig.createAccountType === 'light'

    if (experimentConfig.signupCaptcha === 'withCaptcha') {
      onLogEvent('Signup_Captcha_Shown')
      const result = await Airship.show<boolean | undefined>(bridge => {
        return <ChallengeModal bridge={bridge} />
      })
      // User closed the modal
      if (result == null) {
        onLogEvent('Signup_Captcha_Quit')
        return
      }
      if (!result) {
        onLogEvent('Signup_Captcha_Failed')
        showError(lstrings.failed_captcha_error)
        return
      }
      onLogEvent('Signup_Captcha_Passed')
    }

    let error
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

      const account = await context.createAccount({
        ...accountOptions,
        username,
        password,
        pin
      })
      account.watch('loggedIn', loggedIn => {
        if (!loggedIn) dispatch({ type: 'RESET_APP' })
      })
      await setTouchOtp(account, dispatch)

      if (lightAccount) {
        dispatch(completeLogin(account))
      } else {
        dispatch({
          type: 'NAVIGATE',
          data: {
            name: 'newAccountReview',
            params: {
              ...route.params,
              account
            }
          }
        })
      }
    } catch (e: any) {
      showError(e)
      dispatch({
        type: 'NAVIGATE',
        data: { name: 'newAccountTos', params: route.params }
      })
      error = String(e)
    }

    onLogEvent('Signup_Terms_Agree_and_Create_User', {
      error
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
  const { onLogEvent = (event, values?) => {} } = useImports()
  const dispatch = useDispatch()

  const handleBack = useHandler((): void => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'upgradeUsername', params: { ...route.params } }
    })
  })

  const handleNext = useHandler(async () => {
    const { account, username, password } = route.params

    let error
    try {
      if (username == null || password == null)
        throw new Error(
          'Failed to update account, missing username or password'
        )
      await account.changeUsername({
        username,
        password
      })

      dispatch({
        type: 'NAVIGATE',
        data: {
          name: 'upgradeAccountReview',
          params: {
            ...route.params
          }
        }
      })
    } catch (e: any) {
      error = String(e)
    }

    onLogEvent('Backup_Terms_Agree_and_Create_User', { error })
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
