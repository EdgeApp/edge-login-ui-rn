import { EdgeUserInfo } from 'edge-core-js'
import * as React from 'react'

import { TouchState } from '../reducers/TouchReducer'
import { useSelector } from '../types/ReduxTypes'
import { useImports } from './useImports'
import { useWatch } from './useWatch'

export interface LoginUserInfo extends EdgeUserInfo {
  touchLoginEnabled: boolean
}

export function useLocalUsers(): LoginUserInfo[] {
  const { context } = useImports()
  const localUsers = useWatch(context, 'localUsers')
  const touch = useSelector(state => state.touch)

  return React.useMemo(() => upgradeUsers(arrangeUsers(localUsers), touch), [
    localUsers,
    touch
  ])
}

/**
 * Given a list of users from the core,
 * organize the 3 most recent users,
 * followed by the rest in alphabetical order.
 */
export function arrangeUsers(localUsers: EdgeUserInfo[]): EdgeUserInfo[] {
  // Sort the users according to their last login date:
  const sortedUsers = localUsers.sort((a, b) => {
    const { lastLogin: aDate = new Date(0) } = a
    const { lastLogin: bDate = new Date(0) } = b
    return bDate.valueOf() - aDate.valueOf()
  })

  // Get the most recent 3 users that were logged in:
  const recentUsers = sortedUsers.slice(0, 3)

  // Sort everything after the last 3 entries alphabetically:
  const oldUsers = sortedUsers.slice(3).sort((a, b) => {
    const stringA = a.username?.toLowerCase() ?? ''
    const stringB = b.username?.toLowerCase() ?? ''
    if (stringA < stringB) return -1
    if (stringA > stringB) return 1
    return 0
  })

  return [...recentUsers, ...oldUsers]
}

export function upgradeUsers(
  localUsers: EdgeUserInfo[],
  touch: TouchState
): LoginUserInfo[] {
  return localUsers.map(userInfo => {
    const { username, keyLoginEnabled } = userInfo
    return {
      ...userInfo,
      touchLoginEnabled:
        username != null &&
        keyLoginEnabled &&
        touch.supported &&
        touch.enabledUsers.includes(username)
    }
  })
}
