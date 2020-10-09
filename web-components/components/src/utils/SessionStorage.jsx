
export class SessionStorage {

    constructor(app){
        this.app = app;
    }

    buildKey(key){
        return "oneorder." + this.app + "." + key;
    }
    write(key, value){
        sessionStorage.setItem(this.buildKey(key), typeof value === 'object' ? JSON.stringify(value) : value);
    }
    read(key){
        return sessionStorage.getItem(this.buildKey(key));
    }
}