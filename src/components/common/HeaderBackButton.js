// @flow

import * as React from 'react'
import { Platform, Text, TouchableOpacity } from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'

const isIos = Platform.OS === 'ios'

type Props = {
  testID?: string,
  styles: Object,
  label: string,
  onPress(): void
}
class HeaderBackButton extends React.Component<Props> {
  render() {
    const withArrow = true
    const styles = this.props.styles
    return (
      <TouchableOpacity style={styles.backButton} onPress={this.props.onPress}>
        {withArrow && (
          <Entypo name="chevron-left" style={styles.backIconStyle} />
        )}
        {withArrow && !isIos ? null : (
          <Text testID={this.props.testID} style={[styles.sideText]}>
            {this.props.label}
          </Text>
        )}
      </TouchableOpacity>
    )
  }
}

export { HeaderBackButton }
