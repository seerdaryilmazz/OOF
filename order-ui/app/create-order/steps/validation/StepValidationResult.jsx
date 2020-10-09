import _ from 'lodash';

export class StepValidationResult{
    messages = [];
    itemResults = [];

    hasError(){
        return this.messages.length > 0 || _.filter(this.itemResults, item => item.messages.length > 0).length > 0;
    }
    addMessage(message){
        this.messages.push(message);
    }
    addItemResult(result){
        this.itemResults.push(result);
    }
    getItemResult(index){
        return this.itemResults[index];
    }
}