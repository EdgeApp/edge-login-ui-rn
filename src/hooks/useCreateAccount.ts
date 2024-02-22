import { loadTouchState } from '../actions/TouchActions'
import { enableTouchId } from '../keychain'
import { useDispatch } from '../types/ReduxTypes'
import { initializeOtpReminder } from '../util/otpReminder'
import { useHandler } from './useHandler'
import { useImports } from './useImports'

export const useCreateAccountHandler = () => {
  const imports = useImports()
  const dispatch = useDispatch()
  const { context, accountOptions } = imports
  const handleCreateAccount = useHandler(
    async (createAccountParams: {
      username?: string
      password?: string
      pin: string
    }) => {
      const { username, password, pin } = createAccountParams

      const account = await context.createAccount({
        ...accountOptions,
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
      await initializeOtpReminder(account)
      dispatch(loadTouchState())

      return account
    }
  )

  return handleCreateAccount
}
