import Arrow from '@material-ui/icons/KeyboardArrowRightRounded'
import { debounce } from 'lodash'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import {
  BrowserView

} from 'react-device-detect'
import { IRootStore } from '../../store'



interface IWebMessage {
  store?: IRootStore
}

@inject('store')
@observer
export class WebMessage extends React.Component<IWebMessage, {}> {
  constructor(props: IWebMessage) {
    super(props)
    this.minimize = debounce(this.minimize.bind(this), 250)
  }

  public render() {

    const hideBrowserTab =
      this.props.store && this.props.store.hideBrowserTab
        ? this.props.store.hideBrowserTab
        : false

    return (
      <React.Fragment>
        {
          !hideBrowserTab ? (
            this._renderIFrame()
          ) : (
              <BrowserView>{'This link will open in a new tab...'}</BrowserView>
            )}
      </React.Fragment>
    )
  }

  private _renderIFrame() {
    const hideBrowserTab =
      this.props.store && this.props.store.hideBrowserTab
        ? this.props.store.hideBrowserTab
        : false
    const webUrl =
      this.props.store && this.props.store.webViewUrl
        ? this.props.store.webViewUrl
        : 'https://www.monrepondeurauto.com/404'

    return (
      <div className="monrepondeurauto--bot-webview">
        {!hideBrowserTab ? (
          <div className="monrepondeurauto--bot-header">
            <div
              tabIndex={0}
              key="close"
              // className="monrepondeurauto--bot-header-close"
              onClick={this.minimize}
              onKeyPress={this.escListener}
              // tslint:disable
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  this.minimize!()
                }
              }}
            // tslint:enable
            >
              {/* <Close /> */}
              <div className="monrepondeurauto--bot-header-back">
                Back to chat
                <Arrow />
              </div>
            </div>
          </div>
        ) : null}
        <div className="scroll-wrapper">
          <iframe
            src={webUrl}
            sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation"
            allowFullScreen={true}
            width="100%"
            height="100%"
          />
        </div>
      </div>
    )
  }

  private minimize() {
    if (this.props.store) {
      const {
        store: { clearWebView }
      } = this.props
      clearWebView()
    }
  }

  private escListener(event: any) {
    if (event.key === 'Escape') {
      this.minimize!()
    }
  }


}



