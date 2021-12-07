import { debounce, map, size } from 'lodash'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import { BrowserView } from 'react-device-detect'
import { IRootStore } from '../../store'

import Button from '@material-ui/core/Button'
import Close from '@material-ui/icons/CloseRounded'
import FullscreenExit from '@material-ui/icons/FullscreenExitRounded'
import Fullscreen from '@material-ui/icons/FullscreenRounded'
import Send from '@material-ui/icons/Send'
import Speaker from '@material-ui/icons/VolumeUpRounded'

import { theme } from '../../styles/theme'
import { WebMessage } from '../Messages'
import { Chatroom } from './Chatroom'

import Logger from '../../util/logger'
const log = Logger('maximized').log



const microphoneIcon = {
  icon:
    'M12.542,241.94c1.243,0,2.309-0.443,3.193-1.329c0.886-0.885,1.329-1.95,1.329-3.193v-7.235	c0-1.244-0.443-2.308-1.329-3.194c-0.885-0.885-1.95-1.328-3.193-1.328c-1.244,0-2.308,0.443-3.194,1.328	c-0.885,0.886-1.328,1.95-1.328,3.194v7.235c0,1.243,0.443,2.309,1.328,3.193C10.234,241.497,11.299,241.94,12.542,241.94z M20.414,234.973c-0.179-0.179-0.392-0.269-0.636-0.269c-0.245,0-0.458,0.09-0.636,0.269c-0.179,0.179-0.269,0.391-0.269,0.636	v1.809c0,1.743-0.62,3.233-1.858,4.473c-1.239,1.238-2.729,1.858-4.473,1.858s-3.234-0.62-4.473-1.858	c-1.238-1.238-1.858-2.729-1.858-4.473v-1.809c0-0.245-0.089-0.457-0.268-0.636c-0.179-0.179-0.391-0.269-0.636-0.269	c-0.245,0-0.457,0.09-0.636,0.269c-0.179,0.179-0.269,0.391-0.269,0.636v1.809c0,2.082,0.695,3.894,2.084,5.434	s3.106,2.422,5.151,2.649v1.865H8.021c-0.245,0-0.457,0.09-0.636,0.269c-0.179,0.179-0.269,0.391-0.269,0.636	c0,0.244,0.09,0.456,0.269,0.636c0.179,0.18,0.391,0.27,0.636,0.27h9.044c0.244,0,0.456-0.09,0.635-0.27	c0.18-0.18,0.27-0.392,0.27-0.636c0-0.245-0.09-0.457-0.27-0.636c-0.179-0.179-0.391-0.269-0.635-0.269h-3.618V245.5	c2.044-0.228,3.761-1.109,5.15-2.649s2.085-3.352,2.085-5.434v-1.809C20.682,235.364,20.592,235.152,20.414,234.973z'
}

interface IMaximizedProps {
  minimize?: () => void
  store: IRootStore
  maximizeWindow: any
  isZoom: boolean
}

interface IMaximizedState {
  recognizing: boolean
  canRecognize: boolean
  messageAction: any
  inputText: string
  ttsDialog: boolean
  isLoading: boolean
}

