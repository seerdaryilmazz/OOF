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

    static formatMoney(value = 0, currency='EUR', locale="tr") {
        return Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(value)
    }

    static formatPercentage(value = 0, locale = 'tr') {
        return Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 }).format(value);
    }
    
    static formatNumber(value = 0, scale = 2, locale="tr") {
        return Intl.NumberFormat(locale, { maximumFractionDigits: scale }).format(value)
    }

    static numberPrint(data) {
        if (data) {
            let pad = "0000000";
            return (pad+data).slice(-pad.length);
        }
    }
}