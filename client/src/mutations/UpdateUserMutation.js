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
        avatar
        introduction
      }
    }
  }
`

const commit = ({
  nickname,
  introduction,
  file,
  filekey,
  token,
  clientMutationId,
  environment,
  onCompleted,
  onError,
}) => {
  return commitMutation(
    environment,
    {
      mutation,
      variables: {
        input: {
          ...(nickname && {nickname}),
          ...(introduction && {introduction}),
          ...(filekey && {filekey}),
          token,
          clientMutationId,
        },
      },
      ...(file && {
        uploadables: {
          file,
        },
      }),
      onCompleted,
      onError,
    },
  )
}

export default { commit }
