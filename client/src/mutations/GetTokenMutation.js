/*
 * Created by jemo on 2018.11.13 21:48:03
 * Maintained by jeme from 2018.11.13 to now
 * get token mutation
 */

import { graphql, commitMutation } from 'react-relay'

const mutation = graphql`
  mutation GetTokenMutation($input: GetTokenInput!) {
    getToken(input: $input) {
      getTokenResult {
        error
        message
        phone
        token
      }
    }
  }
`

const commit = ({
  environment,
  phone,
  password,
  onCompleted,
  onError,
}) => {
  return commitMutation(
    environment,
    {
      mutation,
      variables: {
        input: {
          clientMutationId: '333',
          phone,
          password,
        },
      },
      onCompleted,
      onError,
    },
  )
}

export default { commit }
