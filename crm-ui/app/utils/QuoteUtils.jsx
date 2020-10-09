import _ from "lodash";
import { LocationService } from "../services";
import * as axios from 'axios';

export class QuoteUtils {

    static getMainService(quote) {
        return _.find(quote.services, (item) => {
            return item.type.category == "MAIN";
        });
    }

    static isImport(quote, referenceCountry) {
        let importProducts = _.filter(quote.products, product=>this.isImportProduct(product, referenceCountry));
        return !_.isEmpty(importProducts);
    }
    
    static isExport(quote, referenceCountry) {
        let exportProducts = _.filter(quote.products, product=>this.isExportProduct(product, referenceCountry));
        return !_.isEmpty(exportProducts);
    }

    static isImportProduct(product, referenceCountry = 'TR') {
        return _.get(product,'fromCountry.iso') !== referenceCountry && _.get(product,'toCountry.iso') === referenceCountry;
    }
    
    static isExportProduct(product, referenceCountry = 'TR') {
       return _.get(product,'fromCountry.iso') === referenceCountry && _.get(product,'toCountry.iso') !== referenceCountry;
    }

    static isLocalProduct(product, referenceCountry = 'TR') {
       return _.get(product,'fromCountry.iso') === referenceCountry && _.get(product,'toCountry.iso') === referenceCountry;
    }

    static isForeignProduct(product, referenceCountry = 'TR') {
       return _.get(product,'fromCountry.iso') !== referenceCountry && _.get(product,'toCountry.iso') !== referenceCountry;
    }

    static hasCountry(product){
        return _.get(product,'fromCountry.iso') && _.get(product,'toCountry.iso')
    }

    static determinePricingOperation(pricingConfig, product){
        let operation = null;
        if(this.hasCountry(product) && 'ROAD' === _.get(product,'serviceArea.code') && pricingConfig){
            let subsidiaryCountry = _.get(pricingConfig,'subsidiaryCountry.iso','')
            if(this.isExportProduct(product, subsidiaryCountry)){
                operation="EXPORT";
            } else if(this.isImportProduct(product, subsidiaryCountry)) {
                operation="IMPORT";
            } else if(this.isLocalProduct(product, subsidiaryCountry)) {
                operation="LOCAL";
            } else if(this.isForeignProduct(product, subsidiaryCountry)) {
                operation="FOREIGN";
            }
        }
        return operation;
    }

    static determineProductOperation(product){
        return new Promise((resolve, reject) => {
            if (product.fromCountry && product.toCountry) {
                axios.all([
                    LocationService.getCountryByIso(product.fromCountry.iso),
                    LocationService.getCountryByIso(product.toCountry.iso)
                ]).then(axios.spread((from, to) => {
                    let operation = undefined;
                    if (product.fromCountry.iso !== product.toCountry.iso &&
                        (!from.data.euMember || !to.data.euMember)) {
                        if (product.fromCountry.iso === 'TR') {
                            operation = 'EXPORT';
                        } else if (product.toCountry.iso === 'TR') {
                            operation = 'IMPORT';
                        } else {
                            operation = 'NON_TURKEY';
                        }
                    }
                    resolve(operation);
                })).catch(error => {
                    reject(error);
                });
            }
        });
    }
}