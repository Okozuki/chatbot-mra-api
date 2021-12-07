import { MessageButton, MessageButtons } from '@livechat/ui-kit'
import { debounce, map } from 'lodash'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import getUniqueKey from 'uuid/v1'
import { MediaMessage } from '.'
import { IRootStore } from '../../store'
import {
  IBasicCard,
  IButton,
  ICarouselCard,
  IWebhookCarouselItem
} from '../../store/messages'

import Logger from '../../util/logger'
const log = Logger('Card Message').log

interface IBotProps {
  store: IRootStore
}

interface ICardMessageProps extends IBotProps {
  basicCard?: IBasicCard
  carouselCard?: ICarouselCard
  webhookCarouselCard?: IWebhookCarouselItem
  scrollMessage: any
  type: any
}

@inject('store')
@observer
export class CardMessage extends React.Component<ICardMessageProps, {}> {
  constructor(props: ICardMessageProps) {
    super(props)
    this.onButtonClick = debounce(this.onButtonClick.bind(this), 250)
  }

  public render() {
    const { type, basicCard, carouselCard, webhookCarouselCard } = this.props
    if (type === 'card' && basicCard) {
      const imageUrl = basicCard.image
        ? basicCard.image.imageUri || basicCard.image.url
        : ''

      log('imageUrl', imageUrl)
      const title = basicCard.title
      const subtitle = basicCard.getSubtitle
      const formattedText = basicCard.getFormattedText
      const buttonsArray = basicCard.getButtons
      const text = basicCard.text
      const key = `${getUniqueKey()}`
      return (
        <div className="monrepondeurauto--card" key={`card-${key}}`}>
          {imageUrl !== '' ? (
            <div className="monrepondeurauto--gallery-image">
              <MediaMessage
                card={basicCard}
                key={`media-${key}`}
                type={this.props.type}
                scrollMessage={this.props.scrollMessage}
              />
            </div>
          ) : null}
          {title !== '' ? (
            <div className="monrepondeurauto--card-title">{title}</div>
          ) : null}
          {subtitle !== '' ? (
            <div className="monrepondeurauto--card-subtitle">{subtitle}</div>
          ) : null}
          {formattedText !== '' ? (
            <div className="monrepondeurauto--card-formattedText">{formattedText}</div>
          ) : text && text !== '' ? (
            <div className="monrepondeurauto--card-text">{text}</div>
          ) : null}

          <MessageButtons>
            {buttonsArray &&
              map(buttonsArray, (buttonData: any, buttonIndex: any) => {
                return (
                  <MessageButton
                    className="monrepondeurauto--card-button"
                    key={`messageButton-${getUniqueKey()}-${buttonIndex}`}
                    label={buttonData.title}
                    aria-label={buttonData.title}
                    onClick={() => {
                      // tslint:disable-next-line jsx-no-lambda
                      this.onButtonClick(buttonData, buttonIndex)
                    }}
                    primary={buttonIndex === 0}
                  />
                )
              })}
          </MessageButtons>
        </div>
      )
    } else if (type === 'gallery' && carouselCard) {
      // if rendering carousel cards
      const imageUrl = carouselCard.getImageUri
      const title = carouselCard.getTitle
      const description = carouselCard.getDescription
      const key = `${getUniqueKey()}`

      return (
        <div className="monrepondeurauto--card" key={`card-${key}}`}>
          {imageUrl !== '' ? (
            <div className="monrepondeurauto--gallery-image">
              <MediaMessage
                card={carouselCard}
                key={`media-${key}`}
                type={this.props.type}
                scrollMessage={this.props.scrollMessage}
              />
            </div>
          ) : null}
          {title !== '' ? (
            <div className="monrepondeurauto--card-title" style={{}}>
              {title}
            </div>
          ) : null}
          {description !== '' ? (
            <div className="monrepondeurauto--card-formattedText" style={{}}>
              {description}
            </div>
          ) : null}
        </div>
      )
    } else if (type === 'google_webhook_carousel' && webhookCarouselCard) {
      // actions-on-google fulfillment payload
      const card = webhookCarouselCard
      const title = card.title
      const description = card.description
      const key = `${getUniqueKey()}`

      let imageUrl
      if (card.image) {
        imageUrl = card.image.url
      }

      return (
        <div className="monrepondeurauto--card" key={`card-${key}}`}>
          {imageUrl !== '' ? (
            <div className="monrepondeurauto--gallery-image">
              <MediaMessage
                card={card}
                key={`media-${key}`}
                type={this.props.type}
                scrollMessage={this.props.scrollMessage}
              />
            </div>
          ) : null}
          {title !== '' ? (
            <div className="monrepondeurauto--card-title" style={{}}>
              {title}
            </div>
          ) : null}
          {description !== '' ? (
            <div className="monrepondeurauto--card-formattedText" style={{}}>
              {description}
            </div>
          ) : null}
        </div>
      )
    } else {
      return null
    }
  }

  private async onButtonClick(data: IButton, index: number) {
    const {
      basicCard,
      store: { shipMessage, removeMessage }
    } = this.props

    if (basicCard) {
      basicCard.clearCardReplies()
    }
    await shipMessage({
      isUserMessage: true,
      message: data.title,
      target: data.target,
      type: data.type,
      url: data.openUriAction
        ? data.openUriAction.uri
        : data.openUrlAction
          ? data.openUrlAction.url
          : ''
    })
    await removeMessage()
  }
}



