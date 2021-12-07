import Close from '@material-ui/icons/Close'
import * as React from 'react'
import { setEvent } from '../../api/engagements'
import { IRootStore } from '../../store'

import Logger from '../../util/logger'

const log = Logger('Minimized').log



interface IMinimizedProps {
  maximize?: () => void
  store: IRootStore
  isPromptClosed: boolean
}

interface IMinimizedState {
  isClosedMsg: boolean
}

export class Minimized extends React.Component<
  IMinimizedProps,
  IMinimizedState
  > {
  private focused: boolean = false

  constructor(props: IMinimizedProps) {
    super(props)
    const { isPromptClosed } = this.props
    this.state = {
      isClosedMsg: isPromptClosed
    }
    this.closePrompt = this.closePrompt.bind(this)
  }

  public render() {
    const {
      store: { history, session },
      maximize
    } = this.props
    const { isClosedMsg } = this.state
    const welcomeMsg =
      history.length > 0 && history[0]
        ? history[0].displayText
        : 'Hi there! How can we help you? '
    const after = session.bot
      ? session.bot.theme.images.logo
      : `${process.env.PUBLIC_URL}/wp-content/uploads/2019/widgets/bot-icon-960_720.png`

    const showPrompts = session.bot ? session.bot.theme.css.showPrompts : false

    return (
      <div className="monrepondeurauto--minimize-box" onClick={maximize}>
        {!isClosedMsg && (
          // BOT PROMPT
          <div
            className={
              showPrompts
                ? 'monrepondeurauto--bot-prompt change-to-visible'
                : 'monrepondeurauto--bot-prompt'
            }
            id="monrepondeurauto--minimized-welcome"
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onKeyPress={this.handleKeyPress}
            tabIndex={1}
            onClick={this.maximizeOnPromptClick}
            aria-label="Open chat"
          >
            {/* PROMPT CLOSE ICON */}
            <div
              className="monrepondeurauto--bot-prompt-crossicon"
              aria-label="Close chat message"
              // tslint:disable
              onClick={e => {
                e.stopPropagation()
                this.closePrompt()
              }}
              // tslint:enable
              tabIndex={0}
              onKeyPress={this.handleKeyPressClose}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
            >
              <Close className="monrepondeurauto--bot-prompt-crossicon" />
            </div>
            <div>{welcomeMsg}</div>
          </div>
        )}

        {/* GREETER */}
        <div
          className={'monrepondeurauto--icon3d'}
          onClick={this.maximize}
          aria-label="Open chat"
        >
          <div className="monrepondeurauto--icon3d__face monrepondeurauto--icon3d__face--back">
            <img src={after} className="monrepondeurauto--avatar-image" />
          </div>
        </div>
      </div>
    )
  }

  private maximize = async () => {
    const { maximize, isPromptClosed } = this.props
    const { store } = this.props
    const session = store.session
    const bot = session.bot

    if (maximize && isPromptClosed && bot && session.sessionId) {
      maximize()
      const res = await setEvent({
        bot: bot._id,
        sessionId: session.sessionId,
        type: 'greeterClick'
      })
      log("maximize - type:'greeterClick'", res)
      return res

    } else if (maximize && !isPromptClosed && bot && session.sessionId) {
      maximize()
      await setEvent({
        bot: bot._id,
        sessionId: session.sessionId,
        type: 'greeterClick'
      })
      return this.closePrompt()
    }
  }

  private maximizeOnPromptClick = async () => {
    const { maximize } = this.props
    const { store } = this.props
    const session = store.session
    const bot = session.bot

    if (maximize && bot && session.sessionId) {
      maximize()
      const res = await setEvent({
        bot: bot._id,
        sessionId: session.sessionId,
        type: 'promptClick'
      })
      log("maximizeOnPromptClick - type: 'promptClick'", res)
      return res
    }
  }

  private closePrompt = () => {
    const {
      store: {
        session: { bot }
      }
    } = this.props
    this.setState({ isClosedMsg: true })
    if (bot && bot.theme && bot.theme.css) {
      bot.theme.css.turnOffPrompts()
    }
  }

  private handleKeyPress = async (e: any) => {
    log('key press', this.focused, e.key)
    const { store } = this.props
    const session = store.session
    const bot = session.bot
    if (this.focused && e.key === 'Enter') {
      if (this.props.maximize && bot && session.sessionId) {
        this.props.maximize()
        return await setEvent({
          bot: bot._id,
          sessionId: session.sessionId,
          type: 'promptClick'
        })
      }
    }
  }

  private handleKeyPressClose = (e: any) => {
    e.stopPropagation()
    log('key press', this.focused, e.key)
    if (this.focused && e.key === 'Enter') {
      this.closePrompt()
    }
  }

  private onBlur = () => {
    this.focused = false
  }

  private onFocus = () => {
    this.focused = true
  }
}



