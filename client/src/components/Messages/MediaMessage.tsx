import { MessageMedia } from '@livechat/ui-kit'
import { includes } from 'lodash'
import * as React from 'react'

import { theme } from '../../styles/theme'

interface ITextMessage {
  scrollMessage: any
  type: any
  card: any
}

export class MediaMessage extends React.Component<ITextMessage, {}> {
  public render() {
    const imageUrl =
      this.props.type === 'card' ||
        'gallery' ||
        'browse_crousel' ||
        'google_webhook_carousel'
        ? this.props.type === 'browse_crousel' ||
          this.props.type === 'google_webhook_carousel'
          ? this.props.card.image.url
          : this.props.card.image.imageUri || this.props.card.image.url
        : ''
    const isAudio = imageUrl
      ? includes(imageUrl, '.mp3') ||
      includes(imageUrl, '.aac') ||
      includes(imageUrl, '.wav')
      : false
    const isVideo = imageUrl
      ? includes(imageUrl, '.mp4') ||
      includes(imageUrl, '.ogg') ||
      includes(imageUrl, '.webm')
      : false
    return (
      <React.Fragment>
        {isVideo ? (
          <div className="monrepondeurauto--video">
            <video
              controls={true}
              muted={false}
              src={imageUrl}
              width="100%"
              height="100%"
              onLoad={this.props.scrollMessage}
            >
              Sorry, your browser doesn't support embedded <code>video</code>{' '}
              files.
            </video>
          </div>
        ) : isAudio ? (
          <div className="monrepondeurauto--video">
            <audio
              controls={true}
              src={imageUrl}
              onLoad={this.props.scrollMessage}
            >
              Sorry, your browser doesn't support embedded <code>audio</code>{' '}
              files.
            </audio>
          </div>
        ) : (
              <MessageMedia>
                <img
                  className="monrepondeurauto--mediaImg"
                  src={imageUrl}
                  style={{ ...theme.messages.mediaImg }}
                  onLoad={this.props.scrollMessage}
                  onError={this.props.scrollMessage}
                />
              </MessageMedia>
            )}
      </React.Fragment>
    )
  }
}



