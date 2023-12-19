import { EdgeAccount } from 'edge-core-js'

import { loadTouchState } from '../actions/TouchActions'
import { lstrings } from '../common/locales/strings'
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
      pin?: string | undefined
      username?: string
      password?: string
    }) => {
      const { username, password, pin } = createAccountParams

      dispatch({
        type: 'NAVIGATE',
        data: {
          name: 'newAccountWait',
          params: {
            title: lstrings.great_job,
            message: lstrings.hang_tight + '\n' + lstrings.secure_account
          }
        }
      })
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
