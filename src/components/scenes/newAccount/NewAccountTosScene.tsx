import * as React from 'react'
import { Alert, Linking, ScrollView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import { loadTouchState } from '../../../actions/TouchActions'
import { getAppConfig } from '../../../common/appConfig'
import s from '../../../common/locales/strings'
import * as Constants from '../../../constants/index'
import { useImports } from '../../../hooks/useImports'
import { useScrollToEnd } from '../../../hooks/useScrollToEnd'
import { enableTouchId, isTouchDisabled } from '../../../keychain'
import { Branding } from '../../../types/Branding'
import { useDispatch } from '../../../types/ReduxTypes'
import { SceneProps } from '../../../types/routerTypes'
import { logEvent } from '../../../util/analytics'
import { Theme, useTheme } from '../../services/ThemeContext'
import { Checkbox } from '../../themed/Checkbox'
import { EdgeText } from '../../themed/EdgeText'
import { Fade } from '../../themed/Fade'
import { MainButton } from '../../themed/MainButton'
import { ThemedScene } from '../../themed/ThemedScene'

interface Props extends SceneProps<'newAccountTos'> {
  branding: Branding
}

export const NewAccountTosScene = (props: Props) => {
  const { branding, route } = props
  const dispatch = useDispatch()
  const theme = useTheme()
  const imports = useImports()

  const styles = getStyles(theme)

  const isLightAccount = route.params.username == null

  const [termValues, setTermValues] = React.useState<boolean[]>(
    isLightAccount ? [false, false, false] : [false, false, false, false]
  )
  const showNext = !termValues.includes(false)
  const scrollViewRef = useScrollToEnd(showNext)
  const buttonType = theme.preferPrimaryButton ? 'primary' : 'secondary'

  const { appName = s.strings.app_name_default } = branding
  const terms: string[] = [
    sprintf(s.strings.terms_one, appName),
    s.strings.terms_two,
    sprintf(s.strings.terms_three, appName),
    sprintf(s.strings.terms_four, appName)
  ]

  const handleBack = (): void => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'newAccountPin', params: {} }
    })
  }

  const handleStatusChange = (index: number, value: boolean) => {
    const newTermValues = [...termValues]
    newTermValues[index] = value
    setTermValues(newTermValues)
  }

  const handleCreateAccount = async () => {
    const { username, password, pin } = route.params
    const { context } = imports
    const account = await context.createAccount({
      ...imports.accountOptions,
      username,
      password,
      pin
    })
    account.watch('loggedIn', loggedIn => {
      if (!loggedIn) dispatch({ type: 'RESET_APP' })
    })
    const touchDisabled = await isTouchDisabled(account)
    if (!touchDisabled) {
      await enableTouchId(account).catch(e => {
        console.log(e) // Fail quietly
      })
    }
    dispatch({ type: 'CREATE_ACCOUNT_SUCCESS', data: account })
    dispatch({
      type: 'NAVIGATE',
      data: {
        name: 'newAccountReview',
        params: { ...route.params, account: account }
      }
    })
    logEvent('Signup_Create_User_Success')
    await account.dataStore.setItem(
      Constants.OTP_REMINDER_STORE_NAME,
      Constants.OTP_REMINDER_KEY_NAME_CREATED_AT,
      Date.now().toString()
    )
    dispatch(loadTouchState())
  }

  const handleNextPress = () => {
    logEvent(`Signup_Terms_Agree_and_Create_User`)
    if (route.params.pin == null) throw new Error('No PIN set')
    dispatch({
      type: 'NAVIGATE',
      data: {
        name: 'newAccountWait',
        params: {
          title: s.strings.great_job,
          message: s.strings.hang_tight + '\n' + s.strings.secure_account
        }
      }
    })
    setTimeout(() => {
      handleCreateAccount().catch((e: any) => {
        console.error(e)
        Alert.alert(
          s.strings.create_account_error_title,
          s.strings.create_account_error_message + '\n' + e.message,
          [{ text: s.strings.ok }]
        )
        dispatch({
          type: 'NAVIGATE',
          data: { name: 'newAccountUsername', params: {} }
        })
      })
    }, 300)
  }

  return (
    <ThemedScene onBack={handleBack} title={s.strings.account_confirmation}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content}>
        <EdgeText
          style={styles.subtitle}
        >{`${s.strings.review}: ${s.strings.read_understod_2}`}</EdgeText>
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
          {s.strings.read_understod_1}
          <EdgeText style={styles.agreeTextLink}>
            {s.strings.read_understod_2}
          </EdgeText>
        </EdgeText>
        <View style={styles.actions}>
          <Fade visible={showNext}>
            <MainButton
              label={s.strings.confirm}
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
