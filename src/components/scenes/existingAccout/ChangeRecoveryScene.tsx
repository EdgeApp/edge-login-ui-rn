import { EdgeAccount } from 'edge-core-js'
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
import s from '../../../common/locales/strings'
import { questionsList } from '../../../constants/recoveryQuestions'
import { useImports } from '../../../hooks/useImports'
import { useScrollToEnd } from '../../../hooks/useScrollToEnd'
import { Branding } from '../../../types/Branding'
import { useSelector } from '../../../types/ReduxTypes'
import { validateEmail } from '../../../util/utils'
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

export interface ChangeRecoveryParams {
  questionsList: string[]
  userQuestions: string[]
  account: EdgeAccount
}

interface Props {
  branding: Branding
}

const NUM_QUESTIONS = 2

export const ChangeRecoveryScene = ({ branding }: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)
  const { onComplete } = useImports()

  const questionPrompt = s.strings.choose_recovery_question
  const answerPrompt = s.strings.your_answer_label

  const account = useSelector(state => state.account)
  const userQuestions = useSelector(
    state => state.passwordRecovery.userQuestions
  )
  const [recoveryLocked, setRecoveryLocked] = useState(userQuestions.length > 0)

  // userQuestions is an array of null's when no recovery exists
  const [questions, setQuestions] = useState<Array<string | null>>([
    ...userQuestions
  ])
  const [answers, setAnswers] = useState<Array<string | null>>([])

  const confirmButtonsEnabled =
    !answers.some(a => a == null) &&
    questions.length === NUM_QUESTIONS &&
    answers.length === questions.length

  const scrollViewRef = useScrollToEnd(confirmButtonsEnabled)

  const showCaseSensitivityWarning = useMemo<boolean>(
    () => questions.some(q => !q?.startsWith('date:')),
    [questions]
  )

  const extractQuestion = (recoveryQuestion: string | null | undefined) => {
    return recoveryQuestion?.split(':').slice(-1)[0]
  }
  const stringPredicate = (s: string | undefined | null): s is string =>
    typeof s === 'string'

  const handleQuestion = (index: number) => () => {
    const question = questions[index]

    const items = questionsList.map(extractQuestion).filter(stringPredicate)
    Airship.show<string | undefined>(bridge => (
      <RadioListModal
        bridge={bridge}
        title={sprintf(s.strings.recovery_question, index + 1)}
        items={items.filter(
          item =>
            // Display the currently selected question and the unselected questions
            question?.endsWith(item) || !questions.some(q => q?.endsWith(item))
        )}
        selected={extractQuestion(question)}
      />
    )).then((questionText: string | undefined) => {
      if (questionText == null) return
      const questionIndex = items.indexOf(questionText)
      questions[index] = questionsList[questionIndex]
      setQuestions([...questions])

      // Reset this Q/A pair's answer
      if (answers[index] !== null) {
        answers[index] = null
        setAnswers([...answers])
      }
    })
  }
  const handleAnswer = (index: number) => () => {
    const question = questions[index]
    if (question == null) return

    if (question.startsWith('date:')) {
      showDatePickerModal(index)
    } else if (question.startsWith('text:')) {
      showTextInputModal(index)
    } else {
      // Legacy Questions
      showTextInputModal(index)
    }
  }

  const showDatePickerModal = async (index: number) => {
    const now = new Date()
    await Airship.show<Date>(bridge => (
      <DateModal bridge={bridge} initialValue={now} />
    ))
      .then(answer => {
        const date = answer.toISOString().split('T')[0]
        answers[index] = date
        setAnswers([...answers])
      })
      .catch((error: Error) => {
        showError(error)
      })
  }

  const showTextInputModal = async (index: number) => {
    const question = questions[index]
    if (question == null) return

    let minLengthString = question.split(':')[1]
    if (minLengthString == null || minLengthString.trim() === '')
      minLengthString = '0'

    const minLength = parseInt(minLengthString)

    const validateAnswer = async (answer: string) => {
      return answer.length >= minLength
        ? true
        : sprintf(s.strings.min_length_error, minLength)
    }

    await Airship.show<string | undefined>(bridge => (
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
  const renderSaveRecoveryMessage = (showEmailPrompt: boolean) => {
    return (
      <ModalMessage>
        {s.strings.recovery_save_hint_token + '\n\n'}
        <Text style={styles.warningText}>
          {s.strings.recovery_save_hint_username_answers + '\n\n'}
        </Text>
        {showEmailPrompt ? s.strings.recovery_save_email_prompt : null}
      </ModalMessage>
    )
  }

  const saveRecovery = async (emailAddress?: string) => {
    if (account == null || account.username == null) return
    const { username } = account
    const okQuestions = questions.filter(stringPredicate)
    const okAnswers = answers.filter(stringPredicate)
    try {
      const recoveryKey = await account.changeRecovery(okQuestions, okAnswers)
      if (emailAddress == null) {
        await shareRecovery(username, recoveryKey, branding)
      } else {
        await sendRecoveryEmail(emailAddress, username, recoveryKey, branding)
      }
      await Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={s.strings.recovery_success_title}
          message={s.strings.recovery_success_message}
          buttons={{ ok: { label: s.strings.ok } }}
        />
      ))
      setAnswers([])
      onComplete()
    } catch (error) {
      showError(error)
    }
  }

  const saveRecoveryViaEmail = async () => {
    const emailAddress: string | undefined = await Airship.show(bridge => (
      <TextInputModal
        bridge={bridge}
        title={s.strings.save_recovery_token}
        inputLabel={s.strings.recovery_complete_enter_email_label}
        message={renderSaveRecoveryMessage(true)}
        submitLabel={s.strings.next_label}
        keyboardType="email-address"
        autoFocus={false}
        autoCapitalize="none"
        returnKeyType="go"
        onSubmit={async (email: string) => {
          return validateEmail(email) ? true : s.strings.recovery_invalid_email
        }}
      />
    ))
    if (emailAddress == null) return
    await saveRecovery(emailAddress)
  }

  const saveRecoveryViaShare = async () => {
    await Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={s.strings.save_recovery_token}
        buttons={{
          ok: { label: s.strings.ok },
          cancel: { label: s.strings.cancel, type: 'secondary' }
        }}
      >
        {renderSaveRecoveryMessage(false)}
      </ButtonsModal>
    )).then(async button => {
      if (button !== 'ok') return
      await saveRecovery()
    })
  }

  const changeRecovery = () => {
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
        if (button !== 'ok') return
        setRecoveryLocked(false)
        setAnswers([])
      })
    } catch (error) {
      showError(error)
    }
  }

  const deleteRecovery = () => {
    if (account == null) return
    Keyboard.dismiss()
    try {
      Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={s.strings.recovery_reset_confirm_title}
          message={s.strings.recovery_reset_confirm_message}
          buttons={{
            confirm: { label: s.strings.confirm },
            cancel: { label: s.strings.cancel, type: 'secondary' }
          }}
        />
      )).then(async button => {
        if (button !== 'confirm') return
        await account.deleteRecovery()
        onComplete()
      })
    } catch (error) {
      showError(error)
    }
  }

  const renderQuestionAnswer = (index: number) => {
    const question = extractQuestion(questions[index]) ?? questionPrompt
    const answer = answers[index] ?? answerPrompt
    return (
      <View>
        <Tile
          type="touchable"
          title={sprintf(s.strings.recovery_question, index + 1)}
          body={question ?? questionPrompt}
          onPress={handleQuestion(index)}
          contentPadding={false}
          disabled={recoveryLocked}
        />
        <Tile
          type={questions[index] == null ? 'static' : 'touchable'}
          title={sprintf(s.strings.recovery_answer, index + 1)}
          body={answer}
          onPress={handleAnswer(index)}
          contentPadding={false}
          disabled={recoveryLocked || questions[index] == null}
        />
      </View>
    )
  }

  const renderCaseSensitivityWarning = () => {
    return showCaseSensitivityWarning && !recoveryLocked ? (
      <WarningCard title={s.strings.answer_case_sensitive} marginRem={1} />
    ) : null
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
        <TouchableOpacity onPress={deleteRecovery}>
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
    return (
      <View style={styles.buttonsContainer}>
        <MainButton
          alignSelf="stretch"
          label={s.strings.confirm_email}
          marginRem={[1, 0, 0.5, 0]}
          onPress={saveRecoveryViaEmail}
          disabled={!confirmButtonsEnabled}
          type="primary"
        />
        <MainButton
          alignSelf="stretch"
          label={s.strings.confirm_share}
          marginRem={[0.5, 0]}
          onPress={saveRecoveryViaShare}
          disabled={!confirmButtonsEnabled}
          type="secondary"
        />
        <MainButton
          alignSelf="stretch"
          label={s.strings.cancel}
          paddingRem={[1, 0]}
          onPress={onComplete}
          type="escape"
        />
      </View>
    )
  }

  const renderButtons = () => {
    return recoveryLocked ? renderModifyButtons() : renderConfirmButtons()
  }
  const renderQuestionAnswers = () => {
    return (
      <View>
        {renderQuestionAnswer(0)}
        {renderQuestionAnswer(1)}
      </View>
    )
  }
  return (
    <ThemedScene paddingRem={0}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content}>
        {renderQuestionAnswers()}
        {renderCaseSensitivityWarning()}
        {renderButtons()}
      </ScrollView>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column'
  },
  buttonsContainer: {
    marginHorizontal: theme.rem(1)
  },
  disableButtonContainer: {
    alignSelf: 'center',
    paddingVertical: theme.rem(1)
  },
  disableButton: {
    color: theme.dangerText,
    marginBottom: theme.rem(1),
    fontSize: theme.rem(1),
    fontFamily: theme.fontFaceDefault
  },
  warningText: {
    color: theme.warningText
  }
}))
