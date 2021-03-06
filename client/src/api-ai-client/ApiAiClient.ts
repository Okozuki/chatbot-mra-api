/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ApiAiConstants } from './ApiAiConstants'
import { ApiAiClientConfigurationError, ApiAiRequestError } from './Errors'
import { EventRequest } from './Request/EventRequest'
import TextRequest from './Request/TextRequest'
// import { TTSRequest } from "./Request/TTSRequest";

import {
  IApiClientOptions,
  IRequestOptions,
  IServerResponse,
  IStringMap
} from './Interfaces'
import { ContextsRequest } from './Request/ContextsRequest'

import Logger from '../util/logger'
const log = Logger('ApiAiClient').log

export * from './Interfaces'
export { ApiAiConstants } from './ApiAiConstants'

export class ApiAiClient {
  private apiLang: string // ApiAiConstants.AVAILABLE_LANGUAGES
  private apiVersion: string
  private apiBaseUrl: string
  private botId: string
  private sessionId: string
  private accessToken: string

  constructor(options: IApiClientOptions, lang: string) {
    if (!options || !options.accessToken) {
      throw new ApiAiClientConfigurationError(
        'Access token is required for new ApiAi.Client instance'
      )
    }

    this.accessToken = options.accessToken
    this.apiLang = lang
    this.apiVersion = options.version || ApiAiConstants.DEFAULT_API_VERSION
    this.apiBaseUrl = options.baseUrl || ApiAiConstants.DEFAULT_BASE_URL
    //this.apiBaseUrl = ApiAiConstants.DEFAULT_BASE_URL
    this.botId = options.botId || ''
    this.sessionId = options.sessionId || this.guid()
  }

  public textRequest(
    query: string,
    //options: IRequestOptions = {}
    options: any = {}
  ): Promise<IServerResponse | ApiAiRequestError> {
    if (!query) {
      throw new ApiAiClientConfigurationError('Query should not be empty')
    }
    options.query = query;
    this.setApiEndPoint('df_text_query'); // '/api/df_text_query'
    log('textRequest - apiBaseUrl:', this.apiBaseUrl)
    log('textRequest - option.event:', options)
    return new TextRequest(this, options).perform()
  }

  public eventRequest(
    eventName: string,
    //eventData: IStringMap = {},
    //options: IRequestOptions = {}
    options: any = {}
  ): Promise<IServerResponse | ApiAiRequestError> {
    if (!eventName) {
      throw new ApiAiClientConfigurationError('Event name can not be empty')
    }
    //options.event = { name: eventName, data: eventData }
    options.event = eventName;
    this.setApiEndPoint('df_event_query'); // '/api/df_event_query'
    log('eventRequest - apiBaseUrl:', this.apiBaseUrl)
    log('eventRequest - option.event:', options)

    return new EventRequest(this, options).perform()
  }

  public contextRequest(
    contextName: string,
    lifespanCount: number,
    contextData: IStringMap = {},
    options: IRequestOptions = {}
  ): Promise<IServerResponse | ApiAiRequestError> {
    if (!contextName) {
      throw new ApiAiClientConfigurationError('Context name can not be empty')
    }
    if (!lifespanCount) {
      throw new ApiAiClientConfigurationError('LifespanCount can not be empty')
    }
    options.context = { name: contextName, lifespanCount, data: contextData }
    return new ContextsRequest(this, options).perform()
  }



  private setApiEndPoint(endPointPath: string) {
    return this.apiBaseUrl = process.env.REACT_APP_API ? process.env.REACT_APP_API + endPointPath : '/api/' + endPointPath
  }

  public getAccessToken(): string {
    return this.accessToken
  }

  public getBotId(): string {
    return this.botId
  }

  public getApiVersion(): string {
    return this.apiVersion || ApiAiConstants.DEFAULT_API_VERSION
  }


  public getApiLang(): string {
    return this.apiLang || ApiAiConstants.DEFAULT_CLIENT_LANG
  }

  public getApiBaseUrl(): string {
    return this.apiBaseUrl || ApiAiConstants.DEFAULT_BASE_URL
  }

  public setSessionId(sessionId: string) {
    this.sessionId = sessionId
  }

  public getSessionId(): string {
    return this.sessionId
  }

  /**
   * generates new random UUID
   * @returns {string}
   */
  private guid(): string {
    const s4 = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    return (
      s4() +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      s4() +
      s4()
    )
  }
}



