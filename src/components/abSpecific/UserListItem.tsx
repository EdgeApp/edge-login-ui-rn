import * as React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

import s from '../../common/locales/strings'
import { LoginUserInfo } from '../../hooks/useLocalUsers'
import { Theme, useTheme } from '../services/ThemeContext'

interface Props {
  userInfo: LoginUserInfo
  onClick: (userInfo: LoginUserInfo) => void
  onDelete: (userInfo: LoginUserInfo) => void
}

export function UserListItem(props: Props) {
  const { userInfo, onClick, onDelete } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const handleDelete = () => {
    onDelete(userInfo)
  }

  const handlePress = () => {
    onClick(userInfo)
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.textComtainer}>
        <Text style={styles.text}>
          {userInfo.username ?? s.strings.missing_username}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.iconButtonContainer}
        onPress={handleDelete}
      >
        <MaterialIcon
          style={styles.iconButtonIcon}
          name="close"
          size={theme.rem(1)}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    height: theme.rem(2.5),
    width: '100%',
    backgroundColor: theme.modal,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textComtainer: {
    flex: 25,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  iconButtonContainer: {
    flex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '100%'
  },
  iconButtonIcon: {
    color: theme.icon
  },
  text: {
    paddingLeft: theme.rem(1.25),
    color: theme.primaryText,
    backgroundColor: '#fff0',
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(1)
  }
}))
