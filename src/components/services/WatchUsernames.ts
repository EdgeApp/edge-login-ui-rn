import { EdgeUserInfo } from 'edge-core-js'
import React, { useEffect } from 'react'

import { useImports } from '../../hooks/useImports'
import { useWatch } from '../../hooks/useWatch'
import { LoginUserInfo } from '../../reducers/PreviousUsersReducer'
import { useDispatch, useSelector } from '../../types/ReduxTypes'

interface Props {
  // none
}

/**
 * Subscribes to the username list on the context object.
 */
export const WatchUsernames: React.VoidFunctionComponent<Props> = props => {
  const dispatch = useDispatch()
  const imports = useImports()

  // Subscribe to the core:
  const localUsers = useWatch(imports.context, 'localUsers')

  // Subscribe to the fingerprint state:
  const touch = useSelector(state => state.touch)

  // Dispatch to redux if something has changed:
  useEffect(() => {
    // Sort by date:
    const usernames = arrangeUsers(localUsers)

    // Figure out what these users support:
    const userList: LoginUserInfo[] = usernames.map(username => {
      const { pinLoginEnabled, keyLoginEnabled } = localUsers.find(
        user => user.username === username
      ) ?? { pinLoginEnabled: false, keyLoginEnabled: false }
      return {
        username,
        pinEnabled: pinLoginEnabled,
        touchEnabled:
          keyLoginEnabled &&
          touch.supported &&
          touch.enabledUsers.includes(username)
      }
    })

    // Try to find the user requested by the LoginScene props:
    const requestedUser = userList.find(
      user => user.username === imports.username
    )

    dispatch({
      type: 'SET_PREVIOUS_USERS',
      data: {
        loaded: true,
        startupUser: requestedUser != null ? requestedUser : userList[0],
        userList
      }
    })
  }, [
    dispatch,
    imports.username,
    localUsers,
    touch.enabledUsers,
    touch.supported
  ])

  return null
}

/**
 * Given a list of users from the core,
 * remove the given user, then organize the 3 most recent users,
 * followed by the rest in alphabetical order.
 */
function arrangeUsers(localUsers: EdgeUserInfo[]): string[] {
  // Sort the users according to their last login date (excluding active logged in user):
  const usernames = localUsers
    .sort((a, b) => {
      const { lastLogin: aDate = new Date(0) } = a
      const { lastLogin: bDate = new Date(0) } = b
      return bDate.valueOf() - aDate.valueOf()
    })
    .map(info => info.username)
    .filter((username): username is string => username != null)

  // Get the most recent 3 users that were logged in:
  const recentUsers = usernames.slice(0, 3)

  // Sort everything after the last 3 entries alphabetically:
  const oldUsers = usernames.slice(3).sort((a: string, b: string) => {
    const stringA = a.toUpperCase()
    const stringB = b.toUpperCase()
    if (stringA < stringB) return -1
    if (stringA > stringB) return 1
    return 0
  })

  return [...recentUsers, ...oldUsers]
}
