import { merge } from 'lodash'
import { applyPatch, flow, types } from 'mobx-state-tree'
import { getBot, postSessionBot } from '../api'
import { axiosInstanceConfig } from '../util/axios'
import { Bot } from './bot'

import Logger from '../util/logger'

const log = Logger('Session').log

export const Session = types
  .model({
    bot: types.maybe(Bot),
    sessionId: types.maybe(types.string),
    textBarEnabled: types.optional(types.boolean, true),
    token: types.maybe(types.string),
    tts: types.optional(types.boolean, false)
  })
  .actions(self => ({
    fetchBotById: flow(function* (botId: string) {
      const response = yield getBot(botId)
      const isBot = Bot.is(response)
      log('fetchBotById', botId, isBot, response)
      if (isBot) {
        return applyPatch(self, {
          op: 'replace',
          path: '/bot',
          value: response
        })
      }
      throw new Error('Unable to parse bot')
    }),
    enableTextAndChat() {
      self.textBarEnabled = true
    },
    enableTTS() {
      self.tts = true
    },
    disableTTS() {
      self.tts = false
    },
    setToken(token: string) {
      self.token = token
      merge(axiosInstanceConfig, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      log('set JWT to axios.defaults.headers.common.authorization', token)
    },
    setSessionId(sessionId: string) {
      self.sessionId = sessionId
      log('set Session.sessionId', sessionId)
    }
  }))
  .actions(self => ({
    login: flow(function* (botId: string, fingerprint: string) {
      const response = yield postSessionBot(botId, { fingerprint })
      log('postSessionBot:', response)
      if (response) {
        const { token, sessionId } = response

        if (token) {
          self.setToken(token)
          log('token', token)
        }
        if (sessionId) {
          self.setSessionId(sessionId)
          log('sessionId', sessionId)
        }
      }
    })
  }))



