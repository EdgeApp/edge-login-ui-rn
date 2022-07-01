import { writeFileSync } from 'fs'

import strings from './src/common/locales/en_US'

writeFileSync(
  './src/common/locales/strings/enUS.json',
  JSON.stringify(strings, null, 2)
)
