import { get, map } from 'lodash'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import Slider from 'react-slick'
import getUniqueKey from 'uuid/v1'

import { MediaMessage } from '.'
import { IRootStore } from '../../store'
import { IBrowseCarouselAndListWrapper } from '../../store/messages'



const settings = {
  dots: false,
  infinite: false,
  slidesToScroll: 1,
  slidesToShow: 1,
  speed: 500
}

interface IBrowseGalleryMessageProps {
  gallery: IBrowseCarouselAndListWrapper
  store: IRootStore
  scrollMessage: any
  type: any
}

@inject('store')
@observer
export class BrowseGalleryMessage extends React.Component<
IBrowseGalleryMessageProps,
{}
> {
  constructor(props: IBrowseGalleryMessageProps) {
    super(props)
  }

  public async onSelect(data: any, key: string) {
    const {
      store: { shipMessage, removeMessage }
    } = this.props

    // allows for customization in browse carousels
    // if carousel item has a nt=t query in the URL, don't open in webview
    if (
      data.openUrlAction.url.includes('?nt=t') ||
      data.openUrlAction.url.includes('&nt=t')
    ) {
      window.open(data.openUrlAction.url, '_blank')
    } else {
      await shipMessage({
        isUserMessage: true,
        message: data.title,
        target: data.target ? data.target : '_blank',
        type: 'web_url',
        url: data.openUrlAction.url
      })
    }

    await removeMessage()
  }

  public render() {
    const gallery = this.props.gallery.items
    return (
      <div className="monrepondeurauto--gallery" key={`gallery-${getUniqueKey()}`}>
        <div className="monrepondeurauto--gallery-container">
          <Slider {...settings}>
            {map(gallery, (card: any, i: any) => {
              // tslint:disable
              // @ts-ignore
              const key = `item-${getUniqueKey()}-${i}`
              return (
                <div key={key}>
                  <div
                    className="monrepondeurauto--gallery-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      this.onSelect(card, key)
                    }}
                  >
                    <div className="monrepondeurauto--card" key={`card-${key}}`}>
                      {get(card.image, 'url', '') !== '' ? (
                        <div className="monrepondeurauto--gallery-image">
                          <MediaMessage
                            card={card}
                            key={`media-${key}`}
                            type={this.props.type}
                            scrollMessage={this.props.scrollMessage}
                          />
                        </div>
                      ) : null}

                      {card.title !== '' ? (
                        <div className="monrepondeurauto--card-title">{card.title}</div>
                      ) : null}

                      {card.description !== '' ? (
                        <div className="monrepondeurauto--card-formattedText" style={{}}>
                          {card.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
              // tslint:enable
            })}
          </Slider>
        </div>
      </div>
    )
  }
}



