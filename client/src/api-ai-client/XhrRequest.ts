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

import { IStringMap } from './Interfaces'
/**
 * quick ts implementation of example from
 * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * with some minor improvements
 * @todo: test (?)
 * @todo: add node.js implementation with node's http inside. Just to make SDK cross-platform
 */
export enum Method {
  GET = 'GET' as any,
  POST = 'POST' as any,
  PUT = 'PUT' as any,
  DELETE = 'DELETE' as any
}
class XhrRequest {
  public static Method = {
    DELETE: 'DELETE',
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT'
  }
  // Method that performs the ajax request
  public static ajax(
    method: string,
    url: string,
    args: IStringMap | null = null,
    headers: IStringMap | null = null,
    options: IStringMap = {}
  ): Promise<any> {
    // Creating a promise
    return new Promise((resolve, reject) => {
      // Instantiates the XMLHttpRequest
      const client: XMLHttpRequest | null = XhrRequest.createXMLHTTPObject()
      let uri: string = url
      let payload: string | null = null

      // Add given payload to get request
      if (args && method === XhrRequest.Method.GET) {
        uri += '?'
        let argcount = 0
        for (const key in args) {
          if (args.hasOwnProperty(key)) {
            if (argcount++) {
              uri += '&'
            }
            uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key])
          }
        }
      } else if (args) {
        if (!headers) {
          headers = {}
        }
        headers['Content-Type'] = 'application/json; charset=utf-8'
        payload = JSON.stringify(args)
      }

      if (client) {
        for (const key in options) {
          if (key in client) {
            // @ts-ignore
            client[key] = options[key]
          }
        }

        // hack: method[method] is somewhat like .toString for enum Method
        // should be made in normal way
        // @ts-ignore
        client.open(XhrRequest.Method[method], uri, true)
        // Add given headers

        if (headers) {
          for (const key in headers) {
            if (headers.hasOwnProperty(key)) {
              client.setRequestHeader(key, headers[key])
            }
          }
        }

        payload ? client.send(payload) : client.send()

        client.onload = () => {
          if (client.status >= 200 && client.status < 300) {
            // Performs the function "resolve" when this.status is equal to 2xx
            resolve(client)
          } else {
            // Performs the function "reject" when this.status is different than 2xx
            reject(client)
          }
        }
        client.onerror = () => {
          reject(client)
        }
      }
    })
  }

  public static get(
    url: string,
    payload: IStringMap | null = null,
    headers: IStringMap | null = null,
    options = {}
  ): Promise<any> {
    return XhrRequest.ajax(
      XhrRequest.Method.GET,
      url,
      payload,
      headers,
      options
    )
  }

  public static post(
    url: string,
    payload: IStringMap | null = null,
    headers: IStringMap | null = null,
    options = {}
  ): Promise<any> {
    return XhrRequest.ajax(
      XhrRequest.Method.POST,
      url,
      payload,
      headers,
      options
    )
  }

  public static put(
    url: string,
    payload: IStringMap | null = null,
    headers: IStringMap | null = null,
    options = {}
  ): Promise<any> {
    return XhrRequest.ajax(
      XhrRequest.Method.PUT,
      url,
      payload,
      headers,
      options
    )
  }

  public static delete(
    url: string,
    payload: IStringMap | null = null,
    headers: IStringMap | null = null,
    options = {}
  ): Promise<any> {
    return XhrRequest.ajax(
      XhrRequest.Method.DELETE,
      url,
      payload,
      headers,
      options
    )
  }

  // private static XMLHttpFactories: Function[] = [
  private static XMLHttpFactories: Array<() => XMLHttpRequest> = [
    () => new XMLHttpRequest(),
    () => new (window as any).ActiveXObject('Msxml2.XMLHTTP'),
    () => new (window as any).ActiveXObject('Msxml3.XMLHTTP'),
    () => new (window as any).ActiveXObject('Microsoft.XMLHTTP')
  ]

  private static createXMLHTTPObject(): XMLHttpRequest | null {
    let xmlhttp: XMLHttpRequest | null = null
    for (const i of XhrRequest.XMLHttpFactories) {
      try {
        xmlhttp = i()
      } catch (e) {
        continue
      }
      break
    }

    return xmlhttp
  }
}

// namespace XhrRequest {
// export enum Method {
//     GET = "GET" as any,
//     POST = "POST" as any,
//     PUT = "PUT" as any,
//     DELETE = "DELETE" as any
// }
// }

export default XhrRequest



