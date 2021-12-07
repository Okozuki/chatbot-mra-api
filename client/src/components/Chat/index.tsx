import { FixedWrapper } from '@livechat/ui-kit'
import { debounce, get } from 'lodash'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import { setEvent } from '../../api/engagements'
import { IRootStore } from '../../store'
import { Maximized } from './Maximized'
import { Minimized } from './Minimized'

import axios from 'axios/index';
import Cookies from 'universal-cookie';

import Logger from '../../util/logger'
const log = Logger('Chat/index').log

interface IChatProps {
  maximize?: () => void
  minimize?: () => void
  store: IRootStore
}

interface IChatState {
  //messages: any
  isOpen: boolean
  fullscreenOnInit: boolean
  maximizedOnInit: boolean
  isZoom: boolean
  isPromptClosed: boolean
}

const cookies = new Cookies();

@inject('store')
@observer
export class Chat extends React.Component<IChatProps, IChatState> {
  constructor(props: IChatProps) {
    super(props)
    const cuiMode = this.props.store.session.bot
      ? this.props.store.session.bot.theme.css.cuiMode
      : false
    const search = get(window, 'location.search', false)
    const params = new URLSearchParams(search)
    const openOnInit: any = params.get('o')
    const fullscreen: any = params.get('f')
    let maximizedOnInit = openOnInit === 't' ? true : false
    let fullscreenOnInit = fullscreen === 't' || cuiMode ? true : false


    if (/Mobi|Android/i.test(navigator.userAgent)) {
      if (fullscreenOnInit) {
        fullscreenOnInit = false
        maximizedOnInit = true
      }
    }

    this.state = {
      //messages: [],
      fullscreenOnInit,
      isOpen: maximizedOnInit || fullscreenOnInit,
      isPromptClosed: maximizedOnInit || fullscreenOnInit,
      isZoom: fullscreenOnInit,
      maximizedOnInit

    }
    this.maximizeWindow = debounce(this.maximizeWindow.bind(this), 250)
  }



  public render() {
    const { store } = this.props

    const session = store.session
    const bot = session.bot
    const {
      isOpen,
      maximizedOnInit,
      isZoom,
      fullscreenOnInit,
      isPromptClosed
    } = this.state
    const { innerWidth, innerHeight } = window
    const maximized = isOpen === true
    const minimized = isOpen === false

    let styelObj = {}
    if (isZoom) {
      styelObj = {
        cursor: 'pointer',
        height: innerHeight + 'px',
        left: '1em',
        position: 'relative',
        right: 0,
        width: innerWidth + 'px'
      }
    }

    log('iszoom', isZoom, fullscreenOnInit)

    if (maximizedOnInit && bot && session.sessionId) {
      setEvent({
        bot: bot._id,
        sessionId: session.sessionId,
        type: 'url/open'
      })
    }

    if (fullscreenOnInit && bot && session.sessionId) {
      setEvent({
        bot: bot._id,
        sessionId: session.sessionId,
        type: 'url/fullscreen'
      })
    }

    return (
      <FixedWrapper.Root
        maximizedOnInit={maximizedOnInit || fullscreenOnInit}
        style={{ zIndex: '2147483447' }}
      >
        <FixedWrapper.Maximized active={maximized} style={styelObj}>
          <Maximized
            {...this.props}
            maximizeWindow={this.maximizeWindow}
            isZoom={isZoom}
          />
        </FixedWrapper.Maximized>
        <FixedWrapper.Minimized active={minimized} style={{ height: 1 }}>
          <Minimized {...this.props} isPromptClosed={isPromptClosed} />
        </FixedWrapper.Minimized>
      </FixedWrapper.Root>
    )
  }

  private maximizeWindow() {
    this.setState({ isZoom: !this.state.isZoom })
  }
}



