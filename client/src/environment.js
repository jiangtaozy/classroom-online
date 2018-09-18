/*
 * Created by jemo on 2018-9-16.
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
) {
  return axios.post('http://localhost:3001/graphql', {
    query: operation.text,
    variables,
  }).then(response => {
    return response.data
  })
}

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
})

export default environment
