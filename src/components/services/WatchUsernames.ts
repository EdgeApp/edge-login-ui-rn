import React, { useEffect } from 'react'

import { useImports } from '../../hooks/useImports'
import { useLocalUsers } from '../../hooks/useLocalUsers'
import { useDispatch } from '../../types/ReduxTypes'

interface Props {
  // none
}

/**
 * Subscribes to the username list on the context object.
 */
export const WatchUsernames: React.VoidFunctionComponent<Props> = props => {
  const dispatch = useDispatch()
  const { username: initialUsername } = useImports()

  // Subscribe to the core:
  const localUsers = useLocalUsers()

  // Dispatch to redux if something has changed:
  useEffect(() => {
    // Try to find the user requested by the LoginScene props:
    const requestedUser = localUsers.find(
      user => user.username === initialUsername
    )

    dispatch({
      type: 'SET_PREVIOUS_USERS',
      data: {
        loaded: true,
        startupUser: requestedUser ?? localUsers[0],
        userList: localUsers
      }
    })
  }, [dispatch, initialUsername, localUsers])

  return null
}
