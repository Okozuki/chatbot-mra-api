import { MessageGroup } from '@livechat/ui-kit'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import getUniqueKey from 'uuid/v1'

interface ITypingAnimationProps {
  avatar?: string
}

@inject('store')
@observer
export class TypingAnimation extends React.Component<
ITypingAnimationProps,
{}
> {
  public render() {
    const { avatar } = this.props
    return (
      <div className="monrepondeurauto--message-box">
        <MessageGroup avatar={avatar}>
          <div key={getUniqueKey()} className="typing-indicator">
            <span>&nbsp;</span>
            <span>&nbsp;</span>
            <span>&nbsp;</span>
          </div>
        </MessageGroup>
      </div>
    )
  }
}



