import * as axios from "axios";

export class SalesPriceService {
    static getPostalCodes() {
        return axios.get("/sales-price-service/postal-code");
    }
    static getPostalCodesOfRegion(region) {
        return axios.get(`/sales-price-service/region/${region.id}/postal-code`);
    }
    static getRegions() {
        return axios.get("/sales-price-service/region");
    }
    static getRegionsOfCountry(countryId) {
        return axios.get(`/sales-price-service/country/${countryId}/region`);
    }
    static deleteRegion(id) {
        return axios.delete(`/sales-price-service/region/${id}`);
    }
    static saveRegion(data){
        console.log(data);
        if(data.regionId){
            return axios.put(`/sales-price-service/region/${data.regionId}/with-postal-codes`, data);
        }else{
            return axios.post("/sales-price-service/region/with-postal-codes", data);
        }
    }

    static generatePriceTableTemplate(priceTable){
        return axios.post("/sales-price-service/price-table/generatePriceTableTemplate", priceTable);
    }

    static downloadPriceTableTemplate(filename){
        return axios.get(`/sales-price-service/price-table/downloadPriceTableTemplate?filename=${filename}`);
    }

    static uploadPriceTableTemplate(data){
        return axios.post("/sales-price-service/price-table/uploadPriceTableTemplate", data);
    }

    static getCountries() {
        return axios.get("/sales-price-service/country");
    }
    static addCountry(country) {
        return axios.post("/sales-price-service/country", country);
    }

    static getLines(){
        return axios.get("/sales-price-service/line/line-scales");
    }
    static saveLine(line){
        return axios.post("/sales-price-service/line", line);
    }
    static deleteLine(id){
        return axios.delete(`/sales-price-service/line/${id}`);
    }

    static saveLineScales(lineId, scales){
        return axios.post(`/sales-price-service/line/${lineId}/scales`, scales);
    }

    static getLineScales(lineId){
        return axios.get(`/sales-price-service/line/${lineId}/scales`);
    }

    static getDiscountTypes(){
        return axios.get("/sales-price-service/lookup/discount-type");
    }

    static savePriceTable(priceTable){
        if(priceTable.id){
            return axios.put(`/sales-price-service/price-table/${priceTable.id}`, priceTable);
        }else{
            return axios.post("/sales-price-service/price-table", priceTable);
        }
    }
    static deletePriceTable(priceTable){
        return axios.delete(`/sales-price-service/price-table/${priceTable.id}`);
    }
    static findPriceTable(Id){
        return axios.get(`/sales-price-service/price-table/${Id}`);
    }
    static findPriceTables(params){
        console.log(params);
        return axios.get("/sales-price-service/price-table", {params: params});
    }
    static findPriceTablesForExcel(params){
        return axios.get("/sales-price-service/price-table/price-tables-for-excel", {params: params});
    }
    static findPriceTablesToRegion(regionId){
        return axios.get("/sales-price-service/price-table", {params: {toRegionId: regionId}});
    }
    static findPriceTablesFromCountry(fromCountryId,toCountryId){
        return axios.get("/sales-price-service/price-table", {params: {fromCountryId: fromCountryId, toCountryId: toCountryId}});
    }
    static findPriceTablesFromRegion(regionId){
        return axios.get("/sales-price-service/price-table", {params: {fromRegionId: regionId}});
    }
    static findPriceTablesForLine(lineId){
        return axios.get("/sales-price-service/price-table", {params: {lineId: lineId}});
    }


    static getPriceTableForCalculation(fromCountry, fromPostalCode, toCountry, toPostalCode, truckLoadType, payWeight){
        return axios.get("/sales-price-service/calculate/no-log", {
            params: {
                departureCountry: fromCountry,
                departurePostalCode: fromPostalCode,
                arrivalCountry: toCountry,
                arrivalPostalCode: toPostalCode,
                truckLoadType: truckLoadType,
                payWeight: payWeight
            }
        });
    }

    static validateQuoteData(data){
        return axios.post("/sales-price-service/validate", data);
    }

    static getExtraApplicationTypes(){
        return axios.get("/sales-price-service/lookup/extra-applied-at");
    }

    static getExtraPricesForRegion(regionId){
        return axios.get(`/sales-price-service/region/${regionId}/extra-prices`);
    }
    static saveExtraPriceForRegion(regionId, extraPrice){
        return axios.post(`/sales-price-service/region/${regionId}/extra-prices`, extraPrice);
    }

    static deleteRegionExtraPrice(regionId, extraPriceId){
        return axios.delete(`/sales-price-service/region/${regionId}/extra-prices/${extraPriceId}`);
    }

    static findBillingItemPrices(billingItemCode){
        return axios.get("/sales-price-service/billing-item-price", {params: {billingItemCode: billingItemCode}});
    }

    static saveBillingItemPrice(billingItemPrice){
        if(billingItemPrice.id){
            return axios.put(`/sales-price-service/billing-item-price/${billingItemPrice.id}`, billingItemPrice);
        }else{
            return axios.post("/sales-price-service/billing-item-price", billingItemPrice);
        }
    }
    static deleteBillingItemPrice(billingItemPrice){
        return axios.delete(`/sales-price-service/billing-item-price/${billingItemPrice.id}`);
    }

    static listPricingCustomsOffices(){
        return axios.get("/sales-price-service/pricing-customs-office");
    }

    static savePricingCustomsOffice(customOffices){
        return axios.post("/sales-price-service/pricing-customs-office", customOffices);
    }
    static deletePricingCustomsOffice(customOffices){
        return axios.delete(`/sales-price-service/pricing-customs-office/${customOffices.id}`);
    }


}