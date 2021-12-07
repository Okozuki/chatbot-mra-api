import { Message, MessageGroup, MessageList } from '@livechat/ui-kit'
import { map } from 'lodash'
import { inject, observer, Observer } from 'mobx-react'
import * as React from 'react'
// @ts-ignore
import StayScrolled from 'react-stay-scrolled'
import getUniqueKey from 'uuid/v1'
import {
  BrowseGalleryMessage,
  CardMessage,
  GalleryMessage,
  // MediaMessage,
  LinkOut,
  ListMessage,
  QuickRepliesComponent,
  TextMessage,
  TypingAnimation
} from '../../components/Messages'
import { IRootStore } from '../../store'
import { IFulfillment } from '../../store/messages'
import { theme } from '../../styles/theme'

import Logger from '../../util/logger'

const log = Logger('Chatroom').log

interface IChatroomProps {
  store: IRootStore
  scrollDown: any
  isMessage: boolean
  setIsLoading: any
}

@inject('store')
@observer
export class Chatroom extends React.Component<IChatroomProps, {}> {
  private chatRoom: any

  constructor(props: IChatroomProps) {
    super(props)

    this.renderMessageGroup = this.renderMessageGroup.bind(this)
    this.renderMessage = this.renderMessage.bind(this)
    this.chatRoom = React.createRef()
    this.scrollMessage = this.scrollMessage.bind(this)
    window.addEventListener('message', this.receive.bind(this), { passive: false })
  }

  public async receive(evt: any) {
    const { store } = this.props
    const {
      store: { shipEvent }
    } = this.props

    if (evt.data && evt.data.eventName) {
      const eventData = evt.data.eventData
      const eventName = evt.data.eventName
      store.clearWebView()
      store.session.enableTextAndChat()
      await shipEvent({
        eventData,
        eventName
      })
    }
  }

  public scrollMessage() {
    setTimeout(() => this.props.scrollDown(this.chatRoom), 200)
  }

  public render() {
    this.props.scrollDown(this.chatRoom)
    const {
      store: { history }
    } = this.props

    return (
      <Observer key={getUniqueKey()}>
        {() => (
          <MessageList
            ref={this.chatRoom}
            active={true}
            containScrollInSubtree={true}
          >

            {/*
              if there is no element in history, show loading indicator.
              E.g. when user clicks on the greeter before the dialogflow fulfilment is completed
              */}
            {history.length === 0 &&
              this.renderMessageGroup(
                { speech: 'loading' } as IFulfillment,
                0
              )}
            {map(history, this.renderMessageGroup)}

          </MessageList>


        )}
      </Observer>
    )
  }

  private renderMessageGroup(fulfillment: IFulfillment, index: number) {
    const isOwned = fulfillment.isUserMessage
    const type = fulfillment.type
    const {
      store: { session, history },
      setIsLoading
    } = this.props

    const avatar = session.bot ? session.bot.theme.images.avatar : undefined

    //log('fulfillment', fulfillment, history.length, history, fulfillment.speech)

    if (fulfillment.speech === 'loading') {
      setIsLoading(true)
    }

    return (
      <Observer key={getUniqueKey()}>
        {() => (
          <div className="monrepondeurauto--message-group">
            <MessageGroup
              avatar={
                isOwned ||
                  ((fulfillment.speech !== '' &&
                    fulfillment.speech === 'loading') ||
                    fulfillment.type === 'quick_replies') ||
                  fulfillment.type === 'link_out' ||
                  fulfillment.type === 'aog_linkout'
                  ? null
                  : avatar
              }
              key={`message-group-${type}-${index}-${getUniqueKey()}`}
              onlyFirstWithMeta={true}
            >
              {fulfillment.speech === 'loading'
                ? this.renderTypingAnimation(avatar, type, index)
                : this.renderMessage(fulfillment)}
            </MessageGroup>
          </div>
        )}
      </Observer>
    )
  }

  private renderTypingAnimation = (
    avatar: string | undefined,
    type: string,
    index: number
  ) => {
    // set is loading prop that sets state on Maximized.tsx
    // disables users from sending messages while the animation is playing
    const { setIsLoading } = this.props
    setIsLoading(true)

    return (
      <TypingAnimation
        avatar={avatar}
        key={`loading-${type}-${index}-${getUniqueKey()}`}
      />
    )
  }

