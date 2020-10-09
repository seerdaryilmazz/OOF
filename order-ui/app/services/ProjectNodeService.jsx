import * as axios from 'axios';

export class ProjectNodeService {

    static getProjectNode(code, type){
        return axios.get('/order-template-service/template-node/' + code + '?type=' + type);
    }

    static activateProjectNode(code){
        return axios.put("/order-template-service/template-node/" + code + "/activate");
    }
}