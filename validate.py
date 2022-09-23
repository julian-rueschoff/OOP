import json 
from jsonschema import validate 


with open("/etc/prop_subdatatype.json", "r") as file:
    instance = json.load(file)
    file.close()

with open("/GC_META/GC_META_PROP_SUBDATATYPE.schema.json") as file:
    schema = json.load(file)
    file.close()

print(validate(instance=instance, schema=schema))