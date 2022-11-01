import express, { Express, Request, response, Response } from 'express';
import { Database } from 'arangojs';
import Ajv from 'ajv';
import * as fs from 'fs';
import $RefParser from "@apidevtools/json-schema-ref-parser";
import fetch from 'node-fetch';


const db_name = "oop"
const db_user = "root"
const db_pw = "root"
const db_addr = "http://localhost:8529"

//filepath(id), key
const schemas = [
  ["/GC_META_APP", "app"],
  ["/GC_META_DATATYPE", "datatype"],
  ["/GC_META_PROP_SUBDATATYPE", "prop_subdatatype"],
  ["/GC_META_PROPERTY", "property"],
  ["/GC_META_SIMPLE_DATATYPE", "simple_datatype"],
  ["/GC_META_SUBDATATYPE", "subdatatype"],
  ["/GC_META_TYPE", "type"],
  ["/test", "test"]
]

var keys: string[] = []
const ajv = Ajv({
  loadSchema: function (uri) {
    return new Promise((resolve, reject) => {
      fetch(uri).then((res) => {
        return res.json()
      }).then((res_json) => {
        resolve(res_json)
      })
    });
  },
  logger: false
})

/*
ajv.compileAsync(schema).then(function validate(schema: string | boolean | object, data: any) {
  return ajv.validate(schema, data)
})
async function loadSchema(uri: string) {
  const res = await request.json(uri)
  if (res.statusCode >= 400) throw new Error("Loading error" + res.statusCode)
  return res.body
}
*/

//BUNDLE schemas ???

//load schemas
for(let filepath of schemas){
  //$RefParser.dereference(filepath[0]).then((schema) => {
    //ajv.addSchema(JSON.parse(fs.readFileSync(filepath[0], "utf-8")), filepath[1])
    //var schema = JSON.parse(fs.readFileSync(filepath[0], "utf-8"))
    fetch("http://localhost:5000"+filepath[0]).then((res) => {
      return res.json()
    }).then((schema) => {
      ajv.compileAsync(schema).then(function (validate){
        return ajv.validate
      })
      //add keys
      keys.push(filepath[1])
    })
  //})


}

//"http://json-schema.org/draft-07/schema" is added as meta schema by default

//connect to db
var sys_db = new Database({ url: db_addr });
sys_db = sys_db.useBasicAuth(db_user, db_pw);
sys_db.database(db_name).exists().then((val) => {
  	if(!val){
      //database does not exist 
      sys_db.createDatabase(db_name)
    }
    let db = sys_db.database(db_name)
    for(let k of keys){
      db.collection(k).exists().then((val) => {
        if(!val){
          db.createCollection(k)
        }
      })
    }
})
var db = sys_db.database(db_name)

//start REST service
const service: Express = express();
const port = 8000;
const router = express.Router();
service.use(express.json())

service.route('/validate/:tag')
  .post((req: Request, res: Response) => {
    console.log(req.params.tag)
    console.log(req.body)
    if(keys.includes(req.params.tag)){
      if(ajv.validate(req.params.tag, req.body)){
        //make sure the collection actually exists
        db.collection(req.params.tag).exists().then((val) => {
          if(val){
            db.collection(req.params.tag).save(req.body)
          }else{
            //create collection
            db.createCollection(req.params.tag)
            db.collection(req.params.tag).save(req.body)
          }
        })
        //and put the object in it
        //db.collection(req.params.tag).save(req.body)
        res.sendStatus(200)
      }else{
        //validation failed
        res.sendStatus(409)
      }
    }else{
      //tag not found
      res.sendStatus(404)
    }
  })
  .get((req: Request, res: Response) => {
    if(keys.includes(req.params.tag)){
      res.send(ajv.getSchema(req.params.tag)?.schema)
    }else{
      //tag not found
      res.sendStatus(404)
    }
  })
  .put((req: Request, res: Response) => {
    var schema = JSON.parse(JSON.stringify(req.body))
    if(ajv.validateSchema(schema)){
      if(keys.includes(req.params.tag)){
        //replace schema
        ajv.removeSchema(req.params.tag)
        ajv.addSchema(schema, req.params.tag)

        db.collection(req.params.tag).exists().then((val) => {
          if(val){
            //rename old collection to keep data
            db.collection(req.params.tag).rename(req.params.tag+"_"+Date.now())
            db.createCollection(req.params.tag)
          }else{
            //TODO might be redundant
            db.createCollection(req.params.tag)
          }
        })

        res.sendStatus(200)
      }else{
        //new schema
        ajv.addSchema(schema)
        keys.push(req.params.tag)

        //TODO might be redundant
        db.collection(req.params.tag).exists().then((val) => {
          if(val){
            //rename old collection to keep data
            db.collection(req.params.tag).rename(req.params.tag+"_"+Date.now())
            db.createCollection(req.params.tag)
          }else{
            db.createCollection(req.params.tag)
          }
        })

        res.sendStatus(200)
      }
    }else{
      //invalid schema (meta schema: "http://json-schema.org/draft-07/schema")
      res.sendStatus(409)
    }
  })
  .delete((req: Request, res: Response) => {
    if(keys.includes(req.params.tag)){
      ajv.removeSchema(req.params.tag)
      keys.splice(keys.indexOf(req.params.tag), 1)

      db.collection(req.params.tag).exists().then((val) => {
        if(val){
          //rename old collection to keep data
          db.collection(req.params.tag).rename(req.params.tag+"_"+Date.now())
        }else{
          //TODO redundant
        }
      })

      res.sendStatus(200)
    }else{
      res.sendStatus(404)
    }
  })

service.get('/reload', (req: Request, res: Response) => {
    ajv.removeSchema()
    keys = []
    for(let filepath of schemas){
      ajv.addSchema(JSON.parse(fs.readFileSync(filepath[0], "utf-8")), filepath[1])
      keys.push(filepath[1])
    }
  })

//get /loaded_schemas -> gibt alle ids der geladenen schemas zurück

service.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});




