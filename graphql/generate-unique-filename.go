/*
 * Maintained by jemo from 2019.2.18
 * Created by jemo on 2019.2.18
 * generate unique filename
 */

package graphql

import (
  "math/rand"
  "encoding/hex"
)

func GenerateUniqueFilename(prefix, suffix string) string {
  randBytes := make([]byte, 16)
  rand.Read(randBytes)
  return prefix + hex.EncodeToString(randBytes) + suffix
}
