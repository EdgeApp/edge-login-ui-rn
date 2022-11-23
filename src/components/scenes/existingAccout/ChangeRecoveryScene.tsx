import * as React from 'react'
import { useMemo, useState } from 'react'
import { Keyboard, ScrollView, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import {
  sendRecoveryEmail,
  shareRecovery
} from '../../../actions/PasswordRecoveryActions'
import { onComplete } from '../../../actions/WorkflowActions'
import s from '../../../common/locales/strings'
import { questionsList } from '../../../constants/recoveryQuestions'
import { Branding } from '../../../types/Branding'
import { useDispatch, useSelector } from '../../../types/ReduxTypes'
import { Tile } from '../../common/Tile'
import { WarningCard } from '../../common/WarningCard'
import { ButtonsModal } from '../../modals/ButtonsModal'
import { DateModal } from '../../modals/DateModal'
import { RadioListModal } from '../../modals/RadioListModal'
import { TextInputModal } from '../../modals/TextInputModal'
import { Airship, showError } from '../../services/AirshipInstance'
import { Theme, useTheme } from '../../services/ThemeContext'
import { MainButton } from '../../themed/MainButton'
import { ModalMessage } from '../../themed/ModalParts'
import { ThemedScene } from '../../themed/ThemedScene'
interface Props {
  branding: Branding
  // eslint-disable-next-line react/no-unused-prop-types
  showHeader: boolean
}
export const ChangeRecoveryScene = ({ branding }: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)
  const dispatch = useDispatch()

  const numQuestions = 2
  const questionPrompt = s.strings.choose_recovery_question
  const answerPrompt = s.strings.recovery_answer_prompt

  const account = useSelector(state => state.account)
  const userQuestions = useSelector(
    state => state.passwordRecovery.userQuestions
  )
  const [recoveryLocked, setRecoveryLocked] = useState(userQuestions.length > 0)

  const [questions, setQuestions] = useState<string[]>([...userQuestions])
  const [answers, setAnswers] = useState<Array<string | null>>([])
  const showCaseSensitivityWarning = useMemo<boolean>(
    () => questions.some(q => !q.startsWith('date:')),
    [questions]
  )

  const done = async () => {
    dispatch(onComplete())
  }

  const clearAnswers = async () => {
    setAnswers([])
  }

  const clearForm = async () => {
    clearAnswers()
    setQuestions([questionPrompt, questionPrompt])
  }

  const handleQuestion = (index: number) => () => {
    const questionsText = questionsList.map(q => q.split(':').slice(-1)[0])
    Airship.show<string | undefined>(bridge => (
      <RadioListModal
        bridge={bridge}
        title={sprintf(s.strings.recovery_question, index + 1)}
        items={questionsText.filter(
          questionText =>
            !questions.some(q => q.endsWith(questionText)) ||
            questions[index]?.endsWith(questionText)
        )}
        selected={questions[index]?.split(':').slice(-1)[0]}
      />
    )).then(question => {
      if (question == null) return

      questions[index] = questionsList[questionsText.indexOf(question)]
      setQuestions([...questions])

      if (answers[index]) {
        answers[index] = null
        setAnswers([...answers])
      }
    })
  }

  const showDatePickerModal = async (index: number) => {
    await Airship.show<Date>(bridge => <DateModal bridge={bridge} />).then(
      answer => {
        const date = answer.toISOString().split('T')[0]
        answers[index] = date
        setAnswers([...answers])
      }
    )
  }

  const showTextInputModal = async (index: number) => {
    const minLength = parseInt(questions[index]?.split(':')[1] ?? 0)
    const validateAnswer = async (answer: string) => {
      return answer.length >= minLength
        ? true
        : sprintf(s.strings.min_length_error, minLength)
    }
    await Airship.show<string | undefined>(bridge => (
      <TextInputModal
        bridge={bridge}
        title={s.strings.recovery}
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
  const renderEmailBody = () => {
    return (
      <View style={styles.emailContainer}>
        <ModalMessage>{s.strings.recovery_complete_save_token}</ModalMessage>
        <ModalMessage isWarning>
          {s.strings.recovery_complete_token_required}
        </ModalMessage>
        <ModalMessage>{s.strings.recovery_complete_email_prompt}</ModalMessage>
      </View>
    )
  }

  // Rudimentary email validity check
  const handleSubmitEmail = async (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? true
      : s.strings.recovery_invalid_email
  }
  const handleEnableEmail = async () => {
    if (account == null) return
    const { username } = account
    const emailAddress: string | undefined = await Airship.show(bridge => (
      <TextInputModal
        bridge={bridge}
        title={s.strings.recovery_complete_email_title}
        message={renderEmailBody()}
        inputLabel={s.strings.recovery_complete_enter_email_label}
        submitLabel={s.strings.next_label}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="go"
        onSubmit={handleSubmitEmail}
      />
    ))
    if (emailAddress == null) return

    const okAnswers = answers.filter((a): a is string => s != null)
    const recoveryKey = await account.changeRecovery(questions, okAnswers)
    try {
      await sendRecoveryEmail(emailAddress, username, recoveryKey, branding)
      await Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={s.strings.recovery_success_title}
          message={s.strings.recovery_success_message}
          buttons={{ ok: { label: s.strings.ok } }}
        />
      ))
      clearAnswers()
      done()
    } catch (error) {
      await Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={s.strings.recovery_error_email_title}
          message={s.strings.recovery_error_email_body}
          buttons={{ ok: { label: s.strings.ok } }}
        />
      )).then(() => showError(error))
    }
  }

  const handleEnableShare = async () => {
    if (account == null) return
    try {
      const okAnswers = answers.filter((a): a is string => s != null)
      const recoveryKey = await account.changeRecovery(questions, okAnswers)
      await shareRecovery(account.username, recoveryKey, branding)
      await Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={s.strings.recovery_success_title}
          message={s.strings.recovery_success_message}
          buttons={{ ok: { label: s.strings.ok } }}
        />
      ))
      clearAnswers().then(async () => await done())
    } catch (error) {
      await Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={s.strings.recovery_error_share_title}
          message={s.strings.recovery_error_share_body}
          buttons={{ ok: { label: s.strings.ok } }}
        />
      )).then(() => showError(error))
    }
  }

  const changeRecovery = async () => {
    if (account == null) return
    Keyboard.dismiss()
    try {
      Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={s.strings.recovery_change_title}
          message={s.strings.recovery_change_message}
          buttons={{
            ok: {
              label: s.strings.ok
            },
            cancel: {
              label: s.strings.cancel,
              type: 'secondary'
            }
          }}
        />
      )).then(async button => {
        if (button === 'cancel') return
        await clearAnswers().then(() => {
          setRecoveryLocked(false)
        })
      })
    } catch (error) {
      showError(error)
    }
  }

  const disableRecovery = async () => {
    if (account == null) return
    Keyboard.dismiss()
    try {
      Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={s.strings.recovery_reset_confirm_title}
          message={s.strings.recovery_reset_confirm_message}
          buttons={{
            confirm: {
              label: s.strings.confirm
            },
            cancel: {
              label: s.strings.cancel,
              type: 'secondary'
            }
          }}
        />
      )).then(async button => {
        if (button !== 'confirm') return
        await account.deleteRecovery()
        await clearForm().then(async () => await done())
      })
    } catch (error) {
      showError(error)
    }
  }

  const renderQuestionAnswer = (index: number) => {
    return (
      <View>
        <Tile
          type="touchable"
          title={sprintf(s.strings.recovery_question, index + 1)}
          body={questions[index]?.split(':').slice(-1)[0] ?? questionPrompt}
          onPress={handleQuestion(index)}
          disabled={recoveryLocked}
        />
        <Tile
          type={questions[index] == null ? 'static' : 'touchable'}
          title={sprintf(s.strings.recovery_answer, index + 1)}
          body={answers[index] ?? answerPrompt}
          onPress={handleAnswer(index)}
          disabled={recoveryLocked}
        />
      </View>
    )
  }
  const renderForm = () => {
    return (
      <View style={styles.formContainer}>
        {renderQuestionAnswer(0)}
        {renderQuestionAnswer(1)}
      </View>
    )
  }
  const renderWarning = () => {
    return (
      showCaseSensitivityWarning &&
      !recoveryLocked && (
        <WarningCard
          title={s.strings.recovery_warning}
          marginRem={[0.5, 0.5, 0.25, 0.5]}
        />
      )
    )
  }
  const renderModifyButtons = () => {
    return (
      <View style={styles.buttonsContainer}>
        <MainButton
          alignSelf="center"
          label={s.strings.recovery_change_button}
          marginRem={1}
          onPress={changeRecovery}
          type="secondary"
        />
        <TouchableOpacity onPress={disableRecovery}>
          <View style={styles.disableButtonContainer}>
            <Text numberOfLines={1} style={styles.disableButton}>
              {s.strings.recovery_disable_button}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  const renderConfirmButtons = () => {
    const disabled =
      questions.length < numQuestions ||
      answers.length < questions.length ||
      answers.some(a => a == null)

    return (
      <View style={styles.buttonsContainer}>
        <MainButton
          alignSelf="stretch"
          label={s.strings.recovery_confirm_email}
          marginRem={[1, 0, 0.5, 0]}
          onPress={handleEnableEmail}
          disabled={disabled}
          type="primary"
        />
        <MainButton
          alignSelf="stretch"
          label={s.strings.recovery_confirm_share}
          marginRem={[0.5, 0]}
          onPress={handleEnableShare}
          disabled={disabled}
          type="secondary"
        />
        <MainButton
          alignSelf="stretch"
          label={s.strings.cancel}
          marginRem={[0.5, 0, 0, 0]}
          onPress={done}
          type="escape"
        />
      </View>
    )
  }

  const renderButtons = () => {
    return recoveryLocked ? renderModifyButtons() : renderConfirmButtons()
  }

  return (
    <ThemedScene>
      <ScrollView style={styles.content}>
        {renderForm()}
        {renderWarning()}
        {renderButtons()}
      </ScrollView>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    flex: 1,
    marginTop: theme.rem(1.5)
  },
  formContainer: {
    width: '100%',
    marginBottom: theme.rem(1)
  },
  buttonsContainer: {
    marginTop: theme.rem(1),
    marginHorizontal: theme.rem(1),
    flex: 1
  },
  disableButtonContainer: {
    marginTop: theme.rem(1),
    alignSelf: 'center'
  },
  disableButton: {
    color: theme.dangerText,
    fontSize: theme.rem(1),
    fontFamily: theme.fontFaceDefault
  },
  emailContainer: {
    marginTop: theme.rem(0.5),
    marginBottom: theme.rem(1)
  }
}))
