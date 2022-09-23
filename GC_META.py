
class simple_datatype:
    def __init__(self, name: str):
        self.name = name

class datatype:
    def __init__(self, name: str):
        self.name = name

class subdatatype:
    def __init__(self, datatype: datatype, name, simple_datatype: simple_datatype):
        self.datatype = datatype
        self.name = name 
        self.simple_datatype = simple_datatype

class app:
    def __init__(self, name: str):
        self.name = name

class prop_subdatatype:
    def __init__(self, property_name: str, subdatatype: subdatatype, app: app, datatype: datatype):
        self.property_name = property_name
        self.subdatatype = subdatatype
        self.app = app
        self.datatype = datatype






























