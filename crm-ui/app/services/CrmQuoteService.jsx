import * as axios from "axios";
import axiosInstance from 'susam-components/services/AxiosUtils';

const _axiosInstance = axiosInstance();
export class CrmQuoteService {

    static getQuoteById(id) {
        return axios.get(`/crm-quote-service/quote/${id}`);
    }

    static saveQuote(data, params){
        if(data.id){
            return axios.put(`/crm-quote-service/quote/${data.id}`, data, {params: params});
        }else{
            return axios.post("/crm-quote-service/quote", data, {params: params});
        }
    }

    static updateNotes(id, data) {
        return axios.put(`/crm-quote-service/quote/${id}/notes`, data);
    }

    static updateDocuments(id, data) {
        return axios.put(`/crm-quote-service/quote/${id}/documents`, data);
    }

    static calculatePrices(data){
        return _axiosInstance.post('/crm-quote-service/quote/calculatePrices', data);
    }

    static checkPriceValidity(billingItemCode, data) {
        return axios.post(`/crm-quote-service/quote/validate/price/${billingItemCode}`, data);
    }

    static getExchangeRate(data, params){
        return axios.post("/crm-quote-service/quote/price/exchangePrice", data, params);
    }

    static calculateBundledProductExchangeAmount(data, params) {
        return axios.post("/crm-quote-service/quote/bundledProduct/exchange-amount", data, params);
    }

    static determineBillingItems(data) {
        return axios.post("/crm-quote-service/quote/determineBillingItems", data);
    }

    static calculatePayWeight(data) {
        return axios.post("/crm-quote-service/quote/calculatePayWeight", data);
    }

    static calculateChargeableWeight(data){
        return axios.post("/crm-quote-service/quote/calculateChargeableWeight", data);
    }

    static emailQuote(quoteId, data) {
        return axios.post("/crm-quote-service/quote/" + quoteId + "/emailQuote", data);
    }

    static generateBundledProductListTemplateDownloadUrl() {
        return "/crm-quote-service/quote/downloadBundledProductListTemplate";
    }

    static convertExcelToBundledProductList(serviceAreaCode, data) {
        return axios.post("/crm-quote-service/quote/convertExcelToBundledProductList?serviceAreaCode=" + serviceAreaCode, data);
    }

    static findSpotQuotePdfSettings() {
        return axios.get("/crm-quote-service/spot-quote-pdf-setting");
    }

    static findSpotQuotePdfSetting(id) {
        return axios.get(`/crm-quote-service/spot-quote-pdf-setting/${id}`);
    }

    static saveSpotQuotePdfSetting(data) {
        if (!_.isNil(data.id)) {
            return axios.put(`/crm-quote-service/spot-quote-pdf-setting/${data.id}`, data);
        } else {
            return axios.post("/crm-quote-service/spot-quote-pdf-setting", data);
        }
    }

    static deleteSpotQuotePdfSetting(id) {
        return axios.delete(`/crm-quote-service/spot-quote-pdf-setting/${id}`);
    }

    static generateFileDownloadUrl(type, id) {
        return '/crm-quote-service/download/' + type + '/' + id;
    }

    static searchQuotesForHomePage(params) {
        return axios.get("/crm-quote-service/quote/searchForHomePage", {params: params});
    }

    static searchQuotes(params) {
        return axios.get("/crm-quote-service/quote/searchQuotes", {params: params});
    }

    static getSpotQuoteHomePageStatistics() {
        return axios.get("/crm-quote-service/quote/spotQuoteHomePageStatistics");
    }

    static getLongTermQuoteHomePageStatistics() {
        return axios.get("/crm-quote-service/quote/longTermQuoteHomePageStatistics");
    }

    static checkQuotesByPotential(potentialId){
        return axios.get(`/crm-quote-service/quote/quotes-by-potential/${potentialId}`);
    }

    static getQuotesByAttribute(params){
        return axios.get(`/crm-quote-service/quote/quotes-by-attribute`, {params: params});
    }
}

export class BillingItemService {
    static get(id){
        return axios.get(`/crm-quote-service/lookup/billing-item/${id}`);
    }
    static list(){
        return axios.get(`/crm-quote-service/lookup/billing-item`);
    }

    static save(billingItem){
        if(billingItem.id){
            return axios.put(`/crm-quote-service/lookup/billing-item/${billingItem.id}`, billingItem);
        } else {
            return axios.post(`/crm-quote-service/lookup/billing-item`, billingItem);
        }
    }
}

export class ServiceTypeService {
     static get(id){
        return axios.get(`/crm-quote-service/lookup/service-type/${id}`);
    }
    
    static list(category, serviceArea){
        return axios.get(`/crm-quote-service/lookup/service-type`, {params: {category: category, serviceArea: serviceArea}});
    }

    static save(serviceType){
        if(serviceType.id){
            return axios.put(`/crm-quote-service/lookup/service-type/${serviceType.id}`, serviceType);
        } else {
            return axios.post(`/crm-quote-service/lookup/service-type`, serviceType);
        }
    }
}