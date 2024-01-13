import { EdgeAccount } from 'edge-core-js'

import { loadTouchState } from '../actions/TouchActions'
import * as Constants from '../constants/index'
import { enableTouchId } from '../keychain'
import { Dispatch, useDispatch } from '../types/ReduxTypes'
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
      await setTouchOtp(account, dispatch)

      return account
    }
  )

  return handleCreateAccount
}

const setTouchOtp = async (account: EdgeAccount, dispatch: Dispatch) => {
  await enableTouchId(account).catch(e => {
    console.log(e) // Fail quietly
  })
  await account.dataStore.setItem(
    Constants.OTP_REMINDER_STORE_NAME,
    Constants.OTP_REMINDER_KEY_NAME_CREATED_AT,
    Date.now().toString()
  )
  dispatch(loadTouchState())
}
