import axios from '../util/axios'
import axios1 from 'axios/index';

// export const setEvent = async (payload: any) => {
//   const { data } = await axios.patch(`/events/new`, payload)
//   return data
// }

export const setEvent = async (payload: any) => {
  const { data } = await axios1.post(`${process.env.REACT_APP_API || 'https://monrepondeurautomatique.herokuapp.com/api/'}events/new`, payload)
  return data
}



// WEBPACK FOOTER //
// ./src/api/engagements.ts