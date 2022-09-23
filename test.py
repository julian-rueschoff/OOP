import json
from GC_META import simple_datatype

data = '{"name": "integer"}'
x = json.loads(data)
print(x["name"])
y = simple_datatype(**x)
print(type(y))
print(y.getName())
print(y.name)





