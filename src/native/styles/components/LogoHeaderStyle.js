// @flow
import { scale } from '../../../common/util/scaling.js'

const LogoHeaderStyle = {
  container: {
    position: 'relative',
    width: '100%',
    height: 125,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  image: {
    position: 'relative'
    // width: null,
    // height: null
    // resizeMode: 'stretch'
  }
}
const LogoHeaderStyleShort = {
  container: {
    position: 'relative',
    width: '100%',
    height: 100,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  image: {
    position: 'relative'
    // width: null,
    // height: null
    // resizeMode: 'stretch'
  }
}
const LogoHeaderScaledStyle = {
  container: {
    position: 'relative',
    width: '100%',
    height: scale(125),
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  image: {
    position: 'relative',
    width: scale(80),
    height: scale(78)
    // resizeMode: 'stretch'
  }
}
const LogoHeaderScaledStyleShort = {
  container: {
    position: 'relative',
    width: '100%',
    height: scale(100),
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  image: {
    position: 'relative'
    // width: null,
    // height: null
    // resizeMode: 'stretch'
  }
}
export { LogoHeaderStyleShort }
export { LogoHeaderStyle }

export { LogoHeaderScaledStyleShort }
export { LogoHeaderScaledStyle }
