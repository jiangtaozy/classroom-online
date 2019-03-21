/*
 * Maintained by jemo from 2018.9.16 to now
 * Created by jemo on 2018.9.16
 * relay environment
 */

import {
  Environment,
  Network,
  RecordSource,
  Store,
} from 'relay-runtime'
import axios from 'axios'

function fetchQuery(
  operation,
  variables,
  cacheConfig,
  uploadables,
) {
  let request
  if(uploadables) {
    if(!window.FormData) {
      throw new Error('Uploading files without `FormData` not supported.')
    }
    const formData = new FormData()
    formData.append('query', operation.text)
    formData.append('variables', JSON.stringify(variables))
    Object.keys(uploadables).forEach(key => {
      if(Object.prototype.hasOwnProperty.call(uploadables, key)) {
        formData.append(key, uploadables[key])
      }
    })
    request = formData
  } else {
    request = {
      query: operation.text,
      variables,
    }
  }
  return axios.post(
    'https://192.168.1.106:3001/graphql',
    request
  ).then(response => {
    return response.data
  })
}

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
})

export default environment
