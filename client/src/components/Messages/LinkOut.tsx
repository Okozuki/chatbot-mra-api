import OpenInNew from '@material-ui/icons/OpenInNewRounded'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import getUniqueKey from 'uuid/v1'
import { IRootStore } from '../../store'
import { IaogLinkOut, ILinkOutSuggestionObj } from '../../store/messages'

interface IBotProps {
  store: IRootStore
}

interface ILinkOutProps extends IBotProps {
  linkOutSuggestion?: ILinkOutSuggestionObj
  aogLinkOut?: IaogLinkOut
}

@inject('store')
@observer
export class LinkOut extends React.Component<ILinkOutProps, {}> {
  constructor(props: ILinkOutProps) {
    super(props)
  }

  public render() {
    if (this.props.linkOutSuggestion) {
      const linkOut: any = []
      const title = this.props.linkOutSuggestion.destinationName
      if (title) {
        linkOut.push(title)
      }

      return (
        <React.Fragment key={getUniqueKey()}>
          <div
            // tslint:disable-next-line jsx-no-lambda
            onClick={() => {
              this.handleLinkOut()
            }}
            data-reply={title}
            aria-label={title}
            style={{ display: 'inline-block' }}
          >
            <div
              className="monrepondeurauto--bot-quickreplies"
              style={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <OpenInNew style={{ marginRight: '5px' }} />
              {title}
            </div>
          </div>
        </React.Fragment>
      )
    }
    if (this.props.aogLinkOut) {
      const linkOut: any = []
      const title = this.props.aogLinkOut.destinationName
      if (title) {
        linkOut.push(title)
      }

      return (
        <React.Fragment key={getUniqueKey()}>
          <div
            // tslint:disable-next-line jsx-no-lambda
            onClick={() => {
              this.handleLinkOut()
            }}
            data-reply={title}
            aria-label={title}
            style={{ display: 'inline-block' }}
          >
            <div
              className="monrepondeurauto--bot-quickreplies"
              style={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <OpenInNew style={{ marginRight: '5px' }} />
              {title}
            </div>
          </div>
        </React.Fragment>
      )
    } else {
      return
    }
  }

  private handleLinkOut = () => {
    if (this.props.linkOutSuggestion) {
      const uri = this.props.linkOutSuggestion.uri
      window.open(uri, '_blank')
    }

    if (this.props.aogLinkOut) {
      const { url } = this.props.aogLinkOut
      window.open(url, '_blank')
    }
  }
}



