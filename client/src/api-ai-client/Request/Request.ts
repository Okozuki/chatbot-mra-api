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

import { ApiAiClient } from '../ApiAiClient'
import { ApiAiRequestError } from '../Errors'
import { IRequestOptions, IServerResponse, IStringMap } from '../Interfaces'
import XhrRequest from '../XhrRequest'



abstract class Request {
  private static handleSuccess(xhr: XMLHttpRequest): Promise<IServerResponse> {
    return Promise.resolve(JSON.parse(xhr.responseText))
  }

  private static handleError(xhr: XMLHttpRequest): Promise<ApiAiRequestError> {
    let error = new ApiAiRequestError('')
    try {
      const serverResponse: IServerResponse = JSON.parse(xhr.responseText)
      if (serverResponse.status && serverResponse.status.errorDetails) {
        error = new ApiAiRequestError(
          serverResponse.status.errorDetails,
          serverResponse.status.code
        )
      } else {
        error = new ApiAiRequestError(xhr.statusText, xhr.status)
      }
    } catch (e) {
      error = new ApiAiRequestError(xhr.statusText, xhr.status)
    }

    return Promise.reject<ApiAiRequestError>(error)
  }

  protected uri: string
  protected requestMethod: string
  protected headers: any

  constructor(
    protected apiAiClient: ApiAiClient,
    protected options: IRequestOptions
  ) {


    this.uri = this.apiAiClient.getApiBaseUrl()

    this.requestMethod = XhrRequest.Method.POST


    this.headers = {

      botId: this.apiAiClient.getBotId()
    }

    //this.headers = {}

    this.options.lang = this.apiAiClient.getApiLang()

    this.options.sessionId = this.apiAiClient.getSessionId()
  }

  public perform(overrideOptions = null): Promise<IServerResponse | ApiAiRequestError> {
    const options = overrideOptions ? overrideOptions : this.options

    return XhrRequest.ajax(
      this.requestMethod,
      this.uri,
      options as IStringMap,
      this.headers
    )
      .then(Request.handleSuccess.bind(this))

      .catch(err => err)
  }
}

export default Request


