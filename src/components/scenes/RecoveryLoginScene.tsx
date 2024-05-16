import { asMaybeOtpError, asMaybePasswordError, OtpError } from 'edge-core-js'
import * as React from 'react'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import { completeLogin } from '../../actions/LoginCompleteActions'
import { lstrings } from '../../common/locales/strings'
import { useImports } from '../../hooks/useImports'
import { useDispatch } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { attemptLogin, LoginAttempt } from '../../util/loginAttempt'
import { Tile } from '../common/Tile'
import { WarningCard } from '../common/WarningCard'
import { DateModal } from '../modals/DateModal'
import { TextInputModal } from '../modals/TextInputModal'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { MainButton } from '../themed/MainButton'
import { ThemedScene } from '../themed/ThemedScene'

export interface RecoveryLoginParams {
  username: string
  recoveryKey: string
  userQuestions: string[]
}

export const RecoveryLoginScene = (props: SceneProps<'recoveryLogin'>) => {
  const { route } = props
  const { recoveryKey, userQuestions: questions, username } = route.params
  const theme = useTheme()
  const styles = getStyles(theme)
  const dispatch = useDispatch()
  const { accountOptions, context, onPerfEvent } = useImports()

  const answerPrompt = lstrings.your_answer_label
  const showCaseSensitivityWarning = questions.some(
    q => q.startsWith('text:') || !q.includes(':')
  )
  const [answers, setAnswers] = useState<Array<string | null>>([])

  const saveOtpError = (otpAttempt: LoginAttempt, otpError: OtpError) => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'otpError', params: { otpAttempt, otpError } }
    })
  }

  const showDatePickerModal = (index: number) => {
    const now = new Date()
    Airship.show<Date>(bridge => (
      <DateModal bridge={bridge} initialValue={now} />
    )).then(answer => {
      const date = answer.toISOString().split('T')[0]
      answers[index] = date
      setAnswers([...answers])
    })
  }

  const showTextInputModal = (index: number) => {
    let minLengthString = questions[index].split(':')[1]
    if (minLengthString == null || minLengthString.trim() === '')
      minLengthString = '0'

    const minLength = parseInt(minLengthString)

    const validateAnswer = async (answer: string) => {
      return answer.length >= minLength
        ? true
        : sprintf(lstrings.min_length_error, minLength)
    }
    Airship.show<string | undefined>(bridge => (
      <TextInputModal
        bridge={bridge}
        title={sprintf(lstrings.recovery_answer, index + 1)}
        inputLabel={lstrings.recovery_answer_placeholder}
        returnKeyType="go"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        onSubmit={validateAnswer}
      />
    )).then(text => {
      if (text == null) return
      answers[index] = text
      setAnswers([...answers])
    })
  }
  const handleAnswer = (index: number) => () => {
    if (questions[index] == null) return
    if (questions[index].startsWith('date:')) {
      showDatePickerModal(index)
    } else if (questions[index].startsWith('text:')) {
      showTextInputModal(index)
    } else {
      // Legacy Questions
      showTextInputModal(index)
    }
  }

  const handleSubmit = async () => {
    const okAnswers = answers.filter((a): a is string => a != null)
    const attempt: LoginAttempt = {
      type: 'recovery',
      recoveryKey,
      username,
      answers: okAnswers
    }
    try {
      const account = await attemptLogin(
        context,
        attempt,
        accountOptions,
        onPerfEvent
      )
      await dispatch(completeLogin(account))
    } catch (error: unknown) {
      const otpError = asMaybeOtpError(error)
      if (otpError != null) {
        return saveOtpError(attempt, otpError)
      }

      const passwordError = asMaybePasswordError(error)
      if (passwordError != null) {
        return showError(lstrings.recovery_error)
      }

      showError(error instanceof Error ? error.message : 'Unknown error')
    }
  }
  const renderQuestionAnswer = (index: number) => {
    return (
      <View>
        <Tile
          type="static"
          title={sprintf(lstrings.recovery_question, index + 1)}
          body={
            questions[index]?.split(':').slice(-1)[0] ??
            sprintf(lstrings.recovery_question, index + 1)
          }
        />
        <Tile
          type="touchable"
          title={sprintf(lstrings.recovery_answer, index + 1)}
          body={answers[index] ?? answerPrompt}
          onPress={handleAnswer(index)}
        />
      </View>
    )
  }
  const renderForm = () => {
    return (
      <View style={styles.formContainer}>
        {renderQuestionAnswer(0)}
        {renderQuestionAnswer(1)}
        {renderWarning()}
      </View>
    )
  }
  const renderWarning = () => {
    return showCaseSensitivityWarning ? (
      <WarningCard title={lstrings.answer_case_sensitive} marginRem={1} />
    ) : null
  }

  const renderSubmitButton = () => {
    return (
      <View style={styles.buttonsContainer}>
        <MainButton
          label={lstrings.submit}
          marginRem={[1, 0.5]}
          onPress={handleSubmit}
          disabled={
            answers.length < questions.length || answers.some(a => a == null)
          }
          type="primary"
        />
      </View>
    )
  }

  return (
    <ThemedScene
      paddingRem={0}
      onBack={() =>
        dispatch({
          type: 'NAVIGATE',
          data: { name: 'passwordLogin', params: { username } }
        })
      }
    >
      <ScrollView contentContainerStyle={styles.content}>
        {renderForm()}
        {renderSubmitButton()}
      </ScrollView>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: theme.rem(1.5)
  },
  formContainer: {
    width: '100%',
    marginBottom: theme.rem(1)
  },
  buttonsContainer: {
    marginHorizontal: theme.rem(1),
    marginBottom: theme.rem(1)
  }
}))
