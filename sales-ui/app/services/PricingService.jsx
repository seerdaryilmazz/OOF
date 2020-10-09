import axiosInstance from 'susam-components/services/AxiosUtils';

const axios = axiosInstance();
export class PricingService {

    static listLookups(lookup){
        return axios.get(`/pricing-service/lookup/${lookup}`);
    }

    static get(path, id) {
        return axios.get(`/pricing-service/${path}/${id}`);
    }

    static list(path, subsidiaryId){
        return axios.get(`/pricing-service/${path}`, {params: {'subsidiary.id': subsidiaryId}});
    }

    static save(path, value){
        if(value.id){
            return axios.put(`/pricing-service/${path}/${value.id}`, value);
        } else {
            return axios.post(`/pricing-service/${path}`, value);
        }
    }

    static delete(path, id){
        return axios.delete(`/pricing-service/${path}/${id}`);
    }

    static query(path, subsidiaryId, parameters){
        return axios.post(`/pricing-service/${path}/query`, parameters, {params: {'subsidiary.id': subsidiaryId}});
    }

    static saveBulk(path, value){
        return axios.post(`/pricing-service/${path}/bulk`, value)
    }

    static seachCalculationLog(params, query){
        return axios.post(`/pricing-service/calculate/log/search`, query, {params});
    }
}