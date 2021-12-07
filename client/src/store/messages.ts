import { size } from 'lodash'
import { getSnapshot, types } from 'mobx-state-tree'
import Logger from '../util/logger'

const log = Logger('Messages').log

// import Logger from '../util/logger'
// const log = Logger('Store/Messages').log

// https://dialogflow.com/docs/reference/message-objects
// const MessageTypes = {
//   0: 'text',
//   4: 'card'
// }

export const CustomButton = types.model({
  target: types.optional(types.string, 'default'),
  title: types.optional(types.string, ''),
  type: types.optional(types.string, 'intent'), // enum: intent, web_url
  url: types.maybe(types.string)
})
export type ICustomButton = typeof CustomButton.Type

export const CustomQuickReply = types.model({
  title: types.optional(types.string, '')
})
export type ICustomQuickReply = typeof CustomQuickReply.Type

export const CustomImageUrl = types.model({
  url: types.maybe(types.string)
})
export type ICustomImageUrl = typeof CustomImageUrl.Type

export const CustomElement = types
  .model({
    buttons: types.optional(types.array(CustomButton), []),
    image_url: types.maybe(types.string),
    quick_replies: types.optional(types.array(CustomQuickReply), []),
    subtitle: types.maybe(types.string),
    text: types.maybe(types.string),
    title: types.maybe(types.string)
  })
  .actions(self => ({
    clearQuickReplies() {
      self.quick_replies.splice(0, self.quick_replies.length)
    }
  }))

export type ICustomElementReply = typeof CustomElement.Type

export const CustomElements = types.model({
  elements: types.optional(types.array(CustomElement), []),
  text: types.maybe(types.string),
  url: types.maybe(types.string)
})

export const CustomAttachment = types
  .model({
    payload: types.optional(CustomElements, {}),
    type: types.optional(types.string, 'card')
  })
  .views(self => ({
    get imageUrl() {
      const elements = self.payload.elements
      if (self.payload.url) {
        return self.payload.url
      } else if (size(elements) > 0) {
        if (self.payload.elements[0].image_url) {
          return self.payload.elements[0].image_url
        }
      }
      return ''
    }
  }))
export type ICustomAttachment = typeof CustomAttachment.Type

export const CustomMessage = types.model({
  attachment: types.optional(CustomAttachment, {})
})

export const CustomPayload = types
  .model({
    messages: types.optional(types.array(CustomMessage), [])
  })
  .actions(self => ({
    clearCardReplies() {
      self.messages.splice(1, self.messages.length)
    }
  }))

export type ICustomPayload = typeof CustomPayload.Type

export const Message = types
  .model({
    payload: types.optional(CustomPayload, {}),
    speech: types.optional(types.string, ''),
    text: types.optional(types.string, ''),
    type: types.optional(types.number, 4)
  })
  .views(self => ({
    get isCustomMessage() {
      return self.type === 4
    },
    get isTextMessage() {
      return self.type === 0
    },
    get isUserMessage() {
      return self.type === -1
    }
  }))

export type IMessage = typeof Message.Type

//  NEW V2 PAYLOADS

// Simple Text Response

export const SimpleResponse = types.model({
  displayText: types.optional(types.string, ''),
  ssml: types.optional(types.string, ''),
  textToSpeech: types.optional(types.string, '')
})

export type ISimpleResponse = typeof SimpleResponse.Type

export const SimpleResponseWrapper = types
  .model({
    simpleResponses: types.optional(types.array(SimpleResponse), [])
  })
  .views(self => ({
    get getSimpleResponses() {
      return self.simpleResponses || []
    }
  }))

export type ISimpleResponseWrapper = typeof SimpleResponseWrapper.Type

// TEXT WRAPPER V1

export const TextWrapper = types.model({
  text: types.optional(types.array(types.string), [])
})

export type ITextWrapper = typeof TextWrapper.Type

// Basic Card

export const ImageObj = types.model({
  accessibilityText: types.maybe(types.string),
  imageUri: types.maybe(types.string),
  url: types.maybe(types.string)
})

export const ImageBrowseObj = types.model({
  accessibilityText: types.string,
  url: types.string // For Browse carousel
})

export const ImageUriObj = types.model({
  url: types.string // For Browse carousel
})

export const ButtonUri = types.model({
  uri: types.string
})

export const ButtonUrl = types.model({
  url: types.string
})

export const Button = types.model({
  openUriAction: types.maybe(ButtonUri),
  openUrlAction: types.maybe(ButtonUrl),
  target: types.optional(types.string, ''),
  title: types.string,
  type: types.optional(types.string, 'web_url')
})

export type IButton = typeof Button.Type

