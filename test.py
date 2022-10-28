
import requests



url = 'http://localhost:8000/validate/prop_subdatatype'
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

myobj2 = { "name": "test" }

x = requests.post(url, json=myobj2)
print(x.content)
x = requests.get(url)
print(x.content)
x = requests.put(url, json=myobj)
print(x.content)
x = requests.get(url)
print(x.content)
x = requests.post(url, json=myobj2)
print(x.content)


