export type InitialRouteName =
  | 'login'
  | 'login-password'
  | 'new-account'
  | 'new-light-account'
  | 'upgrade-light-account'

/**
 * Subset of AppConfig from https://github.com/EdgeApp/edge-react-gui/blob/develop/src/types/types.ts
 * This MUST always maintain as a subset
 */
export interface AppConfig {
  // appId?: string
  // appName: string
  // appNameShort: string
  // appStore: string
  // configName: string
  // darkTheme: Theme
  // defaultWallets: string[]
  // knowledgeBase: string
  // lightTheme: Theme
  // notificationServers: string[]
  // phoneNumber: string
  // referralServers?: string[]
  // supportsEdgeLogin: boolean
  // supportEmail: string
  // supportSite: string
  termsOfServiceSite: string
  // website: string
}
