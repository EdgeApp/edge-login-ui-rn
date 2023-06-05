import * as React from 'react'

import { Imports, useDispatch } from '../types/ReduxTypes'

/**
 * Grabs various properties passed to the root login component,
 * such as the EdgeContext.
 */
export function useImports(): Imports {
  const dispatch = useDispatch()
  const [imports] = React.useState(() =>
    dispatch((dispatch, getState, imports) => imports)
  )
  return imports
}
