import _ from "lodash";
import { Notify } from 'susam-components/basic';
import { StringUtils } from "susam-components/utils/StringUtils";

export class ObjectUtils {

    static isProd(){
        return 'production' == process.env.NODE_ENV;
    }

    static applyKeyValuePairs(keyValuePairs, object) {
        let appliedKeys = [];
        keyValuePairs.forEach((pair) => {
            if (appliedKeys.includes(pair.key)) {
                let message = "Duplicate keys are not allowed, check where keyValuePairs array is constructed.";
                Notify.showError(message);
                throw new Error(message);
            } else {
                _.set(object, pair.key, pair.value);
                appliedKeys.push(pair.key);
            }
        });
    }

    static enumHelper(id, code, name) {
        if(id){
            const _CODE = code ? code : id;
            const _NAME = name ? name : StringUtils.titleCase(_.replace(_CODE, '_' ,' '), 'en');
            return {
                id: id,
                code: _CODE,
                name: _NAME
            };
        }
        return null;
    }

    static setNull(obj, fields) {
        if (!_.isEmpty(obj)) {
            if (_.isArray(obj)) {
                fields.forEach(field => {
                    obj.forEach(o => _.set(o, field, null));
                });
            } else {
                fields.forEach(field => {
                    _.set(obj, field, null)
                });
            }
        }
    }

    static getSingleItem(arr){
        return (_.isArray(arr) && !_.isEmpty(arr) && arr.length === 1) ? arr[0] : null;
    }

    static expressionToArray(expression){
        let items =  _.split(expression, ',').map(i=>i.trim()).map(i=>{
            if(i.includes('-')){
                let arr = [];
                let limits = _.split(i, '-').map(i=>_.toNumber(i.trim()));
                let counter = 0;
                for(let x=limits[0]; x<=limits[1]; x++){
                    arr[counter++] = _.padStart(_.toString(x), 2, '0');
                }
                return arr;
            }
            return [i];
        }).flatMap(i=>i);
        return _.sortBy(_.uniq(_.reject(items, _.isEmpty)));
    }

    static hasNull(object) {
        for (let key in object) {
            if (!object[key])
                return true;
        }
        return false;
    }
}