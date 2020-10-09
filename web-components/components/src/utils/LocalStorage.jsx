
export class LocalStorage {

    constructor(app){
        this.app = app;
    }

    buildKey(key){
        return "oneorder." + this.app + "." + key;
    }
    write(key, value){
        localStorage.setItem(this.buildKey(key), typeof value === 'object' ? JSON.stringify(value) : value);
    }
    read(key){
        return localStorage.getItem(this.buildKey(key));
    }
}