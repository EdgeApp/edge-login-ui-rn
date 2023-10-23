/**
 * IMPORTANT: Changes in this file MUST be duplicated in edge-react-gui!
 */
import type { ChallengeError } from 'edge-core-js'
import * as React from 'react'
import { AirshipBridge } from 'react-native-airship'
import { WebView, WebViewNavigation } from 'react-native-webview'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { ModalTitle } from '../themed/ModalParts'
import { ThemedModal } from '../themed/ThemedModal'

interface Props {
  bridge: AirshipBridge<boolean | undefined>
  // A nullish challengeError prompts with dummy challenge page for AB testing
  challengeError?: ChallengeError
}

export const ChallengeModal = (props: Props) => {
  const { bridge, challengeError } = props

  const handleCancel = useHandler(() => bridge.resolve(undefined))
  const handleLoading = useHandler((event: WebViewNavigation): boolean => {
    if (/\/success$/.test(event.url)) {
      bridge.resolve(true)
      return false
    }
    if (/\/failure$/.test(event.url)) {
      bridge.resolve(false)
      return false
    }
    return true
  })

  // Allow the modal background to appear inside the WebView.
  // This is a magic value from the WebView documentation,
  // so don't use the theme - normal colors don't do anything.
  const webviewStyle = { backgroundColor: '#00000000' }

  return (
    <ThemedModal bridge={bridge} onCancel={handleCancel}>
      <ModalTitle>{lstrings.complete_captcha_title}</ModalTitle>
      <WebView
        source={
          challengeError == null
            ? { html: abTestDummyPage }
            : { uri: challengeError.challengeUri }
        }
        style={webviewStyle}
        onShouldStartLoadWithRequest={handleLoading}
      />
    </ThemedModal>
  )
}

const abTestDummyPage = `<!DOCTYPE html>
<html><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CAPTCHA</title>
    <link rel="icon" href="https://edge.app/wp-content/uploads/2021/09/favicon.png" sizes="32x32">
    <style>
      body {
        text-align: center;
        background-color: #121d25;
        font: 12px Verdana;
        margin: 0;
        padding: 20px;
      }
      #container {
        margin-right: auto;
        margin-left: auto;
        width: 250px;
        position: relative;
      }
      #piece {
        left: 0;
        position: absolute;
        top: 0;
      }
      #slider {
        background-color: #2b333a;
        border-radius: 25px;
        color: #fff;
        cursor: default;
        height: 50px;
        line-height: 50px;
        margin-top: 25px;
        text-align: center;
        padding-right: 5px;
        padding-left: 55px;
      }
      #track {
        background-color: #2b333a;
        border-radius: 25px;
        height: 50px;
        left: 0;
        width: 0;
        position: absolute;
      }
      #thumb {
        align-items: "center";
        background-color: #00f1a2;
        border-radius: 25px;
        height: 50px;
        left: 0;
        position: absolute;
        width: 50px;
      }
    </style>
  </head>
  <body id="body">
    <div id="container" draggable="false">
      <img src="data:image/png;base64,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" alt="CAPTCHA challenge">
      <img id="piece" src="data:image/png;base64,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">
      <div id="slider">
        <div id="track"></div>
        <div id="thumb">
          <svg viewBox="0 0 50 50" role="img">
            <path d="M23 17l8 8l-8 8" fill="none" stroke-linejoin="round" stroke-linecap="round" stroke-width="4" stroke="#121d25"></path>
          </svg>
        </div>
        Slide to finish the puzzle
      </div>
    </div>
    <script>
      function setup() {
        // Hello, time-traveler! Welcome back to the year 2001.
        var body = document.getElementById("body");
        var piece = document.getElementById("piece");
        var thumb = document.getElementById("thumb");
        var track = document.getElementById("track");
        var dragging = false;
        var done = false;
        var solution = 0;
        var origin = { x: 0, y: 0 };
        var trail = { x: [], y: [] };

        function handleSuccess() {
          document.location =  "https://login.edge.app/captcha/xxxx/success";
        }
        function handleFail() {
          document.location =  "https://login.edge.app/captcha/xxxx/failure";
        }

        function handleEnd() {
          if (!dragging) return;
          done = true;
          dragging = false;

          if (solution > 100 && solution < 108) {
            handleSuccess();
          } else {
            handleFail();
          }
        }

        function handleStart(e) {
          if (done) return;
          dragging = true;
          origin = {
            x: e.clientX || e.touches[0].clientX,
            y: e.clientY || e.touches[0].clientY,
          };
        }

        function handleMove(e) {
          if (!dragging) return;
          const move = {
            x: (e.clientX || e.touches[0].clientX) - origin.x,
            y: (e.clientY || e.touches[0].clientY) - origin.y,
          };
          if (move.x > 200 || move.x < 0) return;
          solution = move.x;
          trail.x.push(move.x);
          trail.y.push(move.y);
          piece.style.left = move.x + "px";
          thumb.style.left = move.x + "px";
          track.style.width = move.x + 50 + "px";
        }

        body.onmousemove = handleMove;
        body.onmouseup = handleEnd;
        body.ontouchend = handleEnd;
        body.ontouchmove = handleMove;
        piece.onmousedown = handleStart;
        piece.ontouchstart = handleStart;
        thumb.onmousedown = handleStart;
        thumb.ontouchstart = handleStart;
      }
      setup();
    </script>
  

</body></html>`
