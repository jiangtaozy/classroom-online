/*
 * Created by jemo on 2018-11-1 7:25
 */

import { graphql, commitMutation } from 'react-relay'

const mutation = graphql`
  mutation CreateUserMutation($input: CreateUserInput!) {
    createUser(input: $input) {
      createUserResult {
        error
        message
        token
      }
    }
  }
`

const commit = (
  environment,
  phone,
  password,
  code,
  onCompleted,
  onError,
) => {
  return commitMutation(
    environment,
    {
      mutation,
      variables: {
        input: {
          clientMutationId: '222',
          phone,
          password,
          code,
        },
      },
      onCompleted,
      onError,
    },
  )
}

export default { commit }
