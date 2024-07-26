import React, { SetStateAction } from 'react'
import { Keyboard } from 'react-native'

export const useKeyboardPadding = () => {
  const [keyboardHeight, setKeyboardHeight] = React.useState(0)

  React.useEffect(() => {
    const keyboardDidShow = (event: {
      endCoordinates: { height: SetStateAction<number> }
    }) => {
      setKeyboardHeight(event.endCoordinates.height)
    }
    const keyboardDidHide = () => {
      setKeyboardHeight(0)
    }

    const showSubscription = Keyboard.addListener(
      'keyboardDidShow',
      keyboardDidShow
    )
    const hideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      keyboardDidHide
    )

    // Cleanup function to remove the event listeners
    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  const style = React.useMemo(
    () => ({
      paddingBottom: keyboardHeight
    }),
    [keyboardHeight]
  )

  return style
}
