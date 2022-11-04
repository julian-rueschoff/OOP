import json


with open("etc/properties.json", "r") as file:
    data = file.read()
file.close()
j_file = json.loads(data)
tmp = []
for property in j_file['properties']:
    template = '{"properties": {"name": {"const": "name_p"},"simple_datatype": {"$ref": "http://localhost:5000/GC_META_SIMPLE_DATATYPE","properties": {"name": {"const": "simple_datatype_p"}}},"type": {"$ref": "http://localhost:5000/TYPE","properties": {"name": {"const": "type_p"}}},"internal": {"const": internal_p},"position": {"const": position_p},"description": "string","active": {"const": active_p},"for_export": {"const": export_p},"for_import": {"const": import_p},"is_reference": {"const": is_reference_p}}}'
    template = template.replace("name_p", property["name"])
    template = template.replace("simple_datatype_p", property["simple_datatype"])
    template = template.replace("type_p", property["type"])

    template = template.replace("internal_p", str(property["internal"]))
    template = template.replace("position_p", str(property["position"]))
    template = template.replace("active_p", str(property["active"]))
    template = template.replace("export_p", str(property["for_export"]))
    template = template.replace("import_p", str(property["for_import"]))
    template = template.replace("is_reference_p", str(property["is_reference"]))
    template = template.replace("None", "null")
    template = "" + template + "\n"
    tmp.append(template)

with open("GC_META/GC_META_PROPERTY.schema.json", "w") as file:
    for t in tmp:
        file.write(t)
file.close()


