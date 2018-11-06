/*
 * Created by jemo on 2018-9-27.
 * get validation code mutation
 */

import { graphql, commitMutation } from 'react-relay'

const mutation = graphql`
  mutation GetValidationCodeMutation($input: GetValidationCodeInput!) {
    getValidationCode(input: $input) {
      result {
        error
        message
      }
    }
  }
`

const commit = (
  environment,
  phone,
  onCompleted,
  onError,
) => {
  return commitMutation(
    environment,
    {
      mutation,
      variables: {
        input: {
          clientMutationId: '111',
          phone,
        },
      },
      onCompleted,
      onError,
    }
  )
}

export default { commit }
