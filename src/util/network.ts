import { EdgeFetchOptions, EdgeFetchResponse } from 'edge-core-js'

import { asyncWaterfall, shuffleArray } from './utils'
const INFO_SERVERS = ['https://info1.edge.app', 'https://info2.edge.app']

const DEFAULT_TIMEOUT_MS = 5000

export async function fetchWaterfall(
  servers: string[],
  path: string,
  options?: EdgeFetchOptions,
  timeout: number = DEFAULT_TIMEOUT_MS
): Promise<EdgeFetchResponse> {
  const funcs = servers.map(server => async () => {
    const result = await fetch(server + '/' + path, options)
    if (typeof result !== 'object') {
      const msg = `Invalid return value ${path} in ${server}`
      console.log(msg)
      throw new Error(msg)
    }
    return result
  })
  return await asyncWaterfall(funcs, timeout)
}

async function multiFetch(
  servers: string[],
  path: string,
  options?: EdgeFetchOptions,
  timeout: number = 5000
): Promise<EdgeFetchResponse> {
  return await fetchWaterfall(shuffleArray(servers), path, options, timeout)
}

// TODO: not used?
export const fetchInfo = async (
  path: string,
  options?: EdgeFetchOptions,
  timeout?: number
): Promise<EdgeFetchResponse> => {
  return await multiFetch(INFO_SERVERS, path, options, timeout)
}
