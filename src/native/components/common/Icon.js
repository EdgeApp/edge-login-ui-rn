import React from 'react'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import IonIcon from 'react-native-vector-icons/Ionicons'
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import * as Constants from '../../../common/constants'

/* type Props= {
  style: any, {color min}
  name: string,
  size: number,
  type: string
} */

const Icon = ({ style, name, size, type }) => {
  switch (type) {
    case Constants.EVIL_ICONS:
      return <EvilIcons style={style} name={name} size={size} />
    case Constants.ENTYPO:
      return <Entypo style={style} name={name} size={size} />
    case Constants.MATERIAL_ICONS:
      return <MaterialIcon style={style} name={name} size={size} />
    case Constants.MATERIAL_COMMUNITY:
      return <MaterialCommunity style={style} name={name} size={size} />
    case Constants.FONT_AWESOME:
      return <FAIcon style={style} name={name} size={size} />
    case Constants.ION_ICONS:
      return <IonIcon style={style} name={name} size={size} />
    case Constants.SIMPLE_ICONS:
      return <SimpleIcon style={style} name={name} size={size} />
  }
  console.warn(
    'No icon: Probably forgot the type ' + type + 'or ' + name + 'doesnt exist'
  )
  return null
}

export { Icon }
