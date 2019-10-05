/*
 * Maintained by jemo from 2019.2.19 to now
 * Created by jemo on 2010.2.10 22:07
 * config
 */

package graphql

import (
  "os"
)

var productionUrl = "https://destpact.com"
var developmentUrl = "https://192.168.1.112:3001"

func GetUploadFilePath() string {
  developmentENV := os.Getenv("development") == "1"
  if developmentENV {
    return developmentUrl + "/upload/"
  } else {
    return productionUrl + "/upload/"
  }
}
