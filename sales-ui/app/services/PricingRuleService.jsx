
import axiosInstance from 'susam-components/services/AxiosUtils';

const axios = axiosInstance();
export class PricingRuleService {

    static listLookups(lookup, params){
        return axios.get(`/pricing-rule-service/lookup/${lookup}`, {params: params})
    }

    static listPayweight(){
        return axios.get(`/pricing-rule-service/payweight`);
    }

    static deletePayweight(id){
        return axios.delete(`/pricing-rule-service/payweight/${id}`);
    }

    static savePayweight(payweight){
        if(payweight.id){
            return axios.put(`/pricing-rule-service/payweight/${payweight.id}`,payweight);
        } else {
            return axios.post(`/pricing-rule-service/payweight`, payweight);
        }
    }

    static savePrices(prices) {
        return axios.post(`/pricing-rule-service/price/bulk`, prices);
    }

    static listPriceByTariffGroup(tariffGroupCode){
        return axios.get(`/pricing-rule-service/price/by-tariffGroup`, {params: {code: tariffGroupCode}});
    }

    static listPriceByTariff(tariffCodes){
        return axios.post(`/pricing-rule-service/price/by-tariff`, tariffCodes);
    }

    static listTariffGroup(){
        return axios.get(`/pricing-rule-service/tariff-group`);
    }

    static saveTariffGroup(tariffGroup){
        if(tariffGroup.id){
            return axios.put(`/pricing-rule-service/tariff-group/${tariffGroup.id}`, tariffGroup);
        } else {
            return axios.post(`/pricing-rule-service/tariff-group`, tariffGroup);
        }
    }
}