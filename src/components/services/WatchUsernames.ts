import { EdgeUserInfo } from 'edge-core-js'
import React, { useEffect } from 'react'

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
  // Grab the weird redux imports object:
  const dispatch = useDispatch()
  const imports = dispatch((dispatch, getState, imports) => imports)

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
        username: username ?? 'LocalUser',
        pinEnabled: pinLoginEnabled,
        touchEnabled:
          keyLoginEnabled &&
          touch.supported &&
          touch.enabledUsers.includes(username ?? 'LocalUser')
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
        userList,
        usernameOnlyList: usernames
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
 * Undefined usernames are replaced with "LocalUser".
 */
function arrangeUsers(localUsers: EdgeUserInfo[]): string[] {
  // Sort the users according to their last login date (excluding active logged in user):
  const sortedUsers = localUsers.sort((a, b) => {
    const { lastLogin: aDate = new Date(0) } = a
    const { lastLogin: bDate = new Date(0) } = b
    return bDate.valueOf() - aDate.valueOf()
  })

  // Get the most recent 3 users that were logged in:
  const recentUsers = sortedUsers
    .slice(0, 3)
    .map(info => info.username ?? 'LocalUser')

  // Sort everything after the last 3 entries alphabetically:
  const oldUsers = sortedUsers
    .slice(3)
    .sort((a, b) => {
      const stringA = (a.username ?? 'LocalUser').toUpperCase()
      const stringB = (b.username ?? 'LocalUser').toUpperCase()
      if (stringA < stringB) return -1
      if (stringA > stringB) return 1
      return 0
    })
    .map(info => info.username ?? 'LocalUser')

  return [...recentUsers, ...oldUsers]
}
