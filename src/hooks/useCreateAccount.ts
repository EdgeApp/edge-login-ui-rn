import { asMaybeNetworkError, EdgeAccount } from 'edge-core-js'

import { loadTouchState } from '../actions/TouchActions'
import { retryOnChallenge } from '../components/modals/ChallengeModal'
import { enableTouchId } from '../keychain'
import { useDispatch, useSelector } from '../types/ReduxTypes'
import { useHandler } from './useHandler'
import { useImports } from './useImports'

export const useCreateAccountHandler = () => {
  const { context, accountOptions } = useImports()
  const dispatch = useDispatch()
  const savedChallengeId =
    useSelector(state => state.createChallengeId) ?? undefined

  const handleCreateAccount = useHandler(
    async (createAccountParams: {
      username?: string
      password?: string
      pin: string
    }) => {
      const { username, password, pin } = createAccountParams

      // Wire up a freshly-obtained account the same way whether it came from
      // createAccount or from a recovery login, then hand it back to the caller.
      const finishAccount = async (
        account: EdgeAccount
      ): Promise<EdgeAccount> => {
        account.watch('loggedIn', loggedIn => {
          if (!loggedIn) dispatch({ type: 'RESET_APP' })
        })
        await enableTouchId(account).catch((e: unknown) => {
          console.log(e) // Fail quietly
        })
        dispatch(loadTouchState()).catch((e: unknown) => {
          console.log(e) // Fail quietly
        })

        return account
      }

      try {
        return await retryOnChallenge({
          cancelValue: undefined,
          async task(challengeId = savedChallengeId) {
            const account = await context.createAccount({
              ...accountOptions,
              challengeId,
              username,
              password,
              pin
            })
            return await finishAccount(account)
          }
        })
      } catch (error: unknown) {
        // A lost create response can leave the account created server-side while
        // the client sees a NetworkError. The orphaned account has exactly the
        // credentials just entered, so a password login recovers it and lets
        // signup continue instead of dead-ending at "account already exists".
        if (
          asMaybeNetworkError(error) != null &&
          username != null &&
          password != null
        ) {
          const recovered = await context
            .loginWithPassword(username, password, accountOptions)
            .catch(() => undefined)
          if (recovered != null) return await finishAccount(recovered)
        }
        throw error
      } finally {
        // Create challenges are single-use and consumed the moment the request
        // reaches the server. Drop the saved id once the attempt settles so a
        // retry fetches a fresh challenge instead of replaying a dead id (which
        // returns 429 and pops a redundant CAPTCHA modal).
        dispatch({ type: 'CLEAR_CREATE_CHALLENGE' })
      }
    }
  )

  return handleCreateAccount
}
