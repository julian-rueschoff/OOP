"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const arangojs_1 = require("arangojs");
const ajv_1 = __importDefault(require("ajv"));
const fs = __importStar(require("fs"));
const db_name = "oop";
const db_user = "root";
const db_pw = "root";
const db_addr = "http://localhost:8529";
//filepath(id), key
const schemas = [
    ["GC_META/GC_META_APP.schema.json", "app"],
    ["GC_META/GC_META_DATATYPE.schema.json", "datatype"],
    ["GC_META/GC_META_PROP_SUBDATATYPE.schema.json", "prop_subdatatype"],
    ["GC_META/GC_META_PROPERTY.schema.json", "property"],
    ["GC_META/GC_META_SIMPLE_DATATYPE.schema.json", "simple_datatype"],
    ["GC_META/GC_META_SUBDATATYPE.schema.json", "subdatatype"],
    ["GC_META/GC_META_TYPE.schema.json", "type"]
];
var keys = [];
const ajv = (0, ajv_1.default)();
//load schemas
for (let filepath of schemas) {
    ajv.addSchema(JSON.parse(fs.readFileSync(filepath[0], "utf-8")), filepath[1]);
    //add keys
    keys.push(filepath[1]);
}
//"http://json-schema.org/draft-07/schema" is added as meta schema by default
//connect to db
var sys_db = new arangojs_1.Database({ url: db_addr });
sys_db = sys_db.useBasicAuth(db_user, db_pw);
sys_db.database(db_name).exists().then((val) => {
    if (!val) {
        //database does not exist 
        sys_db.createDatabase(db_name);
    }
    let db = sys_db.database(db_name);
    for (let k of keys) {
        db.collection(k).exists().then((val) => {
            if (!val) {
                db.createCollection(k);
            }
        });
    }
});
var db = sys_db.database(db_name);
//create collections if not already in db
/*for(let k of keys){
  db.collection(k).exists().then((val) => {
    if(!val){
      db.createCollection(k)
    }
  })
}*/
//start REST service
const service = (0, express_1.default)();
const port = 8000;
const router = express_1.default.Router();
service.use(express_1.default.json());
service.route('/validate/:tag')
    .post((req, res) => {
    if (keys.includes(req.params.tag)) {
        if (ajv.validate(req.params.tag, req.body)) {
            //make sure the collection actually exists
            db.collection(req.params.tag).exists().then((val) => {
                if (val) {
                    db.collection(req.params.tag).save(req.body);
                }
                else {
                    //create collection
                    db.createCollection(req.params.tag);
                    db.collection(req.params.tag).save(req.body);
                }
            });
            //and put the object in it
            //db.collection(req.params.tag).save(req.body)
            res.sendStatus(200);
        }
        else {
            //validation failed
            res.sendStatus(409);
        }
    }
    else {
        //tag not found
        //res.sendStatus(404)
    }
})
    .get((req, res) => {
    var _a;
    if (keys.includes(req.params.tag)) {
        res.send((_a = ajv.getSchema(req.params.tag)) === null || _a === void 0 ? void 0 : _a.schema);
    }
    else {
        //tag not found
        res.sendStatus(404);
    }
})
    .put((req, res) => {
    var schema = JSON.parse(JSON.stringify(req.body));
    if (ajv.validateSchema(schema)) {
        if (keys.includes(req.params.tag)) {
            //replace schema
            ajv.removeSchema(req.params.tag);
            ajv.addSchema(schema, req.params.tag);
            db.collection(req.params.tag).exists().then((val) => {
                if (val) {
                    //rename old collection to keep data
                    db.collection(req.params.tag).rename(req.params.tag + "_" + Date.now());
                    db.createCollection(req.params.tag);
                }
                else {
                    //TODO might be redundant
                    db.createCollection(req.params.tag);
                }
            });
            res.sendStatus(200);
        }
        else {
            //new schema
            ajv.addSchema(schema);
            keys.push(req.params.tag);
            //TODO might be redundant
            db.collection(req.params.tag).exists().then((val) => {
                if (val) {
                    //rename old collection to keep data
                    db.collection(req.params.tag).rename(req.params.tag + "_" + Date.now());
                    db.createCollection(req.params.tag);
                }
                else {
                    db.createCollection(req.params.tag);
                }
            });
            res.sendStatus(200);
        }
    }
    else {
        //invalid schema (meta schema: "http://json-schema.org/draft-07/schema")
        res.sendStatus(409);
    }
})
    .delete((req, res) => {
    if (keys.includes(req.params.tag)) {
        ajv.removeSchema(req.params.tag);
        keys.splice(keys.indexOf(req.params.tag), 1);
        db.collection(req.params.tag).exists().then((val) => {
            if (val) {
                //rename old collection to keep data
                db.collection(req.params.tag).rename(req.params.tag + "_" + Date.now());
            }
            else {
                //TODO redundant
            }
        });
        res.sendStatus(200);
    }
    else {
        res.sendStatus(404);
    }
});
service.get('/reload', (req, res) => {
    ajv.removeSchema();
    keys = [];
    for (let filepath of schemas) {
        ajv.addSchema(JSON.parse(fs.readFileSync(filepath[0], "utf-8")), filepath[1]);
        keys.push(filepath[1]);
    }
});
service.listen(port, () => {
    console.log(`[server]: Server is running at https://localhost:${port}`);
});
