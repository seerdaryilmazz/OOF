import _ from "lodash";


export class GooglePlaceResultBuilder{
    constructor(config){
        this.config = config;
    }
    parse(components){
        let result = {};
        _.forEach(this.config, (value, key) => {
            result[key] = GoogleComponentsReader.read(components, value.field);
        });
        return result;
    }

}

export class GoogleComponentsReader{
    static read(components, field){
        if(field.indexOf(".") == -1){
            field = field + ".long_name";
        }
        let fields = field.split(".");
        let filtered = _.find(components, (item) => {return item.types.indexOf(fields[0]) != -1;});
        if(filtered){
            return _.get(filtered, fields[1]);
        }

        return "";
    }
}