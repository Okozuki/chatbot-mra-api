import axios, { AxiosRequestConfig } from 'axios'
import { merge } from 'lodash'

import Logger from '../util/logger'
const log = Logger('Axios').log

export const axiosInstanceConfig: AxiosRequestConfig = {}

const axiosInstance = axios.create({})

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Do something before request is sent
    const c = merge({}, config, axiosInstanceConfig)
    log('axiosInstance.interceptors.request.use', c)
    return c
  },
  (error: Error) => {
    // Do something with request error
    return Promise.reject(error)
  }
)

export default axiosInstance



