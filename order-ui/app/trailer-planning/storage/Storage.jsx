
export class Storage{
    constructor(context){
        this.context = context;
    }

    writeStorage(key, value){
        if(this.context.storage){
            this.context.storage.write(key, value);
            return true;
        }
        return false;
    }
    readStorage(key){
        if(this.context.storage){
            return this.context.storage.read(key);
        }
        return null;
    }
}