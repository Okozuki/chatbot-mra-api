// import Arrow_Left from '@material-ui/icons/ArrowLeft'
// import Arrow_Right from '@material-ui/icons/ArrowRight'
import { map } from 'lodash'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import Slider from 'react-slick'
import getUniqueKey from 'uuid/v1'
import { CardMessage } from '../../components/Messages'
import { IRootStore } from '../../store'
import {
  ICarouselAndListWrapper,
  IWebhookCarouselSelect
} from '../../store/messages'

import Logger from '../../util/logger'
const log = Logger('GalleryMessage.tsx').log

const settings = {
  dots: false,
  infinite: false,
  slidesToScroll: 1,
  slidesToShow: 1,
  speed: 500
}

interface IGalleryMessageProps {
  gallery?: ICarouselAndListWrapper
  webhookGallery?: IWebhookCarouselSelect
  store: IRootStore
  scrollMessage: any
  type: any
}

@inject('store')
@observer
export class GalleryMessage extends React.Component<IGalleryMessageProps, {}> {
  constructor(props: IGalleryMessageProps) {
    super(props)
  }

  public async onSelect(element: any, message: string, key: string) {
    const {
      store: { shipMessage, removeMessage }
    } = this.props
    await shipMessage({ isUserMessage: true, message, type: 'intent' })
    await removeMessage()
  }

  public render() {
    let gallery
    if (this.props.gallery) {
      gallery = this.props.gallery.items
    } else if (this.props.webhookGallery) {
      gallery = this.props.webhookGallery.items
    }
    return (
      <div className="monrepondeurauto--gallery" key={`gallery-${getUniqueKey()}`}>
        <div className="monrepondeurauto--gallery-container">
          <Slider {...settings}>
            {map(gallery, (card: any, i: any) => {
              const key = `item-${getUniqueKey()}-${i}`
              if (card) {
                return (
                  <div key={key}>
                    <div
                      className="monrepondeurauto--gallery-item"
                      // tslint:disable
                      // @ts-ignore
                      onClick={(event, key: any) => {
                        if (this.props.webhookGallery) {
                          log(event, card.title, key)
                          this.onSelect(card, card.optionInfo.key, key)
                        } else if (this.props.gallery) {
                          if (this.props.gallery.items) {
                            log(event, card.title, key)
                            this.onSelect(card, card.info.key, key)
                          }
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    // tslint:enable
                    >
                      {this.props.webhookGallery ? (
                        <CardMessage webhookCarouselCard={card} {...this.props} />
                      ) : (
                          <CardMessage carouselCard={card} {...this.props} />
                        )}
                      {/* New Gallery arrows */}
                      {/* <div className="left-arrow">
                        <Arrow_Left />
                      </div>
                      <div className="right-arrow">
                        <Arrow_Right />
                      </div> */}
                    </div>
                  </div>
                )
              }

            })}
          </Slider>
        </div>
      </div>
    )
  }
}



