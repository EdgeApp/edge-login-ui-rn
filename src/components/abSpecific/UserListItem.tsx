import * as React from 'react'
import { LayoutChangeEvent, TouchableOpacity } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

import s from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { LoginUserInfo } from '../../hooks/useLocalUsers'
import { Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'

interface Props {
  userInfo: LoginUserInfo
  onClick: (userInfo: LoginUserInfo) => void
  onDelete: (userInfo: LoginUserInfo) => void
  onLayout: (event: LayoutChangeEvent) => void
}

export function UserListItem(props: Props) {
  const { userInfo, onClick, onDelete, onLayout } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const handleDelete = useHandler(() => {
    onDelete(userInfo)
  })

  const handlePress = useHandler(() => {
    onClick(userInfo)
  })

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      onLayout={onLayout}
    >
      <EdgeText style={styles.text}>
        {userInfo.username ?? s.strings.missing_username}
      </EdgeText>
      <TouchableOpacity onPress={handleDelete}>
        <MaterialIcon
          style={styles.deleteButton}
          name="close"
          size={theme.rem(1)}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.modal,
    flex: 1,
    height: theme.rem(2.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.rem(1)
  },
  text: {
    marginVertical: theme.rem(0.25)
  },
  deleteButton: {
    color: theme.iconTappable
  }
}))
