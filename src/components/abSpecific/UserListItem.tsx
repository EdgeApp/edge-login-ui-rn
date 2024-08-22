import * as React from 'react'
import { LayoutChangeEvent } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import { sprintf } from 'sprintf-js'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { LoginUserInfo } from '../../hooks/useLocalUsers'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
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

  const username =
    userInfo.username ??
    sprintf(
      lstrings.guest_account_id_1s,
      userInfo.loginId.slice(userInfo.loginId.length - 3)
    )

  return (
    <EdgeTouchableOpacity
      accessible={false}
      style={styles.container}
      onPress={handlePress}
      onLayout={onLayout}
    >
      <EdgeText accessible style={styles.text} numberOfLines={2}>
        {username}
      </EdgeText>
      <EdgeTouchableOpacity
        style={styles.deleteButtonContainer}
        testID={`${username}.deleteIcon`}
        onPress={handleDelete}
      >
        <MaterialIcon
          style={styles.deleteButton}
          name="close"
          size={theme.rem(1)}
        />
      </EdgeTouchableOpacity>
    </EdgeTouchableOpacity>
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
    paddingLeft: theme.rem(0.75)
  },
  text: {
    flex: 1,
    flexWrap: 'wrap',
    marginVertical: theme.rem(0.25)
  },
  deleteButtonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: theme.rem(2),
    minWidth: theme.rem(2)
  },
  deleteButton: {
    color: theme.iconTappable
  }
}))
