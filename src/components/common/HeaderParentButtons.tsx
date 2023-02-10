import { asBoolean, asObject, asOptional } from 'cleaners'
import { makeReactNativeDisklet } from 'disklet'
import * as React from 'react'
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import * as Assets from '../../assets/'
import s from '../../common/locales/strings'
import { Branding } from '../../types/Branding'
import { fetchInfo } from '../../util/network'
import { Theme, ThemeProps, withTheme } from '../services/ThemeContext'

interface OwnProps {
  branding: Branding
}

interface State {
  hidePoweredBy: boolean
}

type Props = OwnProps & ThemeProps

const APPID_INFO_FILE = 'appIdInfo.json'
const asAppIdInfo = asObject({ hidePoweredBy: asOptional(asBoolean, false) })
const disklet = makeReactNativeDisklet()

type AppIdInfo = ReturnType<typeof asAppIdInfo>

class HeaderParentButtonsComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hidePoweredBy: false
    }
  }

  handlePress = () => {
    const { parentButton } = this.props.branding
    if (parentButton != null) parentButton.callback()
  }

  async componentDidMount(): Promise<void> {
    const { appId } = this.props.branding
    if (appId != null && appId !== '') {
      let appIdInfo: AppIdInfo | undefined
      try {
        const json = await disklet.getText(APPID_INFO_FILE)
        appIdInfo = asAppIdInfo(JSON.parse(json))
      } catch (e: any) {
        console.log(e.message)
        console.log('Failed to read appIdInfo.json. Failure ok')
      }

      if (appIdInfo == null) {
        try {
          const result = await fetchInfo(`v1/appIdInfo/${appId}`)
          appIdInfo = asAppIdInfo(await result.json())
          disklet.setText(APPID_INFO_FILE, JSON.stringify(appIdInfo))
        } catch (e: any) {
          console.log(e.message)
          console.log('Failed to fetch appIdInfo. Failure ok')
          return
        }
      }

      const { hidePoweredBy } = appIdInfo
      this.setState({ hidePoweredBy })
    }
  }

  render() {
    const { parentButton, appId } = this.props.branding
    const { hidePoweredBy } = this.state
    const openEdgeSite = async () => await Linking.openURL(s.strings.edge_site)
    const styles = getStyles(this.props.theme)

    return (
      <View style={styles.container}>
        {parentButton == null || parentButton.text == null ? null : (
          <TouchableOpacity onPress={this.handlePress}>
            <View style={styles.leftButtonContainer}>
              <Text style={parentButton.style || styles.leftButtonText}>
                {parentButton.text}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.spacer} />
        {appId == null || appId === '' || hidePoweredBy ? null : (
          <TouchableOpacity onPress={openEdgeSite}>
            <View style={styles.rightButtonContainer}>
              <Text style={styles.rightButtonText}>{s.strings.powered_by}</Text>
              <Image
                source={Assets.LOGO_SMALL}
                resizeMode="contain"
                style={styles.image}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    )
  }
}

export const HeaderParentButtons = withTheme(HeaderParentButtonsComponent)

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    top: theme.rem(2),
    marginLeft: theme.rem(1),
    marginRight: theme.rem(1),
    flexDirection: 'row'
  },
  leftButtonContainer: {
    justifyContent: 'center',
    alignContents: 'center',
    height: theme.rem(2)
  },
  leftButtonText: {
    fontFamily: theme.fontFaceDefault,
    color: theme.primaryText,
    fontSize: theme.rem(1)
  },
  rightButtonContainer: {
    justifyContent: 'flex-end',
    alignContents: 'flex-end',
    height: theme.rem(2)
  },
  rightButtonText: {
    color: theme.primaryText,
    fontSize: theme.rem(0.5),
    textAlign: 'right'
  },
  spacer: {
    flex: 1
  },
  image: {
    width: theme.rem(4.5),
    height: theme.rem(1.25)
  }
}))
