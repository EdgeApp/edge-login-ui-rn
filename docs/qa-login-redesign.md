# QA: Login redesign

Manual coverage vectors and device setup for the redesigned login scene
(`src/components/scenes/LoginScene.tsx`).

The redesign folds the old separate password and PIN scenes into one scene with
a two-segment flavor toggle, moves "trouble logging in" actions into a help
modal, and makes the PIN dots and the biometric toggle mutually exclusive.

## What changed, in test terms

| Area | Before | After |
| --- | --- | --- |
| Scenes | Separate password scene and PIN scene | One scene, `login`, with a password/PIN toggle |
| Switching | Navigation between scenes | `LoginFlavorToggle` pill (`loginTabPassword` / `loginTabPin`) |
| PIN + biometric | PIN dots and the biometric toggle both visible | Only one of the two is visible at a time |
| Help actions | Inline links | `LoginHelpModal` with QR-login and password-recovery rows |

## Device setup

Biometric state comes from two independent places, and both have to line up
before the biometric toggle appears:

1. **Device biometry enrolled** (`getSupportedBiometryType` in `src/keychain.ts`).
2. **Biometric login enabled for that account**, which writes a keychain entry.
   `touchLoginEnabled` requires an entry for that specific user, so enabling it
   for one account on a device says nothing about the others.

### iOS Simulator

- Enroll: **Features > Face ID > Enrolled** (or **Features > Touch ID > Enrolled**
  on a Touch ID device profile). The toggle is per-simulator and survives app
  reinstalls.
- Approve a prompt: **Features > Face ID > Matching Face** (Touch ID: **Matching
  Touch**).
- Reject a prompt: **Features > Face ID > Non-matching Face**.
- Un-enroll to test the no-biometry path. Fully quit and relaunch the app after
  changing enrollment: biometry type is read once at startup into
  `state.touch.biometryType`, so a mid-session change does not take effect.
- Face ID vs Touch ID changes both the icon and the label, so cover them
  separately. Pick a simulator whose device supports the one you want (Face ID on
  iPhone X and later, Touch ID on iPhone SE and iPhone 8).

### Android emulator

- Enroll: **Settings > Security > Fingerprint**, then complete the enrollment
  wizard, sending touches with `adb -e emu finger touch 1`.
- Approve a prompt: `adb -e emu finger touch 1` (the same finger ID used to
  enroll).
- Reject a prompt: `adb -e emu finger touch 2` (any un-enrolled ID).
- Android reports `Fingerprint`, which the app maps to `TouchID` with the
  fingerprint wording, so verify the Android label separately from iOS.

### Account states

Build these on the sim before the pass, since most vectors need a specific one:

- **No saved users**: fresh install, or log out and remove the account from the
  list. Password flavor only.
- **PIN only**: enable PIN login in settings, leave biometric off.
- **Biometric only**: enable biometric login, disable PIN login.
- **PIN and biometric**: both enabled. This is the case the mutual-exclusion rule
  is about.
- **Neither**: both disabled, account still saved.
- **Light/guest account**: created with no username.
- **Six or more saved users**: needed for the dropdown scroll and its fade
  gradient (the list caps at 5 visible rows).

## Coverage vectors

### 1. Flavor toggle

| # | Setup | Steps | Expected |
| --- | --- | --- | --- |
| 1.1 | Saved user, PIN enabled | Open login | Scene opens in the PIN flavor |
| 1.2 | Saved user, PIN and biometric off | Open login | Scene opens in the password flavor |
| 1.3 | Any | Tap the password pill, then the PIN pill | Body swaps each time, pill highlight follows |
| 1.4 | Saved user, PIN and biometric off | Tap the PIN pill | Pill reads greyed-out, a toast explains PIN is not enabled, flavor stays on password |
| 1.5 | Password typed, PIN enabled | Type a password, wait several seconds without submitting | Scene stays on the password flavor. It must not jump to PIN when the account or biometry state resolves |
| 1.6 | Deep link to `login-password` | Open the password-only route for a PIN-enabled user | Opens in the password flavor |

### 2. PIN dots and biometric toggle are mutually exclusive

The rule: the biometric toggle holds the slot only while there is nothing for
the dots to report. A typed digit, a PIN error, or a lockout countdown takes the
slot back. A fully empty set of dots is therefore only visible when biometric
login is unavailable.

| # | Setup | Steps | Expected |
| --- | --- | --- | --- |
| 2.1 | PIN only, no biometric | Open the PIN flavor | Four empty dots, no biometric icon or label |
| 2.2 | PIN and biometric | Open the PIN flavor | Biometric icon and label, no dots |
| 2.3 | PIN and biometric | Type one digit | Dots appear showing 1 of 4 filled, biometric icon and label disappear |
| 2.4 | PIN and biometric | Type one digit, then backspace to empty | Biometric icon and label return, dots disappear |
| 2.5 | PIN and biometric | Enter a wrong PIN | Dots stay visible with the error message under them, biometric stays hidden |
| 2.6 | PIN and biometric | Enter enough wrong PINs to trigger the lockout | Countdown spinner holds the slot, biometric stays hidden until the wait clears |
| 2.7 | Biometric only, no PIN | Open the PIN flavor | Biometric icon and label, no dots and no keypad |
| 2.8 | Any of the above | Watch the keypad while the slot swaps | Keypad does not shift vertically |

