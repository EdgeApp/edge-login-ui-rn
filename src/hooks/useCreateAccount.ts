import { loadTouchState } from '../actions/TouchActions'
import { retryOnChallenge } from '../components/modals/ChallengeModal'
import { enableTouchId } from '../keychain'
import { useDispatch, useSelector } from '../types/ReduxTypes'
import { useHandler } from './useHandler'
import { useImports } from './useImports'

export const useCreateAccountHandler = () => {
  const { context, accountOptions } = useImports()
  const dispatch = useDispatch()
  const challengeId = useSelector(state => state.createChallengeId) ?? undefined

  const handleCreateAccount = useHandler(
    async (createAccountParams: {
      username?: string
      password?: string
      pin: string
    }) => {
      const { username, password, pin } = createAccountParams

      return await retryOnChallenge({
        async task() {
          const account = await context.createAccount({
            ...accountOptions,
            challengeId,
            username,
            password,
            pin
          })
          account.watch('loggedIn', loggedIn => {
            if (!loggedIn) dispatch({ type: 'RESET_APP' })
          })
          await enableTouchId(account).catch(e => {
            console.log(e) // Fail quietly
          })
          dispatch(loadTouchState())

          return account
        },
        onCancel() {}
      })
    }
  )

  return handleCreateAccount
}
