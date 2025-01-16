import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { useMemo, useState } from 'react'
import { Keyboard, ScrollView, Text, View } from 'react-native'
import {} from 'react-native-gesture-handler'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import {
  sendRecoveryEmail,
  shareRecovery
} from '../../../actions/PasswordRecoveryActions'
import { lstrings } from '../../../common/locales/strings'
import { questionsList } from '../../../constants/recoveryQuestions'
import { useImports } from '../../../hooks/useImports'
import { useScrollToEnd } from '../../../hooks/useScrollToEnd'
import { Branding } from '../../../types/Branding'
import { SceneProps } from '../../../types/routerTypes'
import { validateEmail } from '../../../util/utils'
import { EdgeTouchableOpacity } from '../../common/EdgeTouchableOpacity'
import { Tile } from '../../common/Tile'
import { WarningCard } from '../../common/WarningCard'
import { ButtonsModal } from '../../modals/ButtonsModal'
import { DateModal, toRecoveryDateString } from '../../modals/DateModal'
import { QuestionListModal } from '../../modals/QuestionListModal'
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

interface Props extends SceneProps<'changeRecovery'> {
  branding: Branding
}

const NUM_QUESTIONS = 2

export const ChangeRecoveryScene = (props: Props) => {
  const { branding, route } = props
  const { account, userQuestions } = route.params
  const theme = useTheme()
  const styles = getStyles(theme)
  const { onComplete = () => {} } = useImports()

  const questionPrompt = lstrings.choose_recovery_question
  const answerPrompt = lstrings.your_answer_label

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

  const handleQuestion = (index: number) => async () => {
    const question = questions[index]

    const items = questionsList.map(extractQuestion).filter(stringPredicate)
    const questionText = await Airship.show<string | undefined>(bridge => (
      <QuestionListModal
        bridge={bridge}
        title={sprintf(lstrings.recovery_question, index + 1)}
        items={items.filter(
          item =>
            // Display the currently selected question and the unselected questions
            question?.endsWith(item) || !questions.some(q => q?.endsWith(item))
        )}
        selected={extractQuestion(question)}
      />
    ))
    if (questionText == null) return
    const questionIndex = items.indexOf(questionText)
    questions[index] = questionsList[questionIndex]
    setQuestions([...questions])

    // Reset this Q/A pair's answer
    if (answers[index] !== null) {
      answers[index] = null
      setAnswers([...answers])
    }
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
      .then(date => {
        const answer = toRecoveryDateString(date)
        answers[index] = answer
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
        : sprintf(lstrings.min_length_error, minLength)
    }

    await Airship.show<string | undefined>(bridge => (
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
  const renderSaveRecoveryMessage = (showEmailPrompt: boolean) => {
    return (
      <ModalMessage>
        {lstrings.recovery_save_hint_token + '\n\n'}
        <Text style={styles.warningText}>
          {lstrings.recovery_save_hint_username_answers + '\n\n'}
        </Text>
        {showEmailPrompt ? lstrings.recovery_save_email_prompt : null}
      </ModalMessage>
    )
  }

  const saveRecovery = async (emailAddress?: string) => {
    const { username } = account
    if (username == null) return
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
          title={lstrings.recovery_success_title}
          message={lstrings.recovery_success_message}
          buttons={{ ok: { label: lstrings.ok } }}
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
        title={lstrings.save_recovery_token}
        inputLabel={lstrings.recovery_complete_enter_email_label}
        message={renderSaveRecoveryMessage(true)}
        submitLabel={lstrings.next_label}
        keyboardType="email-address"
        autoFocus={false}
        autoCapitalize="none"
        returnKeyType="go"
        onSubmit={async (email: string) => {
          return validateEmail(email) ? true : lstrings.recovery_invalid_email
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
        title={lstrings.save_recovery_token}
        buttons={{
          ok: { label: lstrings.ok },
          cancel: { label: lstrings.cancel, type: 'secondary' }
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
    Keyboard.dismiss()
    try {
      Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={lstrings.recovery_change_title}
          message={lstrings.recovery_change_message}
          buttons={{
            ok: {
              label: lstrings.ok
            },
            cancel: {
              label: lstrings.cancel,
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
    Keyboard.dismiss()
    try {
      Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={lstrings.recovery_reset_confirm_title}
          message={lstrings.recovery_reset_confirm_message}
          buttons={{
            confirm: { label: lstrings.confirm },
            cancel: { label: lstrings.cancel, type: 'secondary' }
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
          title={sprintf(lstrings.recovery_question, index + 1)}
          body={question ?? questionPrompt}
          onPress={handleQuestion(index)}
          contentPadding={false}
          disabled={recoveryLocked}
        />
        <Tile
          type={questions[index] == null ? 'static' : 'touchable'}
          title={sprintf(lstrings.recovery_answer, index + 1)}
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
      <WarningCard title={lstrings.answer_case_sensitive} marginRem={1} />
    ) : null
  }

  // TODO: Need to rework buttons for UI4
  const renderModifyButtons = () => {
    return (
      <View style={styles.buttonsContainer}>
        <MainButton
          marginRem={0}
          label={lstrings.recovery_change_button}
          onPress={changeRecovery}
          type="primary"
        />
        <EdgeTouchableOpacity onPress={deleteRecovery}>
          <View style={styles.disableButtonContainer}>
            <Text numberOfLines={1} style={styles.disableButton}>
              {lstrings.recovery_disable_button}
            </Text>
          </View>
        </EdgeTouchableOpacity>
      </View>
    )
  }
  const renderConfirmButtons = () => {
    return (
      <View style={styles.buttonsContainer}>
        <MainButton
          label={lstrings.confirm_email}
          marginRem={0.25}
          onPress={saveRecoveryViaEmail}
          disabled={!confirmButtonsEnabled}
          type="primary"
        />
        <MainButton
          label={lstrings.confirm_share}
          marginRem={0.25}
          onPress={saveRecoveryViaShare}
          disabled={!confirmButtonsEnabled}
          type="primary"
        />
        <MainButton
          label={lstrings.cancel}
          marginRem={[0.25, 0, 1]}
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
    marginVertical: theme.rem(1)
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
