/*
 * Maintained by jemo from 2019.10.23 to now
 * Created by jemo on 2019.10.23 16:17:42
 * Graphql handle
 */

package graphql

import (
  "io"
  "os"
  "log"
  "strings"
  "net/http"
  "encoding/json"
  "github.com/graphql-go/graphql"
)

type PostData struct {
  Query string `json:"query"`
  Variables map[string]interface{} `json:"variables"`
}

func GraphqlHandle(w http.ResponseWriter, r *http.Request) {
  contentType := r.Header.Get("Content-Type")
  contentTypeKey := strings.Split(contentType, ";")[0]
  var data PostData
  if(contentTypeKey == "application/json") {
    decoder := json.NewDecoder(r.Body)
    err := decoder.Decode(&data)
    if err != nil {
      log.Println("GraphqlHandleDecodeError, err: ", err)
      panic(err)
    }
  } else {
    r.ParseMultipartForm(32 << 20) // 32M
    multipartForm := r.MultipartForm
    data.Query = multipartForm.Value["query"][0]
    var variables map[string]interface {}
    err := json.Unmarshal([]byte(multipartForm.Value["variables"][0]), &variables)
    if err != nil {
      log.Println("GraphqlHandleJsonUnmarshalError: ", err)
    }
    data.Variables = variables
    file, handler, err := r.FormFile("file")
    if err != nil {
      log.Println("GraphqlHandlerGetFileError: ", err)
    }
    defer file.Close()
    input := data.Variables["input"].(map[string]interface{})
    fileKey := input["fileKey"].(string)
    generatedFilename := GenerateUniqueFilename(fileKey + "-", "-" + handler.Filename)
    input[fileKey] = generatedFilename
    delete(input, "fileKey")
    f, err := os.OpenFile("./upload/" + generatedFilename, os.O_WRONLY|os.O_CREATE, 0666)
    if err != nil {
      log.Println("GraphqlHandlerOpenFileError: ", err)
    }
    defer f.Close()
    io.Copy(f, file)
  }
  res := graphql.Do(graphql.Params{
    Schema: schema,
    RequestString: data.Query,
    VariableValues: data.Variables,
  })
  if len(res.Errors) > 0 {
    log.Printf("GraphqlHandleResError, res.Errors: %v\n", res.Errors)
  }
  json.NewEncoder(w).Encode(res)
}
