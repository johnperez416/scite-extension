/* global chrome, browser, __IS_EXTENSION__ */

const CDN_BASE = 'https://cdn.scite.ai/assets'

const runtime =
  (typeof chrome !== 'undefined' && chrome && chrome.runtime) ||
  (typeof browser !== 'undefined' && browser && browser.runtime) ||
  null

// __IS_EXTENSION__ is injected at build time (true for the extension bundle,
// false for the standalone badge bundle). It is undefined under Jest, which is
// handled by the typeof guard.
const isExtension = typeof __IS_EXTENSION__ !== 'undefined' && __IS_EXTENSION__

/**
 * assetUrl returns a URL for a bundled asset.
 *
 * In the extension build we load the asset from the extension's own origin
 * (declared in `web_accessible_resources`) so that we never trip a host page's
 * Content-Security-Policy. In the badge build (which runs inside a publisher's
 * page and has no extension origin) we fall back to the scite CDN.
 *
 * @param {string} extensionPath - path within the extension, e.g. 'images/logo.svg'
 * @param {string} cdnPath - path within the scite CDN assets, e.g. 'images/logo.svg'
 * @returns {string}
 */
export const assetUrl = (extensionPath, cdnPath) => {
  if (isExtension && runtime && runtime.getURL) {
    return runtime.getURL(extensionPath)
  }
  return `${CDN_BASE}/${cdnPath}`
}

export const logoUrl = () => assetUrl('images/logo.svg', 'images/logo.svg')

export const singleLetterLogoUrl = () =>
  assetUrl('images/scite_single_letter.svg', 'images/scite_single_letter.svg')
