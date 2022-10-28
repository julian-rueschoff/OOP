import * as fs from 'fs';

export class Tag {
    "id": string;
    "filepath": string;
    "schema": string;

    constructor(id: string, filepath?: string, schema?: string){
        this.id = id
        if (filepath){
            this.filepath = filepath
        }else{
            this.filepath = "GC_META/" + this.id
        }
        if (schema){
            this.schema = schema
        }else{
            this.schema = fs.readFileSync(this.filepath, "utf-8")
        }
    }
}
