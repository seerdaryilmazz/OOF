import _ from 'lodash';

export class StorageDataUpdater{

    constructor(storage, key, handleFunction){
        this.key = key;
        this.storage = storage;
        this.handleFunction = handleFunction;
        this.data = null;
    }

    startPolling(interval){
        this.update();
        this.intervalHandle = setInterval(() => { this.update() }, interval);
    }

    clearInterval(){
        clearInterval(this.intervalHandle);
    }

    update(){
        let newData = JSON.parse(this.storage.read(this.key));
        if(!_.isEqual(this.data, newData)){
            if(this.handleFunction){
                this.handleFunction(this.data, newData);
            }
            this.data = newData;
        }
    }
}