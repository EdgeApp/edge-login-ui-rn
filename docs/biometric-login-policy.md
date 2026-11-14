# Biometric login policy

Biometric login unlocks a saved login key. Anyone who knows the device passcode can enroll their own face or fingerprint, which means a change to the device's biometric enrollment must not carry over access to that key.

## Policy

1. Any biometric enrollment change the operating system reports turns off biometric login for the logins saved on that device.
2. The login screen does not show a biometric action for an account whose biometric login is off.
3. One successful login with a PIN, password, or QR code turns biometric login back on for that account. The user does not need to visit settings.
4. Each account recovers separately. A trusted login for one account does not restore another account on the same device.

Turning biometric login off in settings is a separate choice, and a later login does not undo it.

## What counts as an enrollment change

| Change | iOS | Android |
| --- | --- | --- |
| Add a fingerprint | Turns off | Turns off |
| Remove a fingerprint | Turns off | No effect |
| Set up Face ID again | Turns off | n/a |
| Add an alternate appearance | Turns off | n/a |
| Remove all biometrics | Turns off | Turns off |

Each platform decides what it reports, and the two differ on removal. Android keeps the key valid when a fingerprint is removed because no new identity gained access. iOS reports every change without saying what changed, which forces the stricter path.

Face unlock on Android is outside this policy.

## How each platform enforces it

Both platforms expose `hasValidKeychainString`, which reports whether a saved login can still be used. It never prompts and never changes the saved login.

**Android:** the login key is encrypted with a keystore key that the OS permanently invalidates when a biometric is added. The check tries to initialize a cipher with that key, and a missing key or certificate also counts as invalid, because Whorlwind deletes the saved logins in that case too. It cannot go through Whorlwind, because any Whorlwind read or write on an invalidated key deletes the saved logins of every account on the device and creates a new key. The next trusted login writes that account's login under the new key, and other accounts stay off until their own trusted login.

**iOS:** the login key is a keychain item with no biometric access control, and Face ID or Touch ID is a separate prompt. When a login is saved, the check also saves the LocalAuthentication domain state, and it later compares that value with the current one. This enforcement lives in app logic: the item itself is not bound to the enrollment.

A login saved before this check existed has no saved domain state on iOS. It counts as invalid, and each existing iOS user logs in once with a PIN or password after the update. Every login rewrites the saved login and records the current domain state, and a biometric login only runs while the states match. That leaves a trusted login as the only way to record a changed enrollment. The OS can also change the domain state across a major iOS update, which costs the user one trusted login.

## When the check runs

The touch state records the invalid logins when the login screen starts, when the app returns from the background, and after a refused biometric attempt. `getLoginKey` checks again before every biometric login, which keeps an out of date screen from reaching the secret.

If the native check fails with an error, the login counts as invalid. On Android the read would fail anyway, and on iOS a keychain error (such as a locked device) leaves nothing to compare. The list is rebuilt on every check, and a passing error only hides biometric login until the next one.
