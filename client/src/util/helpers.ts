import Logger from './logger'

const log = Logger('Helpers').log

/**
 * http://www.Example.at/anyPath/foo => www.Example.at/anypath/foo
 * @param href
 */
export function trimAndLowerCaseHref(href: string) {
  return href
    .toLowerCase()
    .replace('https://', '')
    .replace('http://', '')
    .trim()
}

/**
 * www.example.at/?ref=123 => www.example.at/
 * @param href
 */
export function stripSearchFromHref(href: string) {
  return href.split('?')[0]
}

/**
 * www.example.at/ => www.example.at/
 * @param href
 */
export function stripLastSlash(href: string) {
  const strippedHref = href.replace(/\/$/, '')
  // if user enters '/' then it would remove this, but we want to keep it
  if (strippedHref === '') {
    return '/'
  }
  return strippedHref
}

/**
 * www.example.at/anyPath/foo => anyPath/foo
 * @param href
 */
export function stripDNS(href: string) {
  return trimAndLowerCaseHref(href)
    .split('/')
    .slice(1)
    .join('/')
}

/**
 * takes the prompt url and compares it to the current page url
 * it tries several abstractions of the url to avoid user input errors
 * @param promptUrl
 */
export function comparePromptUrlWithCurrentPage(promptUrl: string) {
  let currentHref = window.location.href
  let promptHref = promptUrl

  if (promptHref.includes('*')) {
    const promptHrefSplits = promptHref.split('*')
    log('there is a placeholder *', promptHrefSplits)
    let splitsShouldMatchedCounts = 0
    let splitsMatchedCounts = 0
    promptHrefSplits.forEach(split => {
      log('split', split)
      if (!split) {

        return
      }
      splitsShouldMatchedCounts++
      if (currentHref.includes(split)) {
        splitsMatchedCounts++

        currentHref = currentHref.replace(split, '')
        log('currentHref', currentHref)
      }
    })
    return splitsMatchedCounts === splitsShouldMatchedCounts
  }


  if (currentHref === promptHref) {
    return true
  }
  currentHref = trimAndLowerCaseHref(currentHref)
  promptHref = trimAndLowerCaseHref(promptHref)

  if (currentHref === promptHref) {
    return true
  }
  currentHref = stripSearchFromHref(currentHref)
  promptHref = stripSearchFromHref(promptHref)

  if (currentHref === promptHref) {
    return true
  }
  currentHref = stripLastSlash(currentHref)
  promptHref = stripLastSlash(promptHref)

  if (currentHref === promptHref) {
    return true
  }
  currentHref = stripDNS(currentHref)
  promptHref = stripDNS(promptHref)

  if (currentHref === promptHref) {
    return true
  }
  return false
}

/**
 * polyfill for requestIdleCallback
 * not supported on safari (September 2019)
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
 */
export const requestIdleCallback =

  window.requestIdleCallback ||
  ((
    callback: (values: { didTimeout: boolean; timeRemaining(): number }) => void
  ) => {
    const start = Date.now()
    return setTimeout(() => {
      if (callback) {
        callback({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start))
          }
        })
      }
    }, 1)
  })