### 3. Biometric login

| # | Setup | Steps | Expected |
| --- | --- | --- | --- |
| 3.1 | Face ID enrolled and enabled | Open the PIN flavor | Face ID glyph with the "Use Face ID" label |
| 3.2 | Touch ID enrolled and enabled, iOS | Open the PIN flavor | Fingerprint glyph with the Touch ID label |
| 3.3 | Fingerprint enrolled and enabled, Android | Open the PIN flavor | Fingerprint glyph with the fingerprint label |
| 3.4 | Any biometric | Tap the toggle, then approve | Login completes |
| 3.5 | Any biometric | Tap the toggle, then reject | Returns to the login scene, still usable, no duplicate prompt |
| 3.6 | Any biometric | Tap the toggle twice quickly | Only one prompt, the second tap is ignored while busy |
| 3.7 | Enabled in app, then un-enrolled on device | Relaunch, open the PIN flavor | No biometric toggle. Empty dots if PIN is on |

### 4. PIN login

| # | Setup | Steps | Expected |
| --- | --- | --- | --- |
| 4.1 | PIN enabled | Enter the correct PIN | Submits on the 4th digit, no submit button needed |
| 4.2 | PIN enabled | Enter a wrong PIN | Error under the dots, PIN clears, keypad stays usable |
| 4.3 | PIN enabled | Repeat wrong PINs past the limit | Lockout message with a countdown, keypad disabled until it clears |
| 4.4 | PIN enabled, airplane mode | Enter the correct PIN | Network error message, not an invalid-PIN message |
| 4.5 | PIN enabled | Type digits and backspace repeatedly | Dot count tracks the entry, never goes below zero |

### 5. Password login

| # | Setup | Steps | Expected |
| --- | --- | --- | --- |
| 5.1 | Any | Enter valid credentials | Login completes |
| 5.2 | Any | Enter a wrong password | Invalid-credentials message |
| 5.3 | Any | Enter an unknown username | Invalid-account message on the username field |
| 5.4 | 2FA account | Enter valid credentials from an unapproved device | Routes to the OTP error scene |
| 5.5 | Any, airplane mode | Submit | Network error message |
| 5.6 | Any | Repeat wrong passwords past the limit | Wait message with the remaining time |

### 6. Username dropdown

| # | Setup | Steps | Expected |
| --- | --- | --- | --- |
| 6.1 | 2 or more saved users | Tap the dropdown chevron | List opens, chevron flips |
| 6.2 | 6 or more saved users | Open the list and scroll | 5 rows visible, list scrolls, bottom gradient fades out at the end |
| 6.3 | Any | Pick a PIN-enabled user while on the password flavor | Selection applies, fields clear |
| 6.4 | On the PIN flavor | Pick a user with no PIN or biometric | Flavor falls back to password with a toast |
| 6.5 | Light/guest account with no username | Pick it | Jumps straight to the PIN flavor, since password login is impossible |
| 6.6 | Any | Open the list with the keyboard up | Keyboard dismisses, list is not covered |

### 7. Login help modal

| # | Setup | Steps | Expected |
| --- | --- | --- | --- |
| 7.1 | Any | Open the help modal | Two card rows: QR login and password recovery |
| 7.2 | Any | Tap the QR row | QR scanner modal opens |
| 7.3 | Any | Tap the recovery row | Recovery token input opens |
| 7.4 | Any | Submit an invalid recovery token | Invalid-token message, modal stays open |
| 7.5 | Any | Dismiss the modal | Returns to login with state intact |

### 8. Cross-cutting

| # | Vector | Expected |
| --- | --- | --- |
| 8.1 | Light and dark theme | Icons, dots, pills and card rows all follow the theme, nothing invisible |
| 8.2 | Largest and smallest OS font size | No clipping. The PIN dots and pill labels do not scale with the OS font size by design |
| 8.3 | Small device (iPhone SE) | Scene scrolls, keypad reachable, nothing cut off |
| 8.4 | Landscape, tablet | Layout holds |
| 8.5 | Background and foreground mid-entry | Entered PIN clears, no crash, no stuck spinner |
| 8.6 | Rapid flavor toggling while a login is in flight | No duplicate login, no stuck spinner |
| 8.7 | Both platforms | Run at least sections 2 and 3 on iOS and on Android, since the biometric label and glyph differ |

## Known non-issues

- The biometric icon fades back in each time the PIN returns to empty. The fade
  is the intended enter animation, not a flicker.
- The PIN pill stays visible and tappable when PIN and biometric are both off. It
  is greyed out and explains itself with a toast rather than disappearing.
