import axios from 'axios'

// import Logger from '../util/logger'
// const log = Logger('api/tts').log

export const getTTSFile = async (
  key: string,
  text: string,
  countryCode: string,
  ttsGender: string = 'NEUTRAL'
) => {
  const body = {
    audioConfig: {
      audioEncoding: 'MP3'
    },
    input: {
      text
    },
    voice: {
      languageCode: countryCode,
      ssmlGender: ttsGender
    }
  }

  // tslint:disable
  delete axios.defaults.headers.common['authorization']
  delete axios.defaults.headers.common['botId']
  // tslint:enable

  const {
    data: { audioContent }
  } = await axios.post(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`,
    body
  )

  // convert b64 to blob
  const byteCharacters = atob(audioContent)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)

  const blob = new Blob([byteArray], { type: 'audio/mp3' })
  const blobUrl = URL.createObjectURL(blob)

  return blobUrl
}



// WEBPACK FOOTER //
// ./src/api/tts.ts