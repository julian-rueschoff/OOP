
import requests
from requests import Response
from jsonschema import validate
from jsonschema import ValidationError
import json

myobj = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "app",
    "title": "GC_META_APP",
    "description": "",
    "type": "object",
    "version": "1.0",
    "oneOf": [
        {"properties": {"name": {"const": "basis"}}},
        {"properties": {"name": {"const": "sw"}}},
        {"properties": {"name": {"const": "test"}}}
    ],
    "required": ["name"]
}

subdatatype = { 
    "datatype": { "name": "physical" },
    "name": "string",
    "simple_datatype": { "name": "string" }
 }

datatype = {
    "name": "physical"
}

simple_datatype = {
    "name": "string"
}

property = {
    "name": "class_generate_reference_join", 
    "simple_datatype": {"name": "integer"}, 
    "type": {"name": "class"}
}

prop_subdatatype = {
  "prop": {
    "name": "field_datatype",
    "simple_datatype": {
      "name": "string"
    },
    "type": {
      "name": "visibility"
    },
    "description": "cillum tempor sed proident",
    "for_import": 0,
    "internal": 0,
    "is_reference": 0,
    "active": 1,
    "for_export": 1,
    "position": 25
  },
  "subdatatype": {
    "datatype": {
      "name": "join",
      "active": 1
    },
    "name": "insert",
    "simple_datatype": {
      "name": "date"
    }
  },
  "app": {
    "name": "basis"
  },
  "datatype": {
    "name": "geometry",
    "position": 2,
    "active": 1
  }
}


app = {
    "name": "test"
}


url = 'http://localhost:8000/validate/app'
x = requests.post(url, json=app)#409
print(x.status_code)
x = requests.get(url)#200
print(x.status_code)
x = requests.put(url, json=myobj)#200
print(x.status_code)
x = requests.get(url)#200
print(x.status_code)
x = requests.post(url, json=app)#200
print(x.status_code)
'''
with open("GC_META/GC_META_SUBDATATYPE.schema.json", "r") as file:
    schema_subdatatype = json.loads(file.read())
file.close()
with open("GC_META/GC_META_DATATYPE.schema.json", "r") as file:
    schema_datatype = json.loads(file.read())
file.close()
with open("GC_META/GC_META_SIMPLE_DATATYPE.schema.json", "r") as file:
    schema_simple_datatype = json.loads(file.read())
file.close()
with open("GC_META/GC_META_PROPERTY.schema.json", "r") as file:
    schema_property = json.loads(file.read())
file.close()
with open("GC_META/GC_META_PROP_SUBDATATYPE.schema.json", "r") as file:
    schema_prop_subdatatype = json.loads(file.read())
file.close()
with open("tmp", "w") as file:
    try: 
        validate(instance=prop_subdatatype, schema=schema_prop_subdatatype)
    except ValidationError as v:
        file.write(str(v))
'''


#subdatatype