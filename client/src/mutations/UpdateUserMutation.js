/*
 * Maintained by jemo from 2018.12.25 to now
 * Created by jemo on 2018.12.25 11:03:21
 * update user mutation
 */

import { graphql, commitMutation } from 'react-relay'

const mutation = graphql`
  mutation UpdateUserMutation($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        nickname
      }
    }
  }
`

const commit = ({
  environment,
  nickname,
  id,
  token,
  onCompleted,
  onError,
}) => {
  return commitMutation(
    environment,
    {
      mutation,
      variables: {
        input: {
          nickname,
          token,
          clientMutationId: id,
        },
      },
      onCompleted,
      onError,
    },
  )
}

export default { commit }
