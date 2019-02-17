/*
 * Maintained by jemo from 2019.2.16 to now
 * Created by jemo on 2019.2.16 20:49
 * update avatar mutation
 */

import { graphql, commitMutation } from 'react-relay'

const mutation = graphql`
  mutation UpdateAvatarMutation($input: UpdateAvatarInput!) {
    updateAvatar(input: $input) {
      user {
        avatar
      }
    }
  }
`

const commit = ({
  environment,
  file,
  clientMutationId,
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
          token,
          clientMutationId,
        },
      },
      uploadables: {
        file,
      },
      onCompleted,
      onError,
    },
  )
}

export default { commit }
