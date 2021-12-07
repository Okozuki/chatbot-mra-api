import { map } from 'lodash'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import getUniqueKey from 'uuid/v1'
import { IRootStore } from '../../store'
import { IWebhookListSelect } from '../../store/messages'

// import Logger from '../../util/logger'
// const log = Logger('ListMessage.tsx').log

interface IListMessageProps {
  store: IRootStore
  scrollMessage: any
  list?: any
  webhookList?: IWebhookListSelect
}

@inject('store')
@observer
export class ListMessage extends React.Component<IListMessageProps, {}> {
  constructor(props: IListMessageProps) {
    super(props)
  }

  public async onSelect(element: any, message: string, key: string) {
    const {
      store: { shipMessage, removeMessage }
    } = this.props
    await shipMessage({ isUserMessage: true, message, type: 'intent' })
    await removeMessage()
  }

  public render() {
    if (this.props.list) {
      const list = this.props.list
      const items = this.props.list.items
      const lastIndex = items.length - 1
      return (
        <div className="monrepondeurauto--list-message" key={`list-${getUniqueKey()}`}>
          {/* LIST TITLE */}
          <div className="monrepondeurauto--list-title-container" tabIndex={0}>
            <div className="monrepondeurauto--list-title">{list.title}</div>
            <div className="monrepondeurauto--list-subtitle">{list.description}</div>
          </div>
          {/* LIST ITEMS */}
          <div className="monrepondeurauto--list-item-container">
            {map(items, (item: any, i: number) => {
              const key = `list-item-${getUniqueKey()}-${i}`
              return (
                <div key={key}>
                  <div
                    className={
                      i === lastIndex
                        ? 'monrepondeurauto--list-item-last'
                        : 'monrepondeurauto--list-item'
                    }
                    aria-label={item.info.key}
                    tabIndex={0}
                    // tslint:disable
                    // @ts-ignore
                    onClick={(event, key: any) => {
                      this.onSelect(item, item.info.key, key)
                    }}
                    onKeyPress={(event: any) => {
                      this.handleEnter(event, key, item)
                    }}
                    style={{ cursor: 'pointer' }}
                  // tslint:enable
                  >
                    <div className="monrepondeurauto--list-item-image">
                      <img
                        src={item.image.imageUri}
                        alt={item.image.accessibilityText}
                      />
                    </div>
                    <div className="monrepondeurauto--list-item-info">
                      <div className="monrepondeurauto--list-item-title">
                        {item.title}
                      </div>
                      <div className="monrepondeurauto--list-item-description">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else if (this.props.webhookList) {
      const list = this.props.webhookList
      const items = this.props.webhookList.items
      const lastIndex = items.length - 1
      return (
        <div className="monrepondeurauto--list-message" key={`list-${getUniqueKey()}`}>
          {/* LIST TITLE */}
          {list.title ? (
            <div className="monrepondeurauto--list-title-container" tabIndex={0}>
              <div className="monrepondeurauto--list-title">{list.title}</div>
            </div>
          ) : null}

          {/* <div className="monrepondeurauto--list-subtitle">{list.description}</div> */}
          {/* LIST ITEMS */}
          <div className="monrepondeurauto--list-item-container">
            {map(items, (item: any, i: number) => {
              const key = `list-item-${getUniqueKey()}-${i}`
              return (
                <div key={key}>
                  <div
                    className={
                      i === lastIndex
                        ? 'monrepondeurauto--list-item-last'
                        : 'monrepondeurauto--list-item'
                    }
                    tabIndex={0}
                    // tslint:disable
                    // @ts-ignore
                    onClick={(event: any, key: any) => {
                      if (item.optionInfo) {
                        this.onSelect(item, item.optionInfo.key || '', key)
                      }
                    }}
                    onKeyPress={(event: any) => {
                      this.handleEnter(event, key, item)
                    }}
                    style={{ cursor: 'pointer' }}
                  // tslint:enable
                  >
                    <div className="monrepondeurauto--list-item-image">
                      {item.image ? (
                        <img
                          src={item.image.url}
                          alt={item.image.accessibilityText}
                        />
                      ) : null}
                    </div>
                    <div className="monrepondeurauto--list-item-info">
                      <div className="monrepondeurauto--list-item-title">
                        {item.title}
                      </div>
                      <div className="monrepondeurauto--list-item-description">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else {
      return
    }
  }

  private handleEnter = (event: any, key: string, item: any) => {
    if (event.key === 'Enter') {
      this.onSelect(item, item.info.key, key)
    }
  }
}



// WEBPACK FOOTER //
// ./src/components/Messages/List.tsx