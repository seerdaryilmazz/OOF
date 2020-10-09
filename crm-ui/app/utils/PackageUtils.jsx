import _ from 'lodash';
import PropTypes from 'prop-types';
import { Notify } from 'susam-components/basic';
import { CrmQuoteService, OrderService } from "../services";
import { QuoteUtils } from "../utils";



export class PackageUtils {

    static calculateVolumeAndLdmIfNecessary(quotePackage, callback, callbackOnError) {
        PackageUtils.calculateVolumeIfNecessary(quotePackage, (quotePackageAfterVolumeCalculation) => {
            PackageUtils.calculateLdmIfNecessary(quotePackageAfterVolumeCalculation, (quotePackageAfterLdmCalculation) => {
                callback(quotePackageAfterLdmCalculation);
            }, callbackOnError);
        }, callbackOnError);
    }

    static calculateVolumeIfNecessary(quotePackageOuter, callback, callbackOnError) {
        let quotePackage = _.cloneDeep(quotePackageOuter);
        let dimension = quotePackage.dimension ? quotePackage.dimension : {};
        let calculationParams = {
            width: dimension.width ? dimension.width : null,
            length: dimension.length ? dimension.length : null,
            height: dimension.height ? dimension.height : null,
            count: quotePackage.quantity
        };
        if (!_.isEqual(quotePackage.volumeCalculationParams, calculationParams)) {
            if (dimension.width && dimension.length && dimension.height && quotePackage.quantity) {
                OrderService.calculateVolume(calculationParams).then(response => {
                    quotePackage.calculatedVolume = response.data;
                    quotePackage.volumeCalculationParams = calculationParams;
                    callback(quotePackage);
                }).catch(error => {
                    Notify.showError(error);
                    if (callbackOnError) {
                        callbackOnError();
                    }
                });
            } else {
                quotePackage.calculatedVolume = null;
                quotePackage.volumeCalculationParams = calculationParams;
                callback(quotePackage);
            }
        } else {
            callback(quotePackage);
        }
    }

    static calculateLdmIfNecessary(quotePackageOuter, callback, callbackOnError) {
        let quotePackage = _.cloneDeep(quotePackageOuter);
        let dimension = quotePackage.dimension ? quotePackage.dimension : {};
        let stackSize = PackageUtils.getStackSize(quotePackage);
        let calculationParams = {
            width: dimension.width ? dimension.width : null,
            length: dimension.length ? dimension.length : null,
            count: quotePackage.quantity,
            stackSize: stackSize
        };
        if (!_.isEqual(quotePackage.ldmCalculationParams, calculationParams)) {
            if (dimension.width && dimension.length && quotePackage.quantity && stackSize) {
                OrderService.calculateLdm(calculationParams).then(response => {
                    quotePackage.calculatedLdm = response.data;
                    quotePackage.ldmCalculationParams = calculationParams;
                    callback(quotePackage);
                }).catch(error => {
                    Notify.showError(error);
                    if (callbackOnError) {
                        callbackOnError();
                    }
                });
            } else {
                quotePackage.calculatedLdm = null;
                quotePackage.ldmCalculationParams = calculationParams;
                callback(quotePackage);
            }
        } else {
            callback(quotePackage);
        }
    }

    static getStackSize(quotePackage) {
        let stackSize = 1;
        let dimension = quotePackage.dimension ? quotePackage.dimension : {};
        if (quotePackage.stackabilityType) {
            if (quotePackage.stackabilityType == "MAX_AMOUNT") {
                if (dimension.height) {
                    stackSize = Math.trunc(300 / dimension.height);
                }
            } else if (quotePackage.stackabilityType != "NOT_STACKABLE") {
                stackSize = parseInt(quotePackage.stackabilityType, 10);
            }
        } else if (quotePackage.hangingGoodsCategory) {
            stackSize = Math.ceil(quotePackage.hangingGoodsCategory.coefficient);
        }
        return stackSize;
    }

    static calculatePayWeight(quote, callback, callbackOnError) {
        let mainService = QuoteUtils.getMainService(quote);
        let params = {
            quoteId: quote.id,
            subsidiary: _.get(quote, "subsidiary"),
            weight: _.get(quote, "measurement.weight"),
            ldm: _.get(quote, "measurement.ldm"),
            volume: _.get(quote, "measurement.volume"),
            speedyService: mainService && mainService.type.code == "SPEEDY" || mainService.type.code == "SPEEDY_VAN"  ? true : false
           
            
        };

        CrmQuoteService.calculatePayWeight(params).then(response => {
            callback(response.data);
        }).catch(error => {
            Notify.showError(error);
            if (callbackOnError) {
                callbackOnError();
            }
        });
    }

    static calculateChargeableWeight(quote, callback, callbackOnError){
        let mainService = QuoteUtils.getMainService(quote);
        let params = {
            weight: _.get(quote, "measurement.weight"),
            volume: _.get(quote, "measurement.volume")
        };
        CrmQuoteService.calculateChargeableWeight(params).then(response => {
            callback(response.data);
        }).catch(error => {
            Notify.showError(error);
                if(callbackOnError) {
                    callbackOnError();
                }
        });
    }
}