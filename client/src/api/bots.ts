import axios from '../util/axios'



interface IBot {
  settings: any
  logo: string
}

export const getLang = async () => {
  const { data } = await axios.get('/bots/lang')
  return data
}

export const getBot = async (id: string): Promise<IBot> => {
  const { data } = await axios.get(`/bots/${id}`)
  return data
}



