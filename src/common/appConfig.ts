import { AppConfig } from '../components/publicApi/publicTypes'

let exportConfig: AppConfig = {
  supportEmail: 'support@edge.app',
  termsOfServiceSite: 'https://edge.app/terms-of-service/'
}
export const setAppConfig = (appConfig: AppConfig | undefined): void => {
  if (appConfig == null) return
  exportConfig = { ...appConfig }
}

export const getAppConfig = () => exportConfig
