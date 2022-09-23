import json
from types import SimpleNamespace

from simple_datatype import simple_datatype
data = '{"name": "integer"}'
x = json.loads(data)
print(x["name"])
y = simple_datatype(**x)
print(type(y))
print(y.test())





