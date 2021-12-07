/* eslint-disable import/first */
import { ThemeProvider } from '@livechat/ui-kit'
//import Fingerprint2 from 'fingerprintjs2'
const Fingerprint2 = require('fingerprintjs2');
import { each, find, merge } from 'lodash'
import { Provider } from 'mobx-react'
import * as React from 'react'
//import ReactGA from 'react-ga'
import { ApiAiClient } from './api-ai-client/ApiAiClient'
import { Chat } from './components/Chat'
import { IRootStore, RootStore } from './store'
import { IBotPrompt } from './store/bot'
import { theme } from './styles/theme'
import axios, { axiosInstanceConfig } from './util/axios'
import axios1 from 'axios/index';
import LiveChat from './util/livechat'

import {
  comparePromptUrlWithCurrentPage,
  requestIdleCallback
} from './util/helpers'
import Logger from './util/logger'

const log = Logger('MainPage').log

interface IMainPageState {
  isBootstrapped: boolean
}

class MainPage extends React.Component<{}, IMainPageState> {
  private client?: ApiAiClient
  private store?: IRootStore

  constructor(props: any) {
    super(props)
    log('props', props)
    this.state = {
      isBootstrapped: false
    }
    console.time('constructor to componentDidMount')
  }

  public componentDidMount() {
    console.timeEnd('constructor to componentDidMount')
    console.time('componentDidMount isBootstrapped')
    /*
     * NOTE: You should not run fingerprinting directly on or after page load. Rather, delay it for a few milliseconds with setTimeout or requestIdleCallback to
     * ensure consistent fingerprints. See #307, #254, and others. On my machine (MBP 2013 Core i5) + Chrome 46 the default FP process takes about 80-100ms. If
     * you use extendedJsFonts option this time will increase up to 2000ms (cold font cache). To speed up fingerprint computation, you can exclude
     * font detection (~ 40ms), canvas fingerprint (~ 10ms), WebGL fingerprint (~ 35 ms), and Audio fingerprint (~30 ms).
     */
    console.time('componentDidMount delay')

    requestIdleCallback(() => {
      console.timeEnd('componentDidMount delay')
      console.time('componentDidMount Fingerprint')
      new Fingerprint2().get(
        async (
          fingerprint: string,
          components: [{ key: string; value: string }]
        ) => {
          log('delay.fingerprint', fingerprint)
          console.timeEnd('componentDidMount Fingerprint')
          const userAgent = navigator.userAgent
          log('Fingerprint', fingerprint, components, userAgent)
          const currentScript = window.document.getElementById(
            'monrepondeurauto-embedder-d7lcfheammjct'
          )

          log('currentScript', currentScript)
          // data-botId is the new HTML5 compliant data tag (needed by Google Tag Manager)
          // botId is the old deprecated, keep it to support old script injections
          const extractedBotId =
            currentScript &&
            (currentScript.getAttribute('data-botid') ||
              currentScript.getAttribute('botid'))
          const botId =
            extractedBotId || process.env.REACT_APP_BOT_ID || 'unknown'
          log('Bot Id', botId)

          const baseURL = (
            process.env.REACT_APP_API || '/api/'

          ).replace(/\/$/, '')

          log(`axios.defaults.baseURL ${baseURL}`)
          axiosInstanceConfig.baseURL = baseURL
          merge(axiosInstanceConfig, {
            headers: {
              'Content-Type': 'application/json',
              botId
            }
          })


          log('axios.defaults.headers', axios.defaults.headers)
          this.store = RootStore.create({
            session: {}
          })
          this.store.setFingerPrint(fingerprint)
          console.time('componentDidMount fetchBotById')
          await this.store.session.fetchBotById(botId)
          console.timeEnd('componentDidMount fetchBotById')
          console.time('componentDidMount setLang')
          await this.store.setLang()
          console.timeEnd('componentDidMount setLang')
          log('LANG', this.store.getLang)

          const bot = this.store.session.bot
          const minimized = document.getElementById(
            'monrepondeurauto--minimized-welcome'
          )
          if (minimized) {
            minimized.tabIndex = 1
          }
          if (bot) {
            const { active } = bot
            if (active) {

              theme.vars.botAppBackgroud = bot.theme.css.chatBackground
              each(bot.theme.css, (value: any, key: any) => {
                log('setting theme', `--${key}`, value)
                document.documentElement.style.setProperty(`--${key}`, value)
              })
              const previousShowPrompts = bot.theme.css.showPrompts
              console.time('componentDidMount login')
              await this.store.session.login(botId, fingerprint)
              console.timeEnd('componentDidMount login')
              log('session', this.store.session)
              // create dialogflow agent with settings.accessToken
              const accessToken =
                process.env.REACT_APP_ACCESS_TOKEN || this.store.session.token
              if (accessToken) {
                // disable the message bubble here because we dont have a dialogflow response yet, and it would show the default message
                // will be set to the original setting on the bottom
                bot.setShowPrompts(false)
                // show monrepondeurauto greeter early
                this.setState({ isBootstrapped: true })

                const lang = this.store.getLang
                log('preferred language code: ', lang)
                console.time('componentDidMount new ApiAiClient')
                const {
                  session: { sessionId }
                } = this.store
                this.client = new ApiAiClient(
                  { accessToken, botId, sessionId, baseUrl: baseURL },
                  lang
                )
                this.store.setClient(this.client)
                if (sessionId) {
                  const myWindow = window as any
                  myWindow.bcSID = sessionId
                  log('bcSID', myWindow.bcSID)
                }
                console.timeEnd('componentDidMount new ApiAiClient')
                console.time('componentDidMount find prompt and ref')
                const currentPrompt: IBotPrompt | undefined = find(
                  bot.prompts,
                  (prompt: IBotPrompt): boolean => {
                    const isCurrentPage = comparePromptUrlWithCurrentPage(
                      prompt.url
                    )
                    log('check prompt, match? =>', isCurrentPage, {
                      command: prompt.command,
                      type: prompt.type,
                      url: prompt.url
                    })
                    return isCurrentPage
                  }
                )
                log('currentPrompt', currentPrompt)

                log('ref key name:', bot.refKeyName)
                const queryValueForRef = new URLSearchParams(
                  window.location.search
                ).get(bot.refKeyName)
                log(`ref key value:`, queryValueForRef)

                let monRepondeurAutoContext
                if (queryValueForRef) {
                  monRepondeurAutoContext = {
                    data: {

                      monRepondeurAutoRefValue: queryValueForRef
                    },
                    lifespanCount: 10,

                    name: 'monrepondeurauto-ref-context'
                  }
                  log(
                    '🚀 monRepondeurAutoContext will be sent to the dialogflow agent',
                    monRepondeurAutoContext
                  )
                }
                console.timeEnd('componentDidMount find prompt and ref')

                console.time('componentDidMount Dialogflow.shipEvent')
                if (currentPrompt && currentPrompt.type === 'event') {
                  log('prompt is an `event`, shipEvent()', {
                    context: monRepondeurAutoContext,
                    eventData: {
                      fingerprint,
                      userAgent // API - parse user-agent domain and lookup bot whitelisted domains
                    },
                    eventName: currentPrompt.command
                  })
                  try {
                    await this.store.shipEvent({
                      context: monRepondeurAutoContext,
                      eventData: {
                        fingerprint,
                        userAgent // API - parse user-agent domain and lookup bot whitelisted domains
                      },
                      eventName: currentPrompt.command
                    })



                  } catch (err) {
                    log('ShipEventError', err.stack)
                  }

                } else if (currentPrompt && currentPrompt.type === 'training') {
                  log('prompt is a `training`, shipMessage()')
                  await this.store.shipMessage({
                    context: monRepondeurAutoContext,
                    isUserMessage: false,
                    message: currentPrompt.command,
                    type: 'intent'
                  })
                } else {
                  log(
                    'prompt is not specified or ref not matched',
                    'shipEvent(GOOGLE_ASSISTANT_WELCOME)'
                  )
                  await this.store.shipEvent({
                    context: monRepondeurAutoContext,
                    eventData: {
                      fingerprint,
                      userAgent
                    },
                    eventName: 'GOOGLE_ASSISTANT_WELCOME'
                  })
                }



                bot.setShowPrompts(previousShowPrompts)
                this.setState({ isBootstrapped: true })
                console.timeEnd('componentDidMount Dialogflow.shipEvent')
                console.timeEnd('componentDidMount isBootstrapped')
              }
            }
          }
        }
      )
    })
  }

  public render() {
    const { isBootstrapped } = this.state
    if (isBootstrapped && this.store) {
      if (this.store.session.bot) {
        const { active } = this.store.session.bot
        if (active) {
          return (
            <Provider store={this.store}>
              <ThemeProvider vars={theme}>
                <div className="monrepondeurauto monrepondeurauto--app">
                  <Chat store={this.store} />
                </div>
              </ThemeProvider>
            </Provider>
          )
        }
      }
    }
    return null
  }
}

export default MainPage



