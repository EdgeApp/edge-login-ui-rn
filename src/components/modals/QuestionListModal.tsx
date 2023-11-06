import * as React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { AirshipBridge } from 'react-native-airship'
import { cacheStyles } from 'react-native-patina'
import IonIcon from 'react-native-vector-icons/Ionicons'

import { Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'
import { ListModal } from './ListModal'

interface Props {
  bridge: AirshipBridge<string | undefined>
  title: string
  items: string[]
  selected?: string
}

export function QuestionListModal(props: Props) {
  const { bridge, items, selected, title } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  function renderRow(item: string): React.ReactNode {
    const radio = {
      icon: `ios-radio-button-${selected === item ? 'on' : 'off'}`,
      color: theme.iconTappable
    }
    return (
      <TouchableOpacity onPress={() => bridge.resolve(item)}>
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <EdgeText style={styles.text} numberOfLines={0} disableFontScaling>
              {item}
            </EdgeText>
          </View>
          <IonIcon
            style={styles.radio}
            name={radio.icon}
            color={radio.color}
            size={theme.rem(1.25)}
          />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ListModal
      bridge={bridge}
      title={title}
      hideSearch
      rowsData={items}
      // @ts-expect-error
      rowComponent={renderRow}
      fullScreen={false}
    />
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    margin: theme.rem(0.5)
  },
  radio: {
    alignSelf: 'center',
    marginRight: theme.rem(0.25),
    marginLeft: theme.rem(0.375)
  },
  textContainer: {
    flex: 1
  },
  text: {
    fontSize: theme.rem(1)
  }
}))