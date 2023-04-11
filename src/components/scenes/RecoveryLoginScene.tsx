import { OtpError } from 'edge-core-js'
import * as React from 'react'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import { login } from '../../actions/LoginAction'
import s from '../../common/locales/strings'
import { useDispatch, useSelector } from '../../types/ReduxTypes'
import { LoginAttempt } from '../../util/loginAttempt'
import { Tile } from '../common/Tile'
import { WarningCard } from '../common/WarningCard'
import { DateModal } from '../modals/DateModal'
import { TextInputModal } from '../modals/TextInputModal'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { MainButton } from '../themed/MainButton'
import { ThemedScene } from '../themed/ThemedScene'

export const RecoveryLoginScene = () => {
  const theme = useTheme()
  const styles = getStyles(theme)
  const dispatch = useDispatch()

  const answerPrompt = s.strings.your_answer_label
  const username = useSelector(state => state.login.username)
  const recoveryKey = useSelector(
    state => state.passwordRecovery.recoveryKey ?? ''
  )
  const questions = useSelector(state => state.passwordRecovery.userQuestions)
  const showCaseSensitivityWarning = questions.some(
    q => q.startsWith('text:') || !q.includes(':')
  )
  const [answers, setAnswers] = useState<Array<string | null>>([])

  const attemptLogin = async (attempt: LoginAttempt) => {
    return await dispatch(login(attempt))
  }
  const saveOtpError = (attempt: LoginAttempt, error: OtpError) => {
    dispatch({ type: 'OTP_ERROR', data: { attempt, error } })
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
        : sprintf(s.strings.min_length_error, minLength)
    }
    Airship.show<string | undefined>(bridge => (
      <TextInputModal
        bridge={bridge}
        title={sprintf(s.strings.recovery_answer, index + 1)}
        inputLabel={s.strings.recovery_answer_placeholder}
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
    await attemptLogin(attempt).catch(error => {
      if (error != null && error.name === 'OtpError') {
        saveOtpError(attempt, error)
      } else {
        const errorMessage =
          error != null
            ? error.name === 'PasswordError'
              ? s.strings.recovery_error
              : error.message
            : 'Unknown error'
        showError(errorMessage)
      }
    })
  }
  const renderQuestionAnswer = (index: number) => {
    return (
      <View>
        <Tile
          type="static"
          title={sprintf(s.strings.recovery_question, index + 1)}
          body={
            questions[index]?.split(':').slice(-1)[0] ??
            sprintf(s.strings.recovery_question, index + 1)
          }
        />
        <Tile
          type="touchable"
          title={sprintf(s.strings.recovery_answer, index + 1)}
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
      <WarningCard title={s.strings.answer_case_sensitive} marginRem={1} />
    ) : null
  }

  const renderSubmitButton = () => {
    return (
      <View style={styles.buttonsContainer}>
        <MainButton
          alignSelf="stretch"
          label={s.strings.submit}
          marginRem={[1, 0.5]}
          onPress={handleSubmit}
          disabled={
            answers.length < questions.length || answers.some(a => a == null)
          }
          type="secondary"
        />
      </View>
    )
  }

  return (
    <ThemedScene
      paddingRem={0}
      onBack={() => dispatch({ type: 'START_PASSWORD_LOGIN' })}
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