  private renderMessage(fulfillment: IFulfillment) {
    //log('renderMessage: ', fulfillment);

    // set isloading back to false in Maximized
    // so users can send a message
    const { setIsLoading } = this.props
    setIsLoading(false) // TODO do not use setState during render

    if (fulfillment.isCustomMessage) {
      const type = fulfillment.type
      const key = `custom-${getUniqueKey()}-${type}`

      switch (type) {
        case 'quick_replies':
          const suggestions = fulfillment.suggestions
          const simpleResponses = fulfillment.simpleResponses
          if (suggestions) {
            return (
              <div
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  textAlign: 'center'
                }}
              >
                <QuickRepliesComponent
                  key={`quick-replies-${key}`}
                  simpleResponses={simpleResponses}
                  suggestions={suggestions}
                  store={this.props.store}
                />
              </div>
            )
          }
          break

        case 'card':
          if (fulfillment.basicCard) {
            return (
              <CardMessage
                basicCard={fulfillment.basicCard}
                key={`card-${key}`}
                scrollMessage={this.scrollMessage}
                store={this.props.store}
                type={type}
              />
            )
          }
          break

        case 'gallery':
          const gallery = fulfillment.carouselSelect
          if (gallery) {
            return (
              <GalleryMessage
                gallery={gallery}
                store={this.props.store}
                scrollMessage={this.scrollMessage}
                type={type}
              />
            )
          }
          break

        case 'google_webhook_carousel':
          const webhookCarousel = fulfillment.webhookCarouselSelect
          if (webhookCarousel) {
            return (
              <GalleryMessage
                webhookGallery={webhookCarousel}
                store={this.props.store}
                scrollMessage={this.scrollMessage}
                type={type}
              />
            )
          }
          break

        case 'browse_crousel':
          const browseGallery = fulfillment.carouselBrowse
          if (browseGallery) {
            return (
              <BrowseGalleryMessage
                gallery={browseGallery}
                store={this.props.store}
                scrollMessage={this.scrollMessage}
                type={type}
              />
            )
          }
          break

        case 'google_webhook_simple_response':
          const textObj = fulfillment.simpleResponse
          if (textObj) {
            const textToSpeech = textObj.textToSpeech
            if (textToSpeech && textToSpeech !== ' ') {
              return (
                <div className="monrepondeurauto--bot-text-message">
                  <Message
                    isOwn={false}
                    key={`message-${key}`}
                    style={{ ...theme.messages.botWrapper }}
                  >
                    <TextMessage
                      key={`text-${key}`}
                      message={textToSpeech}
                      style={{ ...theme.messages.bot }}
                    />
                  </Message>
                </div>
              )
            }
          }
          break



        case 'single_default':
          const sd = fulfillment.SingleDefault
          if (sd && sd.text[0] /*&& sd.text.text*/) {
            //const message = sd.text.text[0]
            const sdMessages = sd.text;
            //if (messages) {
            const messages = sdMessages.map((msg) => (
              <div className="monrepondeurauto--bot-text-message">
                <Message
                  isOwn={false}
                  key={`message-custom-${getUniqueKey()}-${type}`} // unique Key
                  style={{ ...theme.messages.botWrapper }}
                >
                  <TextMessage
                    key={`text-custom-${getUniqueKey()}-${type}`}  // unique Key
                    message={msg.text.text[0]}
                    style={{ ...theme.messages.bot }}
                  />
                </Message>
              </div>
            ))
            return (
              messages
            )
            //}
          }
          break

        case 'text':
        default:
          const text: string | null = fulfillment.displayText
          if (text && text !== ' ') {
            return (
              <div className="monrepondeurauto--bot-text-message">
                <Message
                  isOwn={false}
                  key={`message-${key}`}
                  style={{ ...theme.messages.botWrapper }}
                >
                  <TextMessage
                    key={`text-${key}`}
                    message={text}
                    style={{ ...theme.messages.bot }}
                  />
                </Message>
              </div>
            )
          }
          break

        case 'link_out':
          const linkOut = fulfillment.linkOutSuggestion
          if (linkOut) {
            return (
              <div
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  textAlign: 'center'
                }}
              >
                <LinkOut store={this.props.store} linkOutSuggestion={linkOut} />
              </div>
            )
          }
          break

        case 'aog_linkout':
          const aogLinkOut = fulfillment.aogLinkOut
          if (aogLinkOut) {
            return (
              <div
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  textAlign: 'center'
                }}
              >
                <LinkOut store={this.props.store} aogLinkOut={aogLinkOut} />
              </div>
            )
          }

        case 'list':
          const list = fulfillment.listSelect
          if (list) {
            return (
              <ListMessage
                store={this.props.store}
                scrollMessage={this.scrollMessage}
                list={list}
              />
            )
          }
          break

        case 'google_webhook_list':
          const googleList = fulfillment.webhookListSelect
          if (googleList) {
            return (
              <ListMessage
                store={this.props.store}
                scrollMessage={this.scrollMessage}
                webhookList={googleList}
              />
            )
          }
      }
    } else if (fulfillment.isUserMessage) {
      const key = `user-message-${getUniqueKey()}`
      return (
        <div className="monrepondeurauto--user-text-message">
          <Message
            isOwn={true}
            key={`user-message-${key}`}
            style={{ ...theme.messages.userWrapper }}
          >
            <TextMessage
              key={`text-${key}`}
              message={fulfillment.message}
              style={{ ...theme.messages.user }}
            />
          </Message>
        </div>
      )
    }
    return null
  }
}



