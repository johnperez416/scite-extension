/* global chrome, browser */

const runtime =
  (typeof browser !== 'undefined' && browser && browser.runtime) ||
  (typeof chrome !== 'undefined' && chrome && chrome.runtime) ||
  null

const STYLE_ID = 'scite-extension-fonts'

/**
 * injectFontFaces injects the @font-face rules for the extension's bundled fonts.
 *
 * The URLs are resolved with runtime.getURL() so each browser references its own
 * resource scheme (chrome-extension://, moz-extension://, safari-web-extension://).
 * Declaring these fonts statically in CSS would force us to hardcode a scheme, and
 * the non-matching scheme is treated by the browser as a remote origin, which trips
 * the host page's font-src Content-Security-Policy. Resolving the scheme at runtime
 * avoids that entirely.
 *
 * @param {Document} doc - document to inject into (defaults to the page document)
 */
export function injectFontFaces (doc = document) {
  if (!runtime || !runtime.getURL || doc.getElementById(STYLE_ID)) {
    return
  }

  const url = (path) => runtime.getURL(path)

  const css = `
@font-face {
  font-family: scite-icons;
  font-weight: normal;
  font-style: normal;
  src:
    url('${url('fonts/scite-icons/scite-icons.woff2')}') format('woff2'),
    url('${url('fonts/scite-icons/scite-icons.woff')}') format('woff');
}

@font-face {
  font-family: 'IBM Plex Sans';
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url('${url('fonts/ibm-plex-sans/IBMPlexSans-Regular.woff2')}') format('woff2');
}

@font-face {
  font-family: 'IBM Plex Sans';
  font-weight: 500;
  font-style: normal;
  font-display: swap;
  src: url('${url('fonts/ibm-plex-sans/IBMPlexSans-Medium.woff2')}') format('woff2');
}

@font-face {
  font-family: 'IBM Plex Sans';
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  src: url('${url('fonts/ibm-plex-sans/IBMPlexSans-SemiBold.woff2')}') format('woff2');
}
`

  const style = doc.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  ;(doc.head || doc.documentElement).appendChild(style)
}
