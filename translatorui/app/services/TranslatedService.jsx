import * as axios from 'axios';

export class TranslatedService {

    static delete(id){
        return axios.delete(`/translator-service/translated/${id}`)
    }
    
    static save(translation){
        if(translation.id){
            return axios.put(`/translator-service/translated/${translation.id}`, translation);
        } else {
            return axios.post('/translator-service/translated', translation);
        }
    }

    static search(filter) {
        return axios.get('/translator-service/translated/search', {params: filter});
    }
}