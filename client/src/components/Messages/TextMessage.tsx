import { toLower } from 'lodash'
import * as React from 'react'
import getUniqueKey from 'uuid/v1'

interface ITextMessage {
  message: string
  style?: any
}

const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
const linkRegex = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi
// const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})/gi
// const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gi

const checkIfEmailInString = (text: string) => {
  // const re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/
  return emailRegex.test(toLower(text))
}

const findHyperlinks = (text: string) => {
  return linkRegex.test(toLower(text))
}

export class TextMessage extends React.Component<ITextMessage, {}> {
  public render() {
    let { message } = this.props
    const hasEmail = checkIfEmailInString(message)
    const hasLink = findHyperlinks(message)
    if (hasEmail) {
      message = message.replace(emailRegex, '<a href="mailto:$1">$1</a>')
    }
    if (hasLink) {
      message = message.replace(
        linkRegex,
        `<a target="_blank" href="$1">$1</a>`
      )
    }

    return (
      <div
        key={getUniqueKey()}
        style={this.props.style}
        dangerouslySetInnerHTML={{ __html: message }}
      />
    )
  }
}



