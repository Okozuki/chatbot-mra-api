import * as React from 'react'
import getUniqueKey from 'uuid/v1'

export const QuickReply = ({
  onSelect,
  reply
}: {
  onSelect: any // callback function
  reply: string | any // reply title
}) => {
  const key = `quick-reply-${getUniqueKey()}`
  return (
    <div
      className="monrepondeurauto--bot-quickreplies"
      key={key}
      data-reply={reply}
      aria-label={reply}
      role="button"
      tabIndex={0}
      // tslint:disable-next-line jsx-no-lambda
      onClick={() => {
        onSelect(key)
      }}
      style={{ display: 'inline-block' }}
    >
      {reply}
    </div>
  )
}



