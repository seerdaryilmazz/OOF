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

    static uppercaseFirst(value, locale) {
        return value && (this.uppercase(this.substring(value, 0, 1), locale) + this.substring(value, 1));
    }

    static capitalize(value, locale) {
        return value && (this.uppercase(this.substring(value, 0, 1), locale) + this.lowercase(this.substring(value, 1), locale));
    }

    static sentenceCase(value, locale) {
        let seperators = [
            '.', '!', '?', ':'
        ];
        let result = _.cloneDeep(this.lowercase(value));
        seperators.forEach(seperator => {
            result = this.uppercaseFirstBySeperator(result, seperator, locale);
        });
        return result;
    }

    static titleCase(value, locale) {
        return this.capitilizeBySeperator(value, ' ', locale);
    }

    static uppercaseFirstBySeperator(value, seperator, locale) {
        let sentences = _.split(_.trim(value), seperator);
        let result = '';
        sentences.forEach(sentence => {
            result = _.trim(result + this.uppercaseFirst(sentence, locale) + seperator) + ' ';
        });
        return _.trimEnd(result.trim(), seperator);
    }

    static capitilizeBySeperator(value, seperator, locale) {
        let sentences = _.split(_.trim(value), seperator);
        let result = '';
        sentences.forEach(sentence => {
            result = _.trim(result + this.capitalize(sentence, locale) + seperator) + ' ';
        });
        return _.trimEnd(result.trim(), seperator);
    }

    static uppercase(value, locale) {
        return value && value.trim().toLocaleUpperCase(locale);
    }

    static lowercase(value, locale) {
        return value && value.trim().toLocaleLowerCase(locale);
    }

    static substring(value, start, end){
        return value && value.trim().substring(start, end);
    }
}