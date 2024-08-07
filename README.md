# Edge React Native UI

This repo implements a UI layer on top of [edge-core-js](https://github.com/Airbitz/edge-core-js) to provide React Native applications with secure account management in just a small handful of Javascript API calls.

## Basic usage for react native mobile application

Edge expects to work with React Native v0.60.0 or greater.

First, add the Edge libraries to your project:

`yarn add edge-core-js edge-login-ui-rn`

The login UI depends on some extra external native libraries, which you will have to install as well:

- @react-native-community/datetimepicker v6
- disklet v0.5
- edge-core-js v1
- react-native-email-link v1
- react-native-gesture-handler v2
- react-native-linear-gradient v2
- react-native-localize v2
- react-native-permissions v3
  - Activate the [notification permission for iOS](https://www.npmjs.com/package/react-native-permissions#iOS).
- react-native-reanimated v3
  - Follow the [extra installation steps](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started).
  - Setting up reanimated also involves setting up react-native-gesture-handler.
- react-native-safe-area-context (4.5.0+)
- react-native-share v5 (v7 also works)
- react-native-svg v12
- react-native-vector-icons v10
  - Follow the [extra installation steps](https://www.npmjs.com/package/react-native-vector-icons#installation).
  - We use AntDesign, Entypo, MaterialIcons, FontAwesome, FontAwesome5, and SimpleLineIcons.
- react-native-webview v13
- rn-id-blurview v1
- react-native-haptic-feedback v1 (optional)

To initialize the Edge core library, your application needs to mount the `MakeEdgeContext` component and keep it around for the lifetime of the app. The `MakeEdgeContext` component will create and manage an `EdgeContext` object.

You should also wrap your entire application in a `LoginUiProvider` component, which the login scene needs to display modals, error alerts, and similar floating UI:

```jsx
import { MakeEdgeContext } from 'edge-core-js'
import { LoginUiProvider } from 'edge-login-ui-rn'
import * as React from 'react'

export const App = props => {
  // Stores the Edge context:
  const [context, setContext] = React.useState()

  return (
    <LoginUiProvider>
      <MakeEdgeContext
        // Get this from our support team:
        apiKey="..."
        appId="com.your-app"

        // Called when the core is done loading:
        onLoad={setContext}
        onError={showError}
      />
      <MainRouterComponent edgeContext={context} />
    </LoginUiProvider>
  )
}
```

Now, you can show or hide the `LoginScreen` component on demand as part of your app's navigation:

```javascript
import { LoginScreen } from 'edge-login-ui-rn'

export const MainRouterComponent = props => {
  const { edgeContext } = props

  // Stores the Edge account:
  const [account, setAccount] = React.useState()

  // Once the context is ready, we can show the login screen.
  // Once the user logs in, we can show the main app:
  return edgeContext == null ? (
    <Text>Loading...</Text>
  ) : account == null ? (
    <LoginScreen
      accountOptions={{}}
      context={edgeContext}
      onLogin={setAccount}
    />
  ) : (
    <YourApp edgeAccount={account} />
  )
}
```

Feel free to replace this `MainRouterComponent` example with a proper routing library such as [react-navigation](https://reactnavigation.org/).

You can use the `account` object to create and restore wallet private keys:

```js
async function getAppPrivateKey (account) {
  // Find the first Ethereum wallet in the account:
  const edgeWalletInfo = account.getFirstWalletInfo('wallet:ethereum')

  // If an Ethereum wallet already exists, return its key:
  if (edgeWalletInfo != null) {
    return edgeWalletInfo.keys.ethereumKey
  }

  // There are no Ethereum wallets, so make one:
  const keys = {
    ethereumKey: new Buffer(secureRandom(32)).toString('hex')
  }
  const walletId = await account.createWallet("wallet:ethereum", keys)
  const edgeWalletInfo = account.walletInfos[walletId]
  return edgeWalletInfo.keys.ethereumKey
}
```

The edge-login-ui-rn library does a bunch of account initialization before it calls `onLogin`. If you don't want this work to delay showing your application, consider passing the `fastLogin` flag to skip these steps. If you do pass the `fastLogin` flag, you will need to finish the initialization work yourself, once you app is displayed:

- Call `refreshTouchId(account)` to ensure that biometric logins will work correctly.
- Call `showNotificationPermissionReminder` to request notification permissions. We need these for our IP validation and 2FA features to be secure.
- Optionally call `showOtpReminder` to remind the user to turn on 2-factor authentication.
- Call `hasSecurityAlerts` to see if there are pending login requests from other devices. If so, you will want to display the `SecurityAlertsScreen` to handle those.
- Optionally call `watchSecurityAlerts` to watch for incoming login requests, and respond by showing the `SecurityAlertsScreen`.

### Adding core plugins

If you want full wallet functionality, with balances, transactions, and so forth, you need to add one or more currency plugins to your app. To do this, first use NPM to install one of our plugin libraries, such as [edge-currency-accountbased](https://github.com/EdgeApp/edge-currency-accountbased) for Ethereum.

Each plugin library includes a JavaScript bundle that needs to be integrated into your native application. To do this on Android, add a `prepare` script to your app's `package.json` file that copies the file `node_modules/edge-currency-accountbased/lib/react-native/edge-currency-accountbased.js` into your `android/app/src/main/assets/` folder. For iOS, open your App in Xcode and drag the `edge-currency-accountbased.js` file into the `Resources` section of your project.

Finally, you need to tell the Edge core about these plugins. You do this by passing the location of the plugin JS bundle, as well as a config object that specifies which currencies to activate:

```jsx
<MakeEdgeContext
  pluginUris={[
    "edge-currency-accountbased.js"
  ]}
  plugins={{
    'ethereum': true,
    'eos': false
  }}

  // Other properties from earlier...
/>
```

## Sample React Native App repo

See a sample implementation at [edge-login-ui-rn-demo](https://github.com/EdgeApp/edge-login-ui-rn-demo)
