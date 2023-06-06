import * as React from 'react'
import { ScrollView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { checkAndRequestNotifications } from '../../../actions/LoginInitActions'
import s from '../../../common/locales/strings'
import { useImports } from '../../../hooks/useImports'
import { Branding } from '../../../types/Branding'
import { useDispatch } from '../../../types/ReduxTypes'
import { SceneProps } from '../../../types/routerTypes'
import { logEvent } from '../../../util/analytics'
import { Airship } from '../../services/AirshipInstance'
import { Theme, useTheme } from '../../services/ThemeContext'
import { AccountInfo } from '../../themed/AccountInfo'
import { EdgeText } from '../../themed/EdgeText'
import { FormError } from '../../themed/FormError'
import { MainButton } from '../../themed/MainButton'
import { ThemedScene } from '../../themed/ThemedScene'

interface Props extends SceneProps<'newAccountReview'> {
  branding: Branding
}

export const NewAccountReviewScene = (props: Props) => {
  const { branding, route } = props
  const { account } = route.params
  const dispatch = useDispatch()
  const { onLogin } = useImports()
  const theme = useTheme()
  const styles = getStyles(theme)

  const handleNext = () => {
    logEvent(`Signup_Review_Done`)

    Airship.clear()
    if (onLogin != null) onLogin(account)

    dispatch(checkAndRequestNotifications(branding)).catch(error =>
      console.log(error)
    )
  }

  return (
    <ThemedScene title={s.strings.review}>
      <ScrollView contentContainerStyle={styles.content}>
        <EdgeText style={styles.description} numberOfLines={2}>
          {s.strings.tap_to_review_button}
        </EdgeText>
        <FormError
          marginRem={[0, 0, 2]}
          title={s.strings.alert_dropdown_warning}
          numberOfLines={2}
          isWarning
        >
          {s.strings.warning_message}
        </FormError>
        <AccountInfo marginRem={[0, 2.5]} />
        <View style={styles.actions}>
          <MainButton
            label={s.strings.create}
            type="secondary"
            onPress={handleNext}
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
