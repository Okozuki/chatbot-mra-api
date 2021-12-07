import { types } from 'mobx-state-tree'

export const BotCSS = types
  .model({
    chatBackground: types.optional(types.string, '#fff'),
    cuiMode: types.optional(types.boolean, false),
    dimensionsWindowHeight: types.optional(types.string, '1'),
    dimensionsWindowHeightRaw: types.optional(types.number, 1),
    fontType: types.optional(types.string, 'Open Sans'),
    greeterBackground: types.optional(types.string, '#427ee1'),
    greeterBorder: types.optional(types.string, '#427ee1'),
    greeterFontColor: types.optional(types.string, '#427ee1'),
    greeterHoverFillColor: types.optional(types.string, '#306aca'),
    greeterHoverFontColor: types.optional(types.string, '#f2f2f2'),
    greeterPromptBackground: types.optional(types.string, '#f2f2f2'),
    hoverFillColor: types.optional(types.string, '#306aca'),
    hoverFontColor: types.optional(types.string, '#f2f2f2'),
    primaryColor: types.optional(types.string, '#427ee1'),
    secondaryColor: types.optional(types.string, '#f2f2f2'),
    showMenu: types.optional(types.boolean, true),
    showPoweredByMonRepondeurAuto: types.optional(types.boolean, true),
    showPrompts: types.optional(types.boolean, true),
    typingAnimationDots: types.optional(types.string, '#427ee1'),
    typingAnimationFill: types.optional(types.string, '#f2f2f2'),
    userBoxColor: types.optional(types.string, '#fff'),
    userResponseColor: types.optional(types.string, '#427ee1'),
    widgetShape: types.optional(types.string, '50%')
  })
  .actions(self => ({
    turnOffPrompts() {
      self.showPrompts = false
    }
  }))

export type IBotCSS = typeof BotCSS.Type

export const BotImages = types.model({
  avatar: types.optional(
    types.string,
    `${process.env.PUBLIC_URL}/assets/logo/120x120.png`
  ),
  logo: types.optional(
    types.string,
    `${process.env.PUBLIC_URL}/assets/images/logo.png`
  )
})

export const BotTheme = types.model({
  css: types.optional(BotCSS, {}),
  images: types.optional(BotImages, {})
})

export const BotPrompt = types.model({
  command: types.string,
  type: types.string,
  url: types.string
})

export type IBotPrompt = typeof BotPrompt.Type

export const BotIntegrations = types.model({
  chatbaseApiKey: types.maybe(types.string),
  dashbotApiKey: types.maybe(types.string),
  janisApiKey: types.maybe(types.string),
  janisClientKey: types.maybe(types.string),
  ttsApiKey: types.maybe(types.string),
  ttsGender: types.maybe(types.string)
})

export const Bot = types
  .model({
    _id: types.identifier,
    accessToken: types.optional(types.string, ''),
    active: types.boolean,
    createdAt: types.optional(types.string, ''),
    integrations: types.optional(BotIntegrations, {}),
    name: types.optional(types.string, ''),
    organization: types.optional(types.string, ''),
    prompts: types.optional(types.array(BotPrompt), []),
    refKeyName: types.optional(types.string, 'ref'),
    theme: types.optional(BotTheme, {})
  })
  .actions(self => ({
    setShowPrompts(showPrompts: boolean) {
      self.theme.css.showPrompts = showPrompts
    }
  }))

export type IBot = typeof Bot.Type



// WEBPACK FOOTER //
// ./src/store/bot.ts