export const BasicCard = types
  .model({
    buttons: types.maybe(types.array(Button)),
    description: types.maybe(types.string),
    formattedText: types.maybe(types.string),
    image: types.maybe(ImageObj),
    subtitle: types.maybe(types.string),
    text: types.maybe(types.string),
    title: types.string
  })
  .views(self => ({
    get getSubtitle() {
      return self.subtitle || self.description || ''
    },
    get getFormattedText() {
      return self.formattedText || ''
    },
    get getButtons() {
      return self.buttons || []
    }
  }))
  .actions(self => ({
    clearCardReplies() {
      // self.quick_replies.splice(0, self.quick_replies.length)
      log('clearCardReplies', getSnapshot(self))
    }
  }))
export type IBasicCard = typeof BasicCard.Type

// Quick Replies

export const Suggestion = types.model({
  title: types.string
})

export type ISuggestion = typeof Suggestion.Type

export const SuggestionArray = types
  .model({
    suggestions: types.optional(types.array(Suggestion), [])
  })
  .actions(self => ({
    clearQuickReplies() {
      self.suggestions.splice(0, self.suggestions.length)
    }
  }))

export type ISuggestionArray = typeof SuggestionArray.Type

// Carousel Cards

export const CarouselKey = types.model({
  key: types.string
})

export const CarouselCard = types
  .model({
    description: types.maybe(types.string),
    image: types.maybe(ImageObj),
    info: CarouselKey,
    title: types.maybe(types.string)
  })
  .views(self => ({
    get getImageUri() {
      return self.image!.imageUri || ''
    },
    get getTitle() {
      return self.title || ''
    },
    get getDescription() {
      return self.description || ''
    }
  }))

export type ICarouselCard = typeof CarouselCard.Type

export const CarouselAndListWrapper = types.model({
  items: types.optional(types.array(CarouselCard), []),
  title: types.maybe(types.string)
})

export type ICarouselAndListWrapper = typeof CarouselAndListWrapper.Type

// Browse Carousel Cards

export const BrowseCarouselKey = types.model({
  key: types.string
})

export const BrowseCarouselCard = types
  .model({
    description: types.maybe(types.string),
    footer: types.maybe(types.string),
    image: types.maybe(ImageBrowseObj),

    openUrlAction: types.maybe(ImageUriObj),
    title: types.maybe(types.string)
  })
  .views(self => ({
    get getImageUri2() {
      return self.image!.url || ''
    },
    get getTitle2() {
      return self.title || ''
    },
    get getDescription2() {
      return self.description || ''
    }
  }))

export type IBrowseCarouselCard = typeof BrowseCarouselCard.Type

export const BrowseCarouselAndListWrapper = types.model({
  items: types.optional(types.array(BrowseCarouselCard), [])
})

export type IBrowseCarouselAndListWrapper = typeof BrowseCarouselAndListWrapper.Type

// Link out suggestion

export const LinkOutSuggestionObj = types.model({
  destinationName: types.maybe(types.string),
  uri: types.maybe(types.string)
})

export type ILinkOutSuggestionObj = typeof LinkOutSuggestionObj.Type

export const webhookSimpleResponse = types.model({
  textToSpeech: types.maybe(types.string)
})

export const webhookImageObj = types.model({
  accessibilityText: types.maybe(types.string),
  url: types.maybe(types.string)
})

export const googleRichResponseItems = types.model({
  simpleResponse: types.maybe(webhookSimpleResponse)
})
// Lists

export const webhookOptionInfo = types.model({
  key: types.maybe(types.string),
  synonyms: types.maybe(types.array(types.string))
})

// WEBHOOK LIST USES SAME STRUCTURE
export const webhookCarouselSelectItems = types.model({
  description: types.maybe(types.string),
  image: types.maybe(webhookImageObj),
  optionInfo: types.maybe(webhookOptionInfo),
  title: types.maybe(types.string)
})

export type IWebhookCarouselItem = typeof webhookCarouselSelectItems.Type

export const webhookCarouselSelect = types.model({
  items: types.array(webhookCarouselSelectItems)
})

export type IWebhookCarouselSelect = typeof webhookCarouselSelect.Type

export const webhookListSelectItems = types.model({
  description: types.maybe(types.string),
  image: types.maybe(webhookImageObj),
  optionInfo: types.maybe(webhookOptionInfo),
  title: types.maybe(types.string)
})

export const webhookListSelect = types.model({
  items: types.array(webhookListSelectItems),
  title: types.maybe(types.string)
})

export type IWebhookListSelect = typeof webhookListSelect.Type

export const SingleDefaultTextWrapper = types.model({
  text: types.array(types.string)
})

export const SingleDefaultArrayWrapper = types.model({
  text: SingleDefaultTextWrapper
})

export const SingleDefault = types.model({
  platform: types.string,
  text: types.array(SingleDefaultArrayWrapper)
})

// export const SingleDefaultTextWrapper = types.model({
//   text: types.array(types.string)
// })

