import axiosInstance from 'susam-components/services/AxiosUtils';
const axios = axiosInstance();
export class ConfigurationManagementLookupService {
    static list(name){
        return axios.get(`/configuration-management-service/lookup/${name}`);
    }
}

export class ConfigurationManagementKeyService {
    static save(configurationKey){
        if(configurationKey.id){
            return axios.put(`/configuration-management-service/configuration-key/${configurationKey.id}`, configurationKey);
        } else {
            return axios.post(`/configuration-management-service/configuration-key`, configurationKey);
        }
    }

    static get(id){
        return axios.get(`/configuration-management-service/configuration-key/${id}`);
    }

    static list(){
        return axios.get(`/configuration-management-service/configuration-key`);
    }
}

export class ConfigurationManagementService {
    static save(configuration){
        if(configuration.id){
            return axios.put(`/configuration-management-service/configuration/${configuration.id}`, configuration);
        } else {
            return axios.post(`/configuration-management-service/configuration`, configuration);
        }
    }

    static delete(id){
        return axios.delete(`/configuration-management-service/configuration/${id}`);
    }

    static saveBulk(configurations){
        return axios.post(`/configuration-management-service/configuration/bulk`, configurations);
    }

    static get(id){
        return axios.get(`/configuration-management-service/configuration/${id}`);
    }

    static getDefault(key){
        return axios.get(`/configuration-management-service/configuration/default${key && '/'+key}`);
    }

    static list(params){
        return axios.get(`/configuration-management-service/configuration`, {params: params});
    }
}