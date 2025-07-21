import Axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import router from '@/router.ts'

export const AXIOS_INSTANCE = Axios.create({ baseURL: '' })

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401 || error.response.status === 403) {
      return router.navigate({ to: '/auth/login' })
    }
    return Promise.reject(error)
  },
)

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source()
  const promise = AXIOS_INSTANCE({ ...config, cancelToken: source.token }).then(
    ({ data }) => data,
  )

  // @ts-ignore
  promise.cancel = source.cancel
  return promise
}

export interface ErrorType<Error> extends AxiosError<Error> {}