// export const SingleDefault = types.model({
//   platform: types.string,
//   text: SingleDefaultTextWrapper
// })

export type ISingleDefault = typeof SingleDefault.Type

export const aogLinkOut = types.model({
  destinationName: types.string,
  url: types.string
})

export type IaogLinkOut = typeof aogLinkOut.Type

export const Fulfillment = types
  .model({
    SingleDefault: types.maybe(SingleDefault),
    aogLinkOut: types.maybe(aogLinkOut),
    basicCard: types.maybe(BasicCard),
    carouselBrowse: types.maybe(BrowseCarouselAndListWrapper),
    carouselSelect: types.maybe(CarouselAndListWrapper),
    items: types.maybe(types.array(googleRichResponseItems)),
    linkOutSuggestion: types.maybe(LinkOutSuggestionObj), // need to make link out suggestion component
    listSelect: types.maybe(CarouselAndListWrapper),
    message: types.optional(types.string, ''),
    messages: types.optional(types.array(Message), []), // DELETE LATER v1
    platform: types.optional(types.string, ''),
    simpleResponse: types.maybe(webhookSimpleResponse),
    simpleResponses: types.maybe(SimpleResponseWrapper),
    speech: types.optional(types.string, 'v1'), // DELETE LATER v1
    suggestions: types.maybe(SuggestionArray),
    text: types.maybe(TextWrapper), // DELETE LATER V1
    webhookCarouselSelect: types.maybe(webhookCarouselSelect),
    webhookListSelect: types.maybe(webhookListSelect)
  })
  .views(self => ({
    get type(): string {
      if (self.basicCard) {
        return 'card'
      }

      if (self.carouselBrowse) {
        return 'browse_crousel'
      }

      if (self.suggestions) {
        return 'quick_replies'
      }

      if (self.carouselSelect) {
        return 'gallery'
      }

      if (self.simpleResponses) {
        return 'text'
      }

      if (self.linkOutSuggestion) {
        return 'link_out'
      }

      if (self.listSelect) {
        return 'list'
      }

      if (self.simpleResponse) {
        return 'google_webhook_simple_response'
      }

      if (self.webhookCarouselSelect) {
        return 'google_webhook_carousel'
      }

      if (self.webhookListSelect) {
        return 'google_webhook_list'
      }

      if (self.SingleDefault) {
        return 'single_default'
      }

      if (self.aogLinkOut) {
        return 'aog_linkout'
      }

      return 'unknown'
    }
  }))
  .views(self => ({
    get isCustomMessage() {
      return self.platform !== 'MonRepondeurAutoUser' && self.type !== 'user'
    },
    // Simple Text Response View
    get displayText(): string {
      return self.simpleResponses &&
        self.simpleResponses.simpleResponses.length > 0
        ? self.simpleResponses.simpleResponses[0].displayText
          ? self.simpleResponses.simpleResponses[0].displayText
          : self.simpleResponses.simpleResponses[0].textToSpeech
        : self.SingleDefault
          ? self.SingleDefault.text[0].text.text[0]
          //? self.SingleDefault.text.text[0]
          : self.message
    },
    get isUserMessage() {
      return self.platform === 'MonRepondeurAutoUser'
    },
    get cardButtons() {
      return self.basicCard ? self.basicCard.buttons : ''
    }
  }))

export type IFulfillment = typeof Fulfillment.Type

export const googleRichResponse = types.model({
  expectUserResponse: types.maybe(types.boolean),
  items: types.maybe(types.array(googleRichResponseItems)),
  linkOutSuggestion: types.maybe(aogLinkOut)
})

export const googleSystemIntentData = types.model({
  '@type': types.maybe(types.string),
  carouselSelect: types.maybe(webhookCarouselSelect),
  listSelect: types.maybe(webhookListSelect)
})

export const googleSystemIntent = types.model({
  data: types.maybe(googleSystemIntentData),
  intent: types.maybe(types.string)
})

export const googleWebhookPayload = types.model({
  expectUserResponse: types.maybe(types.boolean),
  richResponse: types.maybe(googleRichResponse),
  systemIntent: types.maybe(googleSystemIntent)
})

export const webhookPayload = types.model({
  google: types.maybe(googleWebhookPayload)
})

export const QueryResult = types.model({
  fulfillmentMessages: types.optional(types.array(Fulfillment), []),
  items: types.optional(types.array(Fulfillment), []), // Rich response
  webhookPayload: types.maybe(webhookPayload)
})

export type IQueryResult = typeof QueryResult.Type

export const Response = types.model({
  queryResult: QueryResult,
  responseId: types.string
  // webhookStatus
})

export type IResponse = typeof Response.Type

export const Result = types.model({
  responses: types.optional(types.array(Response), [])
})

export type IResult = typeof Result.Type



// WEBPACK FOOTER //
// ./src/store/messages.ts