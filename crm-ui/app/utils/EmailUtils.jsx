import _ from "lodash";

export class EmailUtils {
    static format(email) {
        if(!email){
            return "";
        }
        return email.emailAddress;
    }
    static sanitize(email) {
        email.emailAddress = _.trim(email.emailAddress);
        return email;
    }
    static setIsValid(email){
       email._valid = this.validateEmail(email.emailAddress);
    }
    static validateEmail(email) {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}