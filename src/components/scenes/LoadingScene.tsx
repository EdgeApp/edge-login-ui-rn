import * as React from 'react'
import { ActivityIndicator, View } from 'react-native'

import { ACCENT_MINT } from '../../constants/index'
import { Branding } from '../../types/Branding'
import { SceneProps } from '../../types/routerTypes'

interface Props extends SceneProps<'loading'> {
  branding: Branding
}

export class LoadingScene extends React.Component<Props> {
  render() {
    return <View style={styles.container}>{this.renderSpinner()}</View>
  }

  renderSpinner = () => {
    return (
      <View style={styles.spinner}>
        <ActivityIndicator color={ACCENT_MINT} size="large" />
      </View>
    )
  }
}

const styles = {
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  spinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
} as const
