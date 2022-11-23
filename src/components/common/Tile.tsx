import * as React from 'react'
import { ActivityIndicator, TouchableWithoutFeedback, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'

import { Theme, ThemeProps, withTheme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'

const textHeights = {
  small: 2,
  medium: 3,
  large: 0
}

interface OwnProps {
  body?: string
  children?: React.ReactNode
  error?: boolean
  onPress?: () => void
  title: string
  type: 'editable' | 'questionable' | 'loading' | 'static' | 'touchable'
  contentPadding?: boolean
  maximumHeight?: 'small' | 'medium' | 'large'
  disabled?: boolean
}
type Props = OwnProps & ThemeProps

export class TileComponent extends React.PureComponent<Props> {
  render() {
    const {
      body,
      title,
      contentPadding = true,
      children,
      theme,
      type,
      maximumHeight = 'medium',
      error,
      onPress,
      disabled
    } = this.props
    const styles = getStyles(theme)
    const numberOfLines = textHeights[maximumHeight]

    if (type === 'loading') {
      return (
        <View>
          <View style={styles.container}>
            <View
              style={[
                styles.content,
                contentPadding ? styles.contentPadding : null
              ]}
            >
              <EdgeText style={styles.textHeader}>{title}</EdgeText>
              <ActivityIndicator
                style={styles.loader}
                color={theme.primaryText}
                size="large"
              />
            </View>
          </View>
          <View style={styles.divider} />
        </View>
      )
    }
    return (
      <TouchableWithoutFeedback
        onPress={onPress}
        disabled={type === 'static' || disabled}
      >
        <View>
          <View style={styles.container}>
            <View
              style={[
                styles.content,
                contentPadding ? styles.contentPadding : null
              ]}
            >
              {type === 'editable' && (
                <FontAwesomeIcon name="edit" style={styles.editIcon} />
              )}
              {type === 'questionable' && (
                <SimpleLineIcons name="question" style={styles.editIcon} />
              )}
              <EdgeText
                style={error ? styles.textHeaderError : styles.textHeader}
              >
                {title}
              </EdgeText>
              {typeof body === 'string' && (
                <EdgeText
                  style={
                    disabled === true
                      ? styles.textBodyDisabled
                      : styles.textBody
                  }
                  numberOfLines={numberOfLines}
                  ellipsizeMode="tail"
                >
                  {body}
                </EdgeText>
              )}
              {children}
            </View>
            {type === 'touchable' && (
              <View style={styles.iconContainer}>
                <FontAwesomeIcon
                  name="chevron-right"
                  style={
                    disabled === true
                      ? styles.arrowIconDeactivated
                      : styles.arrowIcon
                  }
                />
              </View>
            )}
          </View>
          <View style={styles.divider} />
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.tileBackground,
    paddingLeft: theme.rem(0.25),
    marginTop: theme.rem(0.875),
    paddingBottom: theme.rem(0.875),
    flexDirection: 'row',
    alignItems: 'center'
  },
  content: {
    flex: 1
  },
  contentPadding: {
    paddingLeft: theme.rem(0.25)
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  arrowIconDeactivated: {
    color: theme.iconDeactivated,
    marginRight: theme.rem(0.25),
    marginLeft: theme.rem(0.75),
    textAlign: 'center'
  },
  arrowIcon: {
    color: theme.iconTappable,
    marginRight: theme.rem(0.25),
    marginLeft: theme.rem(0.75),
    textAlign: 'center'
  },
  textHeader: {
    color: theme.secondaryText,
    fontSize: theme.rem(0.75),
    paddingBottom: theme.rem(0.25)
  },
  textHeaderError: {
    color: theme.dangerText,
    fontSize: theme.rem(0.75)
  },
  textBody: {
    color: theme.primaryText,
    fontSize: theme.rem(1)
  },
  textBodyDisabled: {
    color: theme.deactivatedText,
    fontSize: theme.rem(1)
  },
  editIcon: {
    position: 'absolute',
    color: theme.iconTappable,
    width: theme.rem(0.75),
    height: theme.rem(0.75),
    top: theme.rem(0.25),
    right: 0
  },
  loader: {
    marginTop: theme.rem(0.25)
  },
  divider: {
    height: theme.thinLineWidth,
    marginLeft: theme.rem(0.25),
    borderBottomWidth: theme.thinLineWidth,
    borderBottomColor: theme.lineDivider
  }
}))

export const Tile = withTheme(TileComponent)
