import _ from "lodash";

export class StringUtils {

    static trimAndSet(obj, path){
        let val = _.get(obj, path);
        if(val){
            _.set(obj, path, _.trim(val));
        }
    }
    static stripWhitespaces(value){
        let result = "" + value;
        while(result.indexOf(" ") > -1){
            result = _.replace(result, " ", "");
        }
        return result;
    }

    static toUpperCaseWithLocale(value, locale){
        return value ? value.toLocaleUpperCase(locale) : value;
    }

    static formatMoney(value = 0, currency) {
        return value.toLocaleString('en-US', { style: 'currency', currency: currency });
    }

    static formatNumber(value = 0, scale = 2)
    {
     return value.toLocaleString('en-US',{minimumFractionDigits: scale, maximumFractionDigits: scale});
    }

    static numberPrint(data) {
        if (data) {
            let pad = "0000000";
            return (pad+data).slice(-pad.length);
        }
    }

}