"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const arangojs_1 = require("arangojs");
const ajv_1 = __importDefault(require("ajv"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const json_schema_faker_1 = require("json-schema-faker");
require("ajv-keywords");
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'REST API for schema validation of OOP',
        version: '1.0.0',
        description: ''
    },
    servers: [
        {
            url: 'http://0.0.0.0:8000',
            description: 'Development server',
        },
    ]
};
const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['swagger.yaml'],
};
const swaggerSpec = swaggerJSDoc(options);
const db_name = "oop";
const db_user = "root";
const db_pw = "root";
const db_addr = "http://arangodb:8529"; //"http://localhost:8529"
const schema_service_addr = "http://schema_service:5000/"; //"http://localhost:5000/"
//schema ids (need to be equal to url)
const schemas = [
    "app",
    "datatype",
    "prop_subdatatype",
    "property",
    "simple_datatype",
    "subdatatype",
    "type",
    "test"
];
var keys = [];
const ajv = new ajv_1.default({
    loadSchema: function (uri) {
        return new Promise((resolve, reject) => {
            (0, node_fetch_1.default)(uri).then((res) => {
                return res.json();
            }).then((res_json) => {
                resolve(res_json);
            });
        });
    },
    logger: false
});
//load schemas
for (let s of schemas) {
    (0, node_fetch_1.default)(schema_service_addr + s).then((res) => {
        return res.json();
    }).then((schema) => {
        ajv.compileAsync(schema).then(function (validate) {
            return ajv.validate;
        });
        //add keys
        keys.push(s);
    });
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
//start REST service
const service = (0, express_1.default)();
const port = 8000;
service.use(express_1.default.json());
service.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
            res.sendStatus(200);
        }
        else {
            console.log(ajv.errorsText());
            //validation failed
            res.sendStatus(409);
        }
    }
    else {
        //tag not found
        res.sendStatus(404);
    }
})
    .get((req, res) => {
    var _a;
    if (keys.includes(req.params.tag)) {
        res.status(200).send((_a = ajv.getSchema(req.params.tag)) === null || _a === void 0 ? void 0 : _a.schema);
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
    for (let s of schemas) {
        (0, node_fetch_1.default)(schema_service_addr + s).then((res) => {
            return res.json();
        }).then((schema) => {
            ajv.compileAsync(schema).then(function (validate) {
                return ajv.validate;
            });
            //add keys
            keys.push(s);
        });
    }
    res.sendStatus(200);
});
service.get("/example/:tag", (req, res) => {
    var _a;
    if (keys.includes(req.params.tag)) {
        var schema = JSON.parse(JSON.stringify((_a = ajv.getSchema(req.params.tag)) === null || _a === void 0 ? void 0 : _a.schema));
        json_schema_faker_1.JSONSchemaFaker.resolve(schema).then((o) => {
            res.status(200).send(o);
        });
    }
    else {
        res.sendStatus(404);
    }
});
service.get('/schemas', (req, res) => {
    res.status(200).send(keys);
});
service.get('/debug', (req, res) => {
    console.log(ajv)
    res.sendStatus(200)
});
service.listen(port, () => {
    console.log(`running at https://localhost:${port}`);
});