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
}