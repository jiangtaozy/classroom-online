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
        backgroundImage
        isAssistant
      }
    }
  }
`

const commit = ({
  nickname,
  introduction,
  isAssistant,
  file,
  fileKey,
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
          ...((isAssistant !== undefined) && {isAssistant}),
          ...(fileKey && {fileKey}),
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
