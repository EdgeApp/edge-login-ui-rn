import { AppConfig } from '../components/publicApi/types'

let exportConfig: AppConfig = {
  termsOfServiceSite: 'https://edge.app/terms-of-service/'
}
export const setAppConfig = (appConfig: AppConfig | undefined): void => {
  if (appConfig == null) return
  exportConfig = { ...appConfig }
}

export const getAppConfig = () => exportConfig
