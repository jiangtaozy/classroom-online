/*
 * Created by jemo on 2018-8-9.
 * gorethink simple example
 * https://github.com/GoRethink/gorethink/wiki/Simple-Example
 */

package main

import (
  "encoding/json"
  "fmt"

  r "github.com/dancannon/gorethink"
)

var session *r.Session

type Person struct {
  Id string `gorethink:"id,omitempty"`
  Name string `gorethink:"name"`
  Place string `gorethink:"place"`
}

func init() {
  var err error
  session, err = r.Connect(r.ConnectOpts{
    Address: "localhost:28015",
    Database: "test",
  })
  if err != nil {
    fmt.Println(err)
    return
  }
}

func main() {
  createTable()

  id := insertRecord()

  if id != "" {
    updateRecord(id)
  }

  fetchOneRecord()

  recordCount()

  fetchAllRecords()

  if id != "" {
    deleteRecord(id)
  }
}

func createTable() {
  result, err := r.DB("test").TableCreate("people").RunWrite(session)
  if err != nil {
    fmt.Println(err)
  }
  printStr("*** Create table result: ***")
  printObj(result)
  printStr("\n")
}

func insertRecord() string {
  var data = map[string]interface{}{
    "Name": "David Davidson",
    "Place": "Somewhere",
  }

  result, err := r.Table("people").Insert(data).RunWrite(session)
  if err != nil {
    fmt.Println(err)
    return ""
  }

  printStr("*** Insert result: ***")
  printObj(result)
  printStr("\n")

  return result.GeneratedKeys[0]
}

func updateRecord(id string) {
  var data = map[string]interface{}{
    "Name": "Steve Stevenson",
    "Place": "Anywhere",
  }

  result, err := r.Table("people").Get(id).Update(data).RunWrite(session)
  if err != nil {
    fmt.Println(err)
    return
  }

  printStr("*** Update result: ***")
  printObj(result)
  printStr("\n")
}

func fetchOneRecord() {
  cursor, err := r.Table("people").Run(session)
  if err != nil {
    fmt.Println(err)
    return
  }

  var person interface{}
  cursor.One(&person)
  cursor.Close()

  printStr("*** Fetch one record: ***")
  printObj(person)
  printStr("\n")
}

func recordCount() {
  cursor, err := r.Table("people").Count().Run(session)
  if err != nil {
    fmt.Println(err)
    return
  }
  var cnt int
  cursor.One(&cnt)
  cursor.Close()

  printStr("*** Count: ***")
  printObj(cnt)
  printStr("\n")
}

func fetchAllRecords() {
  rows, err := r.Table("people").Run(session)
  if err != nil {
    fmt.Println(err)
    return
  }

  var persons []Person
  err2 := rows.All(&persons)
  if err2 != nil {
    fmt.Println(err2)
    return
  }

  printStr("*** Fetch all rows: ***")
  for _, p := range persons {
    printObj(p)
  }
  printStr("\n")
}

func deleteRecord(id string) {
  result, err := r.Table("people").Get(id).Delete().Run(session)
  if err != nil {
    fmt.Println(err)
    return
  }

  printStr("*** Delete result: ***")
  printObj(result)
  printStr("\n")
}

func printStr(v string) {
  fmt.Println(v)
}

func printObj(v interface{}) {
  vBytes, _ := json.Marshal(v)
  fmt.Println(string(vBytes))
}