@inject('store')
@observer
export class Maximized extends React.Component<
IMaximizedProps,
IMaximizedState
> {

  private static focusTextInput() {
    const inputTextfield = document.getElementsByClassName(
      'monrepondeurauto--input-message'
    )[0]
    // dont focus if on mobile
    if (inputTextfield && !/Mobi|Android/i.test(navigator.userAgent)) {
      // @ts-ignore
      inputTextfield.focus()
    }
  }

  private recognition?: any

  constructor(props: IMaximizedProps) {
    super(props)
    this.onMessageSend = debounce(this.onMessageSend.bind(this), 250)
    this.onMenuClick = debounce(this.onMenuClick.bind(this), 250)
    this.useMicrophone = debounce(this.useMicrophone.bind(this), 250)
    this.scrollDown = debounce(this.scrollDown.bind(this), 250)
    this.textInputBox = debounce(this.textInputBox.bind(this), 250)
    this.maximizeZoom = debounce(this.maximizeZoom.bind(this), 250)
    this.handleMicrophoneEnter = this.handleMicrophoneEnter.bind(this)
    this.handleMaximizeEnter = this.handleMaximizeEnter.bind(this)
    this.escListener = this.escListener.bind(this)
    // tslint:disable-next-line
    const canRecognize = !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition
    )
    if (canRecognize) {
      const lang = this.props.store.languageCode
      this.recognition = new ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition)()
      this.recognition.lang = lang
    }

    this.state = {
      canRecognize,
      inputText: '',
      isLoading: false,
      messageAction: false,
      recognizing: false,
      ttsDialog: false
    }
  }

  public componentDidMount() {
    document.addEventListener('keydown', this.escListener, false)
    Maximized.focusTextInput()
  }

  public componentWillUnmount() {
    document.removeEventListener('keydown', this.escListener, false)
  }

  public textInputBox(e: number) {
    if (e >= 30 && e <= 40) {
      const inputDiv = document
        .getElementsByClassName('monrepondeurauto--input-message')[0]
        .getElementsByTagName('textarea')[0]
      inputDiv.style.height = '40px'
    }
  }

  public scrollDown(messageChild: any) {
    setTimeout(
      () =>
        messageChild.current._listRef.scrollTo(
          0,
          messageChild.current._listRef.clientHeight * 1000
        ),
      100
    )
  }

  public onKeyDown = async (e: any) => {
    const temp = e.key
    await this.setState({ inputText: e.target.value })
    log('isLoading', this.state.isLoading)
    if (
      temp === 'Enter' &&
      this.state.inputText.trim() &&
      !this.state.isLoading
    ) {
      await this.onMessageSend(this.state.inputText)
      this.setState({ inputText: '' })
    } else if (
      temp === 'Enter' &&
      this.state.inputText.trim() &&
      this.state.isLoading
    ) {
      // @ts-ignore
      document.getElementById('inputWrapper').className =
        'input-send-wrap cleanslate'
      setTimeout(() => {
        // @ts-ignore
        document.getElementById('inputWrapper').className =
          'monrepondeurauto--textInput-wrapper cleanslate'
      }, 400)
    }
  }

  public onSubmit = async () => {
    if (this.state.inputText.trim() && !this.state.isLoading) {
      await this.onMessageSend(this.state.inputText)
      this.setState({ inputText: '' })
    } else if (this.state.inputText.trim() && this.state.isLoading) {
      // @ts-ignore
      document.getElementById('inputWrapper').className =
        'input-send-wrap cleanslate'
      setTimeout(() => {
        // @ts-ignore
        document.getElementById('inputWrapper').className =
          'monrepondeurauto--textInput-wrapper cleanslate'
      }, 400)
    }
  }

  public onTextChange = (e: any) => {
    this.setState({ inputText: e.target.value })
  }

  public renderMicroPhone = () => {
    return this.state.recognizing ? (
      <div className="monrepondeurauto--microphone-flex cleanslate">
        <div
          tabIndex={0}
          onKeyPress={this.handleMicrophoneEnter}
          className="monrepondeurauto--microphone-wrapper cleanslate"
          aria-label="Say your message"
        >
          <svg
            className="monrepondeurauto--microphone-icon cleanslate"
            onClick={this.useMicrophone}
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="-3.458 221.292 32 32"
          >
            <circle fill="#fff" cx="12.542" cy="237.418" r="16" />
            <path fill={theme.vars.miscroPhone} d={microphoneIcon.icon} />
          </svg>
        </div>
      </div>
    ) : (
        <div className="monrepondeurauto--microphone-flex cleanslate">
          <div
            tabIndex={0}
            onKeyPress={this.handleMicrophoneEnter}
            className="monrepondeurauto--microphone-wrapper cleanslate"
          >
            <svg
              className="monrepondeurauto--microphone-icon cleanslate"
              onClick={this.useMicrophone}
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="-3.458 221.292 32 32"
            >
              <circle
                fill={theme.vars.miscroPhoneActive}
                cx="12.542"
                cy="237.418"
                r="16"
              />
              <path fill={theme.vars.chatBox} d={microphoneIcon.icon} />
            </svg>
          </div>
        </div>
      )
  }

  public render() {
    // const title = this.props.store.session.bot
    //   ? this.props.store.session.bot.name
    //   : 'monrepondeurauto'
    const title = "Mon Répondeur Automatique";

    const bot = this.props.store.session.bot

    const showPoweredBy =
      bot && bot.theme.css.showPoweredByMonRepondeurAuto
        ? bot.theme.css.showPoweredByMonRepondeurAuto
        : false

    const showMenu =
      bot && bot.theme.css.showMenu ? bot.theme.css.showMenu : false

    const {
      store: { webViewUrl, session },
      isZoom
    } = this.props
    const { messageAction } = this.state
    const { innerHeight } = window
    let styelObj = {}
    if (isZoom) {
      styelObj = {
        WebkitBoxShadow: `0px ${theme.vars.botMessageBorder} !important`,
        backgroundColor: `${theme.vars.botMessageBackgroud}`,
        border: '0px !important',
        boxShadow: `0px ${theme.vars.botMessageBorder} !important`,
        cursor: 'default',
        height: innerHeight - 125 + 'px',
        margin: '0 auto',
        width: '740px'
      }
    } else {
      styelObj = {
        flexGrow: 1,
        height: '100%',
        minHeight: 0
      }
    }

    return (
      <div
        className="monrepondeurauto--bot-chat-window"
        style={{
          backgroundColor: `${theme.vars.chatBox}`,
          cursor: 'default',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <div
          className="monrepondeurauto--bot-header"
          style={{
            alignItems: 'center',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          {/* Maximize & TTS GRID */}
          {(/Mobi|Android/i.test(navigator.userAgent) &&
            bot &&
            !bot.integrations.ttsApiKey) ||
            (bot &&
              bot.theme.css.cuiMode &&
              !bot.integrations.ttsApiKey) ? null : (
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start'
                }}
              >
                {bot && bot.theme.css.cuiMode ? null : (
                  <BrowserView>
                    <div
                      tabIndex={1}
                      className={
                        /Mobi|Android/i.test(navigator.userAgent) ||
                          (bot && bot.integrations.ttsApiKey)
                          ? 'monrepondeurauto-maximize-icon'
                          : 'monrepondeurauto-maximize-icon-notts'
                      }
                      onClick={this.maximizeZoom}
                      onKeyPress={this.handleMaximizeEnter}
                      aria-label="Maximize chat to full screen"
                    >
                      {!isZoom ? <Fullscreen /> : <FullscreenExit />}
                    </div>
                  </BrowserView>
                )}

                {/* TTS */}
                {bot && bot.integrations.ttsApiKey ? (
                  <Speaker
                    className={
                      session.tts
                        ? 'monrepondeurauto--enable-tts-active'
                        : 'monrepondeurauto--enable-tts-inactive'
                    }
                    onClick={this.openTTSDialog}
                    tabIndex={2}
                  />
                ) : null}
              </div>
            )}
          <div
            className="monrepondeurauto--bot-header-title"
            style={bot && bot.theme.css.cuiMode ? { margin: 'auto' } : {}}
          >
            {title
              /*'Mon Répondeur Automatique '*/
            }

          </div>

          {bot && bot.theme.css.cuiMode ? null : (
            <div
              tabIndex={3}
              key="close"
              className={
                (bot && bot.theme.css.cuiMode) ||
                  /Mobi|Android/i.test(navigator.userAgent) ||
                  (bot && !bot.integrations.ttsApiKey)
                  ? 'monrepondeurauto--bot-header-close-nouneven'
                  : 'monrepondeurauto--bot-header-close'
              }
              aria-label="Close chat"
              onClick={this.props.minimize}
              onKeyPress={this.escListener}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
              // tslint:disable
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  this.props!.minimize!()
                }
              }}
            // tslint:enable
            >
              <Close />
            </div>
          )}
        </div>

        <div className="monrepondeurauto--bot-messages" style={styelObj}>
          <Chatroom
            store={this.props.store}
            scrollDown={this.scrollDown}
            isMessage={messageAction}
            setIsLoading={this.setIsLoading}
          />
        </div>
        <div
          className="cleanslate"
          style={
            isZoom
              ? theme.isZoomUserInput
              : {
                backgroundColor: '#fff',
                height: 'auto !important',
                paddingTop: '15px !important',
                zIndex: 99
              }
          }
        >
          {showPoweredBy ? (
            <div className="monrepondeurauto--bot-bottom-link cleanslate">
              <a href="https://monrepondeurautomatique.com/" target="_blank">
                <strong>{'Powered by Mon Répondeur Automatique '}</strong>
                {/* <img src={logo} width={14} style={{ marginBottom: -2 }} /> */}
              </a>
            </div>
          ) : null}
          <div style={{ margin: '0 0 0 0', outline: 'none' }} />

          {/* tts dialog wrapper */}
          {this.state.ttsDialog ? (
            <div className="monrepondeurauto--tts-dialog-container cleanslate">
              <div className="monrepondeurauto--tts-dialog-text-container cleanslate">
                {session.tts ? (
                  <div>Would you like to disable Text to Speech?</div>
                ) : (
                    <div>Would you like to enable Text to Speech?</div>
                  )}
                {/* normal */}
                {session.tts ? null : (
                  <div
                    style={{
                      fontSize: '80%',
                      fontWeight: 500,
                      marginTop: '5px'
                    }}
                  >
                    Accepting will activate your microphone after the bot
                    speaks.
                  </div>
                )}
              </div>
              <div className="monrepondeurauto--tts-dialog-button-container cleanslate">
                <button
                  className="monrepondeurauto--tts-dialog-button cleanslate"
                  onClick={this.toggleTTS}
                >
                  Yes
                </button>
                <button
                  className="monrepondeurauto--tts-dialog-cancelButton cleanslate"
                  onClick={this.closeTTSDialog}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
          <div
            style={{ zIndex: 100 }}
            className="monrepondeurauto--input-container cleanslate"
          >
            {/** MENU BUTTON */}

            {showMenu ? (
              <div
                style={{ zIndex: 101 }}
                className="monrepondeurauto--menu-button cleanslate"
                aria-label="See menu"
              >
                <button
                  onClick={this.onMenuClick}
                  className="monrepondeurauto--menu-innerbutton cleanslate"
                >
                  {this.renderMenuTranslation()}
                </button>
              </div>
            ) : null}

            <div
              id="inputWrapper"
              className="monrepondeurauto--textInput-wrapper cleanslate"
            >
              {/** TEXT INPUT  AND MIC */}
              <div
                style={{ zIndex: 104 }}
                className="monrepondeurauto--textInput-wrapper cleanslate"
              >
                <input
                  type="text"
                  value={this.state.inputText}
                  onChange={this.onTextChange}
                  placeholder={this.renderInputPlaceholder()}
                  onKeyDown={this.onKeyDown}
                  className="monrepondeurauto--input-message cleanslate"
                  aria-label="Type your message"
                />
              </div>

              {/** MICROPHONE */}
              {this.renderMicroPhone()}
              {/** SEND BUTTON */}
              <div
                style={{ zIndex: 105 }}
                className="monrepondeurauto--bot-send-btn cleanslate"
                aria-label="Send message"
              >
                <Button
                  onClick={this.onSubmit}
                  className="monrepondeurauto--bot-send-innerbtn cleanslate"
                >
                  <Send style={{ color: '#aaaaaa', height: 32, width: 32 }} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {webViewUrl ? <WebMessage /> : null}
      </div>
    )
  }

  private async onMenuClick() {
    const {
      store: { shipMessage, removeQuickMessage, removeMessage }
    } = this.props
    await removeQuickMessage()
    await shipMessage({ message: 'Menu', isUserMessage: true, type: 'intent' })
    await removeMessage()
    this.setState({ messageAction: window.history.length })
  }

  private maximizeZoom() {
    const { maximizeWindow } = this.props
    maximizeWindow()
  }

  private handleMicrophoneEnter(event: any) {
    if (event.key === 'Enter') {
      this.useMicrophone()
    }
  }

  private handleMaximizeEnter(event: any) {
    if (event.key === 'Enter') {
      this.maximizeZoom()
    }
  }

  private setIsLoading = (bool: boolean) => {
    this.setState({ isLoading: bool })
  }

  private escListener(event: any) {
    const { store } = this.props
    if (store.session.bot) {
      if (!store.session.bot.theme.css.cuiMode && event.key === 'Escape') {
        this.props.minimize!()
      }
    }
  }

  private useMicrophone() {
    if (this.state.recognizing) {
      return
    }

    if (!('webkitSpeechRecognition' in window)) {
      this.recognition.upgrade()
    } else {
      this.recognition.start()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.onstart = () => {
        this.setState({ recognizing: true })
      }
      this.recognition.onerror = (e: string) => {
        console.log(e)
      }

      this.recognition.onend = () => {
        this.setState({ recognizing: false })
      }
      this.recognition.onresult = (e: any) => {
        if (typeof e.results === 'undefined') {
          this.recognition.onend = null
          this.recognition.stop()
          return
        }

        map(e.results, (elements: any) => {
          if (size(elements) > 0) {
            const value = elements[0].transcript
            this.setState({ inputText: value })
          }
        })
      }
    }
  }

  private openTTSDialog = () => {
    if (this.state.ttsDialog === true) {
      this.setState({ ttsDialog: false })
    } else {
      this.setState({ ttsDialog: true })
    }
  }

  private closeTTSDialog = () => {
    this.setState({ ttsDialog: false })
  }

  private toggleTTS = () => {
    const { session } = this.props.store
    if (session.tts) {
      this.setState({ ttsDialog: false })
      session.disableTTS()
    } else {
      this.setState({ ttsDialog: false })
      session.enableTTS()
      this.props.store.playTTS()
      this.useMicrophone()
    }
    return
  }

  private async onMessageSend(message: string) {
    const {
      store: { history, shipMessage, removeQuickMessage, removeMessage }
    } = this.props
    await removeQuickMessage()
    await shipMessage({ message, type: 'intent', isUserMessage: true })
    await removeMessage()
    this.setState({ messageAction: history.length })
  }

  private renderInputPlaceholder = () => {
    const { store } = this.props
    const lang = store.languageCode
    log("InputPlaceholder - languageCode", lang)

    switch (lang) {
      case 'da':
        return 'Skriv din besked ...'

      case 'de':
        return 'Geben Sie Ihre Nachricht ein ...'

      case 'en':
        return 'Type your message...'

      case 'es':
        return 'Escribe tu mensaje...'

      case 'fr':
        return 'Tapez votre message ...'

      case 'hi':
        return 'अपना संदेश टाइप करें...'

      case 'id':
        return 'Ketik pesan anda...'

      case 'it':
        return 'Scrivi il tuo messaggio ...'

      case 'ja':
        return 'メッセージを入力してください'

      case 'ko':
        return '메시지를 입력하십시오 ...'

      case 'nl':
        return 'Schrijf je bericht...'

      case 'no':
        return 'Skriv inn meldingen din ...'

      case 'pl':
        return 'Wpisz swoją wiadomość...'

      case 'pt' || 'pt-br':
        return 'Digite sua mensagem...'

      case 'ru':
        return 'Введите ваше сообщение ...'

      case 'sv':
        return 'Skriv ditt meddelande ...'

      case 'th':
        return 'พิมพ์ข้อความของคุณ ...'

      case 'tr':
        return 'Mesajını yaz...'

      case 'uk':
        return 'Введіть своє повідомлення ...'

      case 'zh-cn' || 'zh-hk':
        return '输入你的信息......'

      case 'zh-tw':
        return '輸入你的信息......'

      default:
        return 'Type your message...'
    }
  }

  private renderMenuTranslation = () => {
    const { store } = this.props
    const lang = store.languageCode

    switch (lang) {
      case 'en' || 'da' || 'fr' || 'id' || 'it' || 'nl' || 'pl':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            Menu
          </div>
        )

      case 'es':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            Menú
          </div>
        )

      case 'hi':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            मेन्यू
          </div>
        )

      case 'ja':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            メニュー
          </div>
        )

      case 'ja':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            메뉴
          </div>
        )

      case 'no' || 'sv':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            Meny
          </div>
        )

      case 'pt' || 'pt-br':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            Cardápio
          </div>
        )

      case 'ru' || 'uk':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            Меню
          </div>
        )

      case 'th':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            เมนู
          </div>
        )

      case 'tr' || 'de':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            Menü
          </div>
        )

      case 'zh-cn' || 'zh-hk':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            菜单
          </div>
        )

      case 'zh-tw':
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            菜單
          </div>
        )

      default:
        return (
          <div
            style={{ zIndex: 102 }}
            className="monrepondeurauto--menu-text cleanslate"
          >
            Menu
          </div>
        )
    }
  }
}



