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

export enum AVAILABLE_LANGUAGES {
  DA = 'da' as any,
  DE = 'de' as any,
  EN = 'en' as any,
  ES = 'es' as any,
  FR = 'fr' as any,
  HI = 'hi' as any,
  ID = 'id' as any,
  IT = 'it' as any,
  JA = 'ja' as any,
  KO = 'ko' as any,
  NL = 'nl' as any,
  NO = 'no' as any,
  PL = 'pl' as any,
  PT_EU = 'pt' as any,
  PT_BR = 'pt-br' as any,
  RU = 'ru' as any,
  SV = 'sv' as any,
  TH = 'th' as any,
  TR = 'tr' as any,
  UK = 'uk' as any,
  ZH_CN = 'zh-cn' as any,
  ZH_HK = 'zh-hk' as any,
  ZH_TW = 'zh-tw' as any
}

export class ApiAiConstants {
  public static AVAILABLE_LANGUAGES = AVAILABLE_LANGUAGES

  public static VERSION: string = '2.0.0-beta.20'

  public static DEFAULT_BASE_URL: string = '/api/12313'


  public static DEFAULT_API_VERSION: string = '20150910'

  public static DEFAULT_CLIENT_LANG: string = 'en'

}



