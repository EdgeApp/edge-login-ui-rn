// @flow

import * as React from 'react'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'

import { useEffect, useRef, useState } from '../../util/hooks'

type Props = {
  visible: boolean,
  hidden?: boolean,
  children: React.Node
}

const FadeComponent = ({ visible: propsVisible, hidden, children }: Props) => {
  const firstRender = useRef(true)
  const opacity = useSharedValue(0)
  const [visible, setVisible] = useState<boolean>(propsVisible)
  const [prevVisible, setPrevVisible] = useState<boolean>(propsVisible)

  const animate = (toValue: number) => {
    if (toValue === 0.5) setVisible(true)

    opacity.value = withTiming(toValue, {
      duration: 500
    })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => animate(propsVisible ? 0.5 : 0), [])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    if (propsVisible !== prevVisible) {
      animate(propsVisible ? 0.5 : 1)
      setPrevVisible(propsVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsVisible])

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 0.5, 1], [0, 1, 0])
  }))

  return (
    <Animated.View style={style}>
      {hidden || visible ? children : null}
    </Animated.View>
  )
}

export const Fade = FadeComponent
