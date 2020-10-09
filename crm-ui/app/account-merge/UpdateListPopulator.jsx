import _ from "lodash";

export class UpdateListPopulator{
    constructor(current, updated, original){
        this.current = current;
        this.updated = updated;
        this.original = original;
    }

    isEquals(var1, var2){
        if(_.isArray(var1) && _.isArray(var2)){
            return _.xor(var1, var2).length == 0;
        }
        if(_.isObjectLike(var1) && _.isObjectLike(var2)){
            if(var1.hasOwnProperty("id") && var2.hasOwnProperty("id")){
                return var1.id == var2.id;
            }else{
                return var1 == var2;
            }
        }
        var1 = var1 || "";
        var2 = var2 || "";
        var1 = _.isString(var1) ? var1.trim() : var1;
        var2 = _.isString(var2) ? var2.trim() : var2;
        return var1 == var2;

    };

    readValue(object, field){
        if(field.indexOf("[]") == -1){
            let a = _.get(object, field);
            return a;
        }else{
            let fieldParts = _.split(field, "[]");
            let result = object;
            fieldParts.forEach(fieldPart => {
                fieldPart = _.startsWith(fieldPart, ".") ? fieldPart.substr(1) : fieldPart;
                if(_.isArray(result)){
                    result = result.map(item => {
                        return fieldPart ? _.get(item, fieldPart) : item;
                    });
                }else{
                    result = _.get(result, fieldPart);
                }
            });
            return result;
        }
    }
    convert(value, func){
        if(_.isArray(value)){
            return value.map(item => func(item));
        }else{
            return func(value);
        }
    }

    checkFieldForUpdate(configItem){
        let currentValue = this.readValue(this.current, configItem.fieldToCompare);
        let currentValueToCompare = configItem.valueToCompare ? this.convert(currentValue, configItem.valueToCompare) : currentValue;
        let newValue = this.readValue(this.updated, configItem.fieldToCompare);
        let newValueToCompare = configItem.valueToCompare ? this.convert(newValue, configItem.valueToCompare) : newValue;
        let originalValue = this.readValue(this.original, configItem.fieldToCompare);
        let originalValueToCompare = configItem.valueToCompare ? this.convert(originalValue, configItem.valueToCompare) : originalValue;
        let valueToPrint = configItem.valueToPrint ? this.convert(newValue, configItem.valueToPrint) : newValue;
        let fieldToCopy = configItem.fieldToCopy ? configItem.fieldToCopy : configItem.fieldToCompare;
        let valueToCopy = this.readValue(this.updated, fieldToCopy);
        let valueToUndo = this.original ? this.readValue(this.original, fieldToCopy) : this.readValue(this.current, fieldToCopy);
        if(!this.isEquals(originalValueToCompare, newValueToCompare)){
            let newEqualsCurrent = this.isEquals(newValueToCompare, currentValueToCompare);
            return {
                currentValue: currentValue,
                newValue: newValue,
                originalValue: originalValue,
                valueToPrint: valueToPrint,
                label: configItem.label,
                fieldToCompare: configItem.fieldToCompare,
                valueToCopy: valueToCopy,
                fieldToCopy: fieldToCopy,
                valueToUndo: valueToUndo,
                status: newEqualsCurrent ? "UPDATED" : ""
            };
        }
        return null;
    }

    populate(config){
        let updateList = [];
        config.forEach(item => {
            let updateItem = this.checkFieldForUpdate(item);
            console.log(updateItem);
            if(updateItem){
                updateList.push(updateItem);
            }
        });
        return updateList;
    }
}