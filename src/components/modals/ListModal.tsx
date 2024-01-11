/**
 * IMPORTANT: Changes in this file MUST be duplicated in edge-react-gui!
 */
import * as React from 'react'
import {
  FlatList,
  Keyboard,
  ListRenderItem,
  ViewStyle,
  ViewToken
} from 'react-native'
import { AirshipBridge } from 'react-native-airship'

import { useFilter } from '../../hooks/useFilter'
import { AnimatedIconComponent, SearchIconAnimated } from '../icons/ThemedIcons'
import { useTheme } from '../services/ThemeContext'
import { ModalFooter, ModalMessage, ModalTitle } from '../themed/ModalParts'
import { SimpleTextInput } from '../themed/SimpleTextInput'
import { ThemedModal } from '../themed/ThemedModal'

interface Props<T> {
  bridge: AirshipBridge<any>
  // Header Props
  title?: string
  message?: string
  hideSearch?: boolean // Defaults to 'false'
  initialValue?: string // Defaults to ''
  // SimpleTextInput properties:
  iconComponent?: AnimatedIconComponent | null // Defaults to `SearchIconAnimated`
  placeholder?: string
  autoCorrect?: boolean // Defaults to 'false'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' // Defaults to 'words'
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send' // Defaults to 'search'
  keyboardType?:
    | 'default'
    | 'number-pad'
    | 'decimal-pad'
    | 'numeric'
    | 'email-address'
    | 'phone-pad' // Defaults to 'default'
  blurOnSubmit?: boolean // Defaults to 'true'
  inputAccessoryViewID?: string
  maxLength?: number
  onSubmitEditing?: (text: string) => void
  secureTextEntry?: boolean // Defaults to 'false'
  autoFocus?: boolean // Defaults to 'false'
  blurOnClear?: boolean // Defaults to 'false'
  // List Props
  rowsData?: T[] // Defaults to []
  rowComponent?: (props: T) => React.ReactElement
  rowDataFilter?: (filterText: string, data: T, index: number) => boolean
  onViewableItemsChanged?: (info: {
    viewableItems: ViewToken[]
    changed: ViewToken[]
  }) => void
  // Footer Props
  closeArrow?: boolean // Defaults to 'true'
}

export function ListModal<T>({
  bridge,
  title,
  message,
  hideSearch = false,
  initialValue = '',
  rowsData = [],
  rowComponent,
  rowDataFilter,
  closeArrow = true,
  onSubmitEditing,
  onViewableItemsChanged,
  // SimpleTextInput props:
  iconComponent = SearchIconAnimated,
  placeholder,
  autoCorrect = false,
  autoCapitalize = 'words',
  returnKeyType = 'search',
  keyboardType,
  blurOnSubmit,
  inputAccessoryViewID,
  maxLength,
  secureTextEntry,
  autoFocus,
  blurOnClear = false
}: Props<T>) {
  const theme = useTheme()
  const [text, setText] = React.useState<string>(initialValue)
  const [filteredRows, setFilteredRows] = useFilter(rowsData, rowDataFilter)
  const renderItem: ListRenderItem<T> = ({ item }) =>
    rowComponent ? rowComponent(item) : null
  const handleCancel = () => bridge.resolve(undefined)
  const handleChangeText = (text: string) => {
    setText(text)
    setFilteredRows(text)
  }

  const handleSubmitEditing = () =>
    onSubmitEditing != null ? onSubmitEditing(text) : bridge.resolve(text)

  const scrollPadding = React.useMemo<ViewStyle>(() => {
    return { paddingBottom: theme.rem(ModalFooter.bottomRem) }
  }, [theme])

  return (
    <ThemedModal
      bridge={bridge}
      closeButton={closeArrow}
      onCancel={handleCancel}
    >
      {title == null ? null : <ModalTitle>{title}</ModalTitle>}
      {message == null ? null : <ModalMessage>{message}</ModalMessage>}
      {hideSearch ? null : (
        <SimpleTextInput
          vertical={1}
          horizontal={0.5}
          // Our props:
          testID={title}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmitEditing}
          value={text}
          // Outlined Text input props:
          iconComponent={iconComponent}
          placeholder={placeholder}
          autoCorrect={autoCorrect}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          keyboardType={keyboardType}
          blurOnSubmit={blurOnSubmit}
          inputAccessoryViewID={inputAccessoryViewID}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          autoFocus={autoFocus}
          blurOnClear={blurOnClear}
        />
      )}
      <FlatList
        contentContainerStyle={scrollPadding}
        data={filteredRows}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(_, i) => `${i}`}
        renderItem={renderItem}
        onScroll={() => Keyboard.dismiss()}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    </ThemedModal>
  )
}
