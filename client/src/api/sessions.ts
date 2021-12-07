import axios from '../util/axios'

/**
 * @param id
 * @param payload
 * @returns { token, sessionId }
 */
export const postSessionBot = async (
  id: string,
  payload: any
): Promise<string> => {
  const { data } = await axios.post(`/session/bot/${id}`, payload)
  return data
}



// WEBPACK FOOTER //
// ./src/api/sessions.ts