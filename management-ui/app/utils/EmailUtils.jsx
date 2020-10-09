import _ from "lodash";

export class EmailUtils {
    static format(email) {
        if(!email){
            return "";
        }
        return email.account + (email.domain ? ("@" + email.domain) : "");
    }
    static sanitize(email) {
        email.account = _.trim(email.account);
        email.domain = _.trim(email.domain);
        return email;
    }
    static setIsValid(email){
        let isValid = email.account && email.domain;
        if(isValid){
            email._valid = true;
        }else{
            email._valid = false;
        }
    }
}