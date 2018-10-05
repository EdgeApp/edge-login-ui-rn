// @flow

import * as Colors from '../../constants/Colors'
import { scale, hs, vs } from '../../util'
import * as Styles from '../'

const ModalStyles = {
  modal: {},
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.MODAL_BOX
  }
}

const SkipModalStyle = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.MODAL_BOX
  },
  skip: {
    container: {
      width: hs(280)
    },
    backgroundContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'flex-end'
    },
    backgroundBox: {
      backgroundColor: Colors.WHITE,
      width: hs(280),
      height: vs(202),
      borderWidth: 1,
      borderColor: Colors.PRIMARY
    },
    foreground: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      alignItems: 'center'
    },
    logoContainer: {
      flex: 50
    },
    headlineContainer: {
      alignItems: 'center',
      justifyContent: 'space-around'
    },
    textContainer: {
      alignItems: 'center',
      marginHorizontal: 20
    },
    buttonsContainer: {
      justifyContent: 'space-around',
      flexDirection: 'row',
      width: '100%'
    },
    headlineText: {
      fontSize: scale(14),
      color: Colors.PRIMARY
    },
    copyText: {
      fontSize: scale(11),
      textAlign: 'center'
    },
    cancelButton: {
      upStyle: { ...Styles.SecondaryButtonUpStyle, width: 117, height: 44 },
      upTextStyle: Styles.SecondaryButtonUpTextStyle,
      downTextStyle: Styles.SecondaryButtonUpTextStyle,
      downStyle: { ...Styles.SecondaryButtonDownStyle, width: 117, height: 44 }
    },
    skipButton: {
      upStyle: { ...Styles.PrimaryButtonUpStyle, width: 117, height: 44 },
      upTextStyle: Styles.PrimaryButtonUpTextStyle,
      downTextStyle: Styles.PrimaryButtonUpTextStyle,
      downStyle: { ...Styles.PrimaryButtonDownStyle, width: 117, height: 44 }
    }
  }
}

export { ModalStyles }
export { SkipModalStyle }
