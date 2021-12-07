import {
  delay,
  get,
  includes,
  isEmpty,
  map,
  random,
  size,
  without
} from 'lodash'
import { flow, types } from 'mobx-state-tree'
import { ApiAiClient } from '../api-ai-client/ApiAiClient'
import { IContext, IStringMap } from '../api-ai-client/Interfaces'
import {
  Fulfillment,
  Result,
  webhookCarouselSelect,
  webhookCarouselSelectItems,
  webhookImageObj,
  webhookListSelect,
  webhookListSelectItems,
  webhookOptionInfo
} from './messages'
import { Session } from './session'

import { toJS } from 'mobx'
import { getLang, getTTSFile } from '../api'

import Logger from '../util/logger'
const log = Logger('RootStore').log

// tslint:disable
// unable to use Bluebird if imported like this for example:
// // import * as Bluebird from 'bluebird'
// Bluebird.each > each does not exist on type Bluebird

const Bluebird = require('bluebird')
// tslint:enable

export const RootStore = types
  .model({
    fingerprint: types.optional(types.string, ''),
    hideBrowserTab: types.optional(types.boolean, false),
    history: types.optional(types.array(Fulfillment), []),
    languageCode: types.optional(types.string, 'en'),
    session: Session,
    ttsAudioFiles: types.optional(types.array(types.string), []),
    webViewTarget: types.maybe(types.string),
    webViewUrl: types.maybe(types.string)
  })
  .views(self => ({
    get getLang() {
      return self.languageCode
    },
    get getTTSHistory() {
      return self.ttsAudioFiles
    }
  }))
  .actions(self => ({
    pushTTS(audioFile: any) {
      self.ttsAudioFiles.push(audioFile)
    },
    clearTTS() {
      self.ttsAudioFiles.length = 0
    },
    pushHistory(fulfillment: any) {
      self.history.push(fulfillment)
    }
  }))
  .actions(self => ({
    playTTS() {
      const tts = new Audio()
      let i = 0
      const playlist = self.ttsAudioFiles
      tts.addEventListener(
        'ended',
        () => {
          ++i
          if (i < playlist.length) {
            tts.src = playlist[i]
            tts.play()
          } else {
            self.clearTTS()
          }
        },
        true
      )
      tts.loop = false
      tts.src = playlist[0]
      tts.play()
    }
  }))
  .actions(self => ({
    async applyMessage(response: any) {
      log('response', response)
      let res = 0
      if (response) {

        const isResult = Result.is({ responses: response })
        log('isResult', isResult)
        log('response', response)
        if (!isResult) {

          if (

            response.fulfillmentMessages[0].platform ===
            'PLATFORM_UNSPECIFIED' &&
            response.fulfillmentMessages[0].text.text[0] !== '' &&
            isEmpty(response.webhookPayload)
          ) {

            const messages = response.fulfillmentMessages

            const SingleDefault = {
              platform: 'PLATFORM_UNSPECIFIED',


              text: messages


            }
            const isFulfillment = Fulfillment.is(SingleDefault)

            log("SingleDefault", SingleDefault)

            log("Fulfillment.is(SingleDefault)", isFulfillment)

            const payload = Fulfillment.create({ SingleDefault })
            self.pushHistory(payload)

            // single default tts
            if (
              self.session.bot &&
              self.session.bot.integrations.ttsApiKey
            ) {
              const audio = await getTTSFile(
                self.session.bot.integrations.ttsApiKey,
                SingleDefault.text.text[0],
                response.languageCode,
                self.session.bot.integrations.ttsGender
              )
              self.pushTTS(audio)
              if (self.session.tts) {
                self.playTTS()
              }
            }
          }

          // fulfillment
          // srCount used to play array of audio files once we've
          // mapped through all simpleResponses in fulfillmentMessages
          let srCount = 0
          map(response.fulfillmentMessages, (fulfillment: any) => {
            if (fulfillment.message === 'simpleResponses') {
              srCount++
            }
          })

          await Bluebird.each(
            response.fulfillmentMessages,
            async (fulfillment: any, i: number) => {
              const isFulfillment = Fulfillment.is(fulfillment)

              const isPlatformCompatible = includes(
                ['ACTIONS_ON_GOOGLE', 'MONREPONDEURAUTO'],
                fulfillment.platform
              )
              log(
                'isFulfillment',
                isFulfillment,
                'isPlatformCompatible',
                isPlatformCompatible,
                fulfillment
              )
              if (isFulfillment && isPlatformCompatible) {
                // if (isFulfillment) {

                self.pushHistory(fulfillment)
                log(
                  'History: ',
                  self.history
                )

                // simple response tts
                if (
                  fulfillment.message === 'simpleResponses' &&
                  self.session.bot &&
                  self.session.bot.integrations.ttsApiKey
                ) {
                  const sr = fulfillment.simpleResponses
                  const audio = await getTTSFile(
                    self.session.bot.integrations.ttsApiKey,
                    sr.simpleResponses[0].textToSpeech,
                    response.languageCode,
                    self.session.bot.integrations.ttsGender
                  )
                  self.pushTTS(audio)
                  log('tts history', toJS(self.ttsAudioFiles))
                  if (self.session.tts && i === srCount - 1) {
                    self.playTTS()
                  }
                }
              }
            }
          )


          if (
            response.webhookPayload &&
            response.webhookPayload.google &&
            response.webhookPayload.google.richResponse.items
          ) {
            // aog used to play array of audio files once we've
            // mapped through all simpleResponses in items
            let aogCount = 0
            map(
              response.webhookPayload.google.richResponse.items,
              (item: any) => {
                if (item.simpleResponse) {
                  aogCount++
                }
              }
            )

            log('aogCount', aogCount)

            await Bluebird.each(
              response.webhookPayload.google.richResponse.items,
              async (items: any, i: number) => {
                const isRichResponse = Fulfillment.is(items)
                log('isRichResponseItems', isRichResponse, items)
                if (isRichResponse) {
                  self.pushHistory(items)

                  // webhook simple response tts
                  if (
                    items.simpleResponse &&
                    self.session.bot &&
                    self.session.bot.integrations.ttsApiKey
                  ) {
                    const audio = await getTTSFile(
                      self.session.bot.integrations.ttsApiKey,
                      items.simpleResponse.textToSpeech,
                      response.languageCode,
                      self.session.bot.integrations.ttsGender
                    )
                    self.pushTTS(audio)
                    log('tts', toJS(self.ttsAudioFiles))
                    if (self.session.tts && i === aogCount - 1) {
                      self.playTTS()
                    }
                  }
                }
              }
            )
          }

          // link out suggestion
          if (
            response.webhookPayload &&
            response.webhookPayload.google &&
            response.webhookPayload.google.richResponse
              .linkOutSuggestion
          ) {
            const chip =
              response.webhookPayload.google.richResponse
                .linkOutSuggestion
            const aogLinkOut = {
              destinationName: chip.destinationName,
              url: chip.url
            }
            const isLinkOut = Fulfillment.is(aogLinkOut)
            log('isLinkOut', isLinkOut, chip)
            if (isLinkOut) {
              const render = Fulfillment.create({ aogLinkOut })
              self.pushHistory(render)
            }
          }

          // webhook carousel
          if (
            response.webhookPayload &&
            response.webhookPayload.google &&
            response.webhookPayload.google.systemIntent &&
            response.webhookPayload.google.systemIntent.data &&
            response.webhookPayload.google.systemIntent.data
              .carouselSelect &&
            response.webhookPayload.google.systemIntent.data
              .carouselSelect.items
          ) {
            const items = {
              webhookCarouselSelect: {
                items:
                  response.webhookPayload.google.systemIntent.data
                    .carouselSelect.items
              }
            }

            const webhookItems =
              response.webhookPayload.google.systemIntent.data
                .carouselSelect.items

            const webhookCarouselItems = map(webhookItems, (item: any) => {
              return webhookCarouselSelectItems.create({
                description: item.description,
                image: webhookImageObj.create(item.image),
                optionInfo: webhookOptionInfo.create(item.optionInfo),
                title: item.title
              })
            })

            const webhookCarousel = webhookCarouselSelect.create({
              items: webhookCarouselItems
            })

            const isCarouselSelect = Fulfillment.is(items)

            if (isCarouselSelect) {
              const fulfillment = Fulfillment.create({
                webhookCarouselSelect: webhookCarousel
              })
              self.pushHistory(fulfillment)
            }
          }

          // webhook list
          if (
            response.webhookPayload &&
            response.webhookPayload.google &&
            response.webhookPayload.google.systemIntent &&
            response.webhookPayload.google.systemIntent.data &&
            response.webhookPayload.google.systemIntent.data
              .listSelect &&
            response.webhookPayload.google.systemIntent.data
              .listSelect.items
          ) {
            const items = {
              webhookListSelect: {
                items:
                  response.webhookPayload.google.systemIntent.data
                    .listSelect.items,
                title:
                  response.webhookPayload.google.systemIntent.data
                    .listSelect.title
              }
            }
            const isListSelect = Fulfillment.is(items)
            log('isListSelect?', isListSelect)

            if (isListSelect) {
              const arr =
                response.webhookPayload.google.systemIntent.data
                  .listSelect.items

              const listItems = map(arr, (item: any) => {
                return webhookListSelectItems.create({
                  description: item.description,
                  image: webhookImageObj.create(item.image),
                  optionInfo: webhookOptionInfo.create(item.optionInfo),
                  title: item.title
                })
              })

              const list = webhookListSelect.create({
                items: listItems,
                title:
                  response.webhookPayload.google.systemIntent.data
                    .listSelect.title
              })

              const fulfillment = Fulfillment.create({
                webhookListSelect: list
              })
              self.pushHistory(fulfillment)
            }
          }

          // webhook suggestions
          if (
            response.webhookPayload &&
            response.webhookPayload.google &&
            response.webhookPayload.google.richResponse
              .suggestions
          ) {
            const suggestions =
              response.webhookPayload.google.richResponse
                .suggestions
            const fulfillment = Fulfillment.create({
              message: '',
              messages: [],
              platform: 'GOOGLE',
              speech: '',
              suggestions: {
                suggestions
              }
            })
            const isRichResponse = Fulfillment.is(fulfillment)
            log('isRichResponse suggestions?', isRichResponse, fulfillment)
            if (isRichResponse) {
              self.pushHistory(fulfillment)
            }
          }

          res = self.history.length

        }
      }
      return res

    },
    setFingerPrint(fingerPrint: string) {
      self.fingerprint = fingerPrint
    },
    setLang: flow(function* () {
      const response = yield getLang()
      log("getLang: ", response)
      self.languageCode = (response) ? response : "undefined"
    }),
    clearWebView() {
      self.webViewTarget = undefined
      self.webViewUrl = undefined
    },
    removeQuickReplies() {
      return self.history.forEach(e => {
        if (e.type === 'quick_replies' && e.suggestions) {
          e.suggestions.clearQuickReplies()
        }
      })
    }

  }))
  .actions(self => {
    let client: ApiAiClient
    return {
      removeQuickMessage() {
        const count = size(self.history)
        if (count > 0) {
          const lastFulfillment = self.history.slice(-1)[0]
          if (
            lastFulfillment.type === 'quick_replies' &&
            lastFulfillment.suggestions
          ) {
            lastFulfillment.suggestions.clearQuickReplies()
          }
        }
      },
      removeMessage() {
        return self.history.forEach((e, i) => {
          if (e.speech === 'loading') {
            self.history.splice(i, 1)
          }
        })
      },
      setClient(value: ApiAiClient) {
        client = value
        self.session.sessionId = value.getSessionId()
      },

      shipEvent: flow(function* (params: {
        eventName: string
        eventData?: IStringMap | null
        context?: IContext | undefined
      }) {
        log('shipEvent triggered', params.eventName,
          { context: params.context })
        // DEBUG ONLY
        // NOTE: default type is "intent" meaning send message to server
        // const response: any = [{
        //   simpleResponses: {
        //     simpleResponses: [{
        //       displayText: 'welcome',
        //       ssml: 'welcome',
        //       textToSpeech: 'welcome'
        //     }]
        //   }
        // }]
        const response: any = yield client.eventRequest(
          params.eventName,
          //params.eventData || {},
          { context: params.context }
        )
        log('shipEvent server response', response.fulfillmentMessages)

        return self.applyMessage(response)
      }),
      shipMessage: flow(function* (params: {
        isUserMessage?: boolean
        isSilent?: boolean
        message: string
        target?: string
        type?: string
        url?: string
        context?: IContext | undefined
      }) {

        self.clearTTS()
        if (params.type) {
          if (params.type === 'intent') {
            if (params.isUserMessage) {
              self.pushHistory(
                Fulfillment.create({
                  platform: 'MonRepondeurAutoUser',

                  messages: [
                    {
                      speech: params.message,
                      type: -1
                    }
                  ],
                  message: params.message,
                  speech: params.message
                })
              )

              self.pushHistory(
                Fulfillment.create({
                  platform: 'MonRepondeurAutoUser',

                  messages: [
                    {
                      speech: 'loading',
                      type: -1
                    }
                  ],
                  message: '',
                  speech: 'loading'
                })
              )
            }
          }
          if (params.type === 'livechat') {
            self.pushHistory(
              Fulfillment.create({
                platform: 'MonRepondeurAutoLiveChat',

                messages: [
                  {
                    speech: params.message,
                    type: -1
                  }
                ],
                message: params.message,
                speech: params.message
              })
            )
            return
          }
          if (params.type === 'web_url') {
            if (params.target) {
              self.webViewTarget = params.target === '' ? 'self' : params.target
            }
            if (params.url) {
              self.webViewUrl = params.url
            }
            return
          }
        }
        //self.removeQuickReplies();
        return new Promise(resolve => {
          delay(async () => {
            // DEBUG ONLY
            // NOTE: default type is "intent" meaning send message to server
            //   const response: any = [{
            //     queryResult: {
            //       fulfillmentMessages: [{
            //       basicCard: {
            //         formattedText: 'basic card',
            //         image: {
            //           accessibilityText: 'alt text',
            //           imageUri: ''
            //         },
            //         subtitle: 'subtitle',
            //         title: 'title'
            //       },
            //       message: 'hiya basic card',
            //       platform: 'ACTIONS_ON_GOOGLE'
            //     }]
            //   },
            //   responseId:  '123',
            // }]
            const response: any = await client.textRequest(params.message, {
              context: params.context
            })
            log('shipMessage server response', response)

            self.applyMessage(response)
            resolve()
          }, random(50, 350))
        })

      })
    }
  })

export type IRootStore = typeof RootStore.Type



