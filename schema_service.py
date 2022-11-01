from flask import Flask, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/GC_META_SIMPLE_DATATYPE", methods=["GET"])
def gc_meta_simple_datatype():
    return send_file("GC_META/GC_META_SIMPLE_DATATYPE.schema.json")

@app.route("/GC_META_APP", methods=["GET"])
def gc_meta_app():
    return send_file("GC_META/GC_META_APP.schema.json")

@app.route("/GC_META_DATATYPE", methods=["GET"])
def gc_meta_datatype():
    return send_file("GC_META/GC_META_DATATYPE.schema.json")

@app.route("/GC_META_SUBDATATYPE", methods=["GET"])
def gc_meta_subdatatype():
    return send_file("GC_META/GC_META_SUBDATATYPE.schema.json")

@app.route("/GC_META_PROP_SUBDATATYPE", methods=["GET"])
def gc_meta_prop_subdatatype():
    return send_file("GC_META/GC_META_PROP_SUBDATATYPE.schema.json")

#property
@app.route("/GC_META_PROPERTY", methods=["GET"])
def gc_meta_property():
    return send_file("GC_META/GC_META_PROPERTY.schema.json")
#type
@app.route("/GC_META_TYPE", methods=["GET"])
def gc_meta_type():
    return send_file("GC_META/GC_META_TYPE.schema.json")

#test
@app.route("/test", methods=["GET"])
def gc_meta_test():
    return send_file("GC_META/test.schema.json")

if __name__ == '__main__':
 app.run()