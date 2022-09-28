
def insert(property_name: list, subdatatype: list, app: list, datatype: list, default_string_value: list, default_integer_value: list, default_date_value: list, default_float_value: list):
    tmp = []
    with open("C:\OOP\GC_META\GC_META_PROP_SUBDATATYPE.schema.json", "r") as file:
        for line in file:
            if line == "    ],\n":
                for i in range(len(property_name)):
                    if property_name[i] != "null": 
                        property_name[i] = "\""+property_name[i]+"\""
                    if subdatatype[i] != "null":
                        subdatatype[i] = "\""+subdatatype[i]+"\""
                    if app[i] != "null":
                        app[i] = "\""+app[i]+"\""
                    if datatype[i] != "null":
                        datatype[i] = "\""+datatype[i]+"\""
                    if default_string_value[i] != "null":
                        default_string_value[i] = "\""+default_string_value[i]+"\""
                    template = '{"properties": {"property_name": {"const": property_name_p}, "subdatatype": {"$ref": "http://localhost:5000/GC_META_SUBDATATYPE", "properties": {"name": {"const": subdatatype_p}}}, "app": {"$ref": "http://localhost:5000/GC_META_APP", "properties": {"name": {"const": app_p}}}, "datatype": {"$ref": "http://localhost:5000/GC_META_DATATYPE", "properties": {"name": {"const": datatype_p}}}, "default_string_value": {"const": default_string_value_p}, "default_integer_value": {"const": default_integer_value_p}, "default_date_value": {"const": default_date_value_p}, "default_float_value": {"const": default_float_value_p}}},'
                    template = template.replace('property_name_p', property_name[i])
                    template = template.replace('subdatatype_p', subdatatype[i])
                    template = template.replace('app_p', app[i])
                    template = template.replace('datatype_p', datatype[i])
                    template = template.replace('default_string_value_p', default_string_value[i])
                    template = template.replace('default_integer_value_p', default_integer_value[i])
                    template = template.replace('default_date_value_p', default_date_value[i])
                    template = template.replace('default_float_value_p', default_float_value[i])
                    new_line = "        " + template + "\n"
                    tmp.append(new_line)
            tmp.append(line)
    file.close()
    with open("C:\OOP\GC_META\GC_META_PROP_SUBDATATYPE.schema.json", "w") as file:
        for line in tmp:
            file.write(line)
    file.close()

def read_prop_subdatatypes():
    property_names = []
    subdatatypes = []
    apps = []
    datatypes = []
    default_string_values = []
    default_integer_values = []
    default_date_values = []
    default_float_values = []
    with open("prop_subdatatypes.json", "r") as file:
        for line in file:
            if "property_name" in line:
                tmp = line.split(":")
                property_names.append(tmp[1].split(",")[0].replace('"', '').replace(" ", ""))
                subdatatypes.append(tmp[2].split(",")[0].replace('"', '').replace(" ", ""))
                apps.append(tmp[3].split(",")[0].replace('"', '').replace(" ", ""))
                datatypes.append(tmp[4].split(",")[0].replace('"', '').replace(" ", ""))
                default_string_values.append(tmp[5].split(",")[0].replace('"', '').replace(" ", ""))
                default_integer_values.append(tmp[6].split(",")[0].replace('"', '').replace(" ", ""))
                default_date_values.append(tmp[7].split(",")[0].replace('"', '').replace(" ", ""))
                default_float_values.append(tmp[8].split(",")[0].replace('"', '').replace(" ", "").replace("}", ""))
    file.close()
    return property_names, subdatatypes, apps, datatypes, default_string_values, default_integer_values, default_date_values, default_float_values

property_names, subdatatypes, apps, datatypes, default_string_values, default_integer_values, default_date_values, default_float_values = read_prop_subdatatypes()
insert(property_names, subdatatypes, apps, datatypes, default_string_values, default_integer_values, default_date_values, default_float_values)













