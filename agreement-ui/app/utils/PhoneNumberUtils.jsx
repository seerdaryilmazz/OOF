import _ from "lodash";
import {StringUtils} from './StringUtils';

export class PhoneNumberUtils {
    static format(phoneNumber) {
        if(!phoneNumber){
            return "";
        }
        return (phoneNumber.countryCode ? ("+" + _.trim(phoneNumber.countryCode)) : "") +
            (phoneNumber.regionCode ? ("(" + _.trim(phoneNumber.regionCode) + ")") : "") +
            (PhoneNumberUtils.formatPhoneNumber(phoneNumber.phone)) +
            (phoneNumber.extension ? ("-" + phoneNumber.extension) : "");
    }
    static sanitize(phoneNumber) {
        phoneNumber.countryCode = _.trim(phoneNumber.countryCode);
        phoneNumber.regionCode = _.trim(phoneNumber.regionCode);
        phoneNumber.phone = StringUtils.stripWhitespaces(phoneNumber.phone);
        return phoneNumber;
    }
    static setIsValid(phoneNumber){
        if(!phoneNumber){
            return;
        }
        let isValid = phoneNumber.phone && phoneNumber.regionCode && phoneNumber.countryCode;
        if(isValid){
            phoneNumber._valid = true;
        }else{
            phoneNumber._valid = false;
        }
    }

    static formatPhoneNumber(value){
        if(value){
            let phone = StringUtils.stripWhitespaces(value);
            if(phone.length == 5 || phone.length == 6){
                return phone.substring(0, 3) + " " + phone.substring(3);
            } else if(phone.length == 7 || phone.length == 8){
                return phone.substring(0, 3) + " " + phone.substring(3, 5) + " " + phone.substring(5);
            } else if(phone.length >= 9){
                return phone.substring(0, 3) + " " + phone.substring(3, 6) + " " + phone.substring(6);
            } else{
                return phone;
            }
        }
        return "";
    }
}