import _ from 'lodash';

export function isCustomsTypeFreeZone(customsType){
    return customsType && customsType.code === "FREE_ZONE";
}
export function isCustomsTypeOnBoardClearance(customsType){
    return customsType && customsType.code === "ON_BOARD_BONDED_WAREHOUSE";
}
export function isCustomsTypeNeedsLoadTypeCheck(customsType){
    return isCustomsTypeOneOf(customsType, ["BONDED_WAREHOUSE", "CUSTOMS_WAREHOUSE", "ON_BOARD_BONDED_WAREHOUSE"]);
}
function isCustomsTypeOneOf(customsType, types){
    return customsType && types.includes(customsType.code);
}
export function getCustomsWarehouseType(customsType){
    if(isCustomsTypeFreeZone(customsType)){
        return "";
    }
    if(isCustomsTypeOnBoardClearance(customsType)){
        return "BONDED_WAREHOUSE";
    }
    return customsType && customsType.code;
}

export function filterCustomsRuleResults(customsDefinitions, hasDangerousGoods, hasTempControlledGoods){
    if(!customsDefinitions || customsDefinitions.length === 0){
        return [];
    }
    let filteredCustomsDefinitions = _.filter(_.cloneDeep(customsDefinitions),
        {dangerousGoods: !!hasDangerousGoods, temperatureControlledGoods: !!hasTempControlledGoods});

    if(filteredCustomsDefinitions.length === 0){
        filteredCustomsDefinitions = _.cloneDeep(customsDefinitions);
        if(hasDangerousGoods) {
            filteredCustomsDefinitions = _.filter(filteredCustomsDefinitions, item => {
                return !isCustomsTypeNeedsLoadTypeCheck(item.customsType) || item.customsLocation.dangerousGoods;
            });
        }
        if(hasTempControlledGoods) {
            filteredCustomsDefinitions = _.filter(filteredCustomsDefinitions, item => {
                return !isCustomsTypeNeedsLoadTypeCheck(item.customsType) || item.customsLocation.temperatureControlledGoods
            });
        }
    }
    return filteredCustomsDefinitions;
}