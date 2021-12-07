import { Message } from '@livechat/ui-kit'
import { debounce, map } from 'lodash'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import getUniqueKey from 'uuid/v1'
import { IRootStore } from '../../store'
import { ISimpleResponseWrapper, ISuggestionArray } from '../../store/messages'
import { theme } from '../../styles/theme'
import { QuickReply } from './QuickReply'
import { TextMessage } from './TextMessage'



interface IBotProps {
  store: IRootStore
}

interface IQuickRepliesProps extends IBotProps {
  simpleResponses?: ISimpleResponseWrapper
  suggestions: ISuggestionArray
}

@inject('store')
@observer
export class QuickRepliesComponent extends React.Component<
IQuickRepliesProps,
{}
> {
  constructor(props: IQuickRepliesProps) {
    super(props)
    this.onSelect = debounce(this.onSelect.bind(this), 250)
  }

  public async onSelect(element: any, message: string, key: string) {
    const {
      store: { shipMessage, removeMessage }
    } = this.props
    await shipMessage({ isUserMessage: true, message, type: 'intent' })
    await removeMessage()
  }

  public render() {
    let textArr: any[] = []
    let text: string = ''
    if (this.props.simpleResponses) {
      textArr = this.props.simpleResponses.getSimpleResponses
      text = textArr[0].textToSpeech
    }

    const suggestionArr = this.props.suggestions.suggestions
    return map(suggestionArr, (suggestion: any) => {
      const replies = map(suggestion, (reply: any) => {
        return reply
      })

      return (
        <React.Fragment key={getUniqueKey()}>
          {text ? (
            <Message
              isOwn={false}
              key={`message-${getUniqueKey()}`}
              style={{ ...theme.messages.bot }}
            >
              <TextMessage key={`text-${getUniqueKey()}`} message={text} />
            </Message>
          ) : null}
          <QuickReply
            reply={replies[0]}

            onSelect={(key: string) => {
              this.onSelect(suggestion, replies[0], key)
            }}
          />
        </React.Fragment>
      )
    })
  }
}



