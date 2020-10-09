import { Notify } from 'susam-components/basic';
import { AgreementService } from "../services/AgreementService";


export class CalculationUtils {

    static calculateCurrentPrice(unitPrice , callback){
        if(unitPrice){
            let params={unitPrice:unitPrice, historyUnitPrice: unitPrice.historyUnitPrice};
            let currentPrice=null;
            AgreementService.calculateCurrentPrice(params).then(response=>{
                currentPrice = response.data;
                callback(currentPrice);
            }).catch(e=>{
                Notify.showError(e);
                callback(currentPrice);
            });
        }
    }
}