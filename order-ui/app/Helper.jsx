import {ProjectService} from "./services";
import {Notify} from 'susam-components/basic';

export function convertLocationsWithPostalCodes(item){
    let postaladdress = _.defaultTo(item.postaladdress, item);
    return {
        id: item.id,
        name: item.name + " (" + postaladdress.country.iso + "-" + postaladdress.postalCode + ")"
    }
}

export function round(number, precision) {
    var shift = function (number, precision) {
        var numArray = ("" + number).split("e");
        return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
    };
    return shift(Math.round(shift(number, +precision)), -precision);
}

export function truncate(text, wordCount) {
    if(!text){
        return "";
    }
    wordCount = wordCount || 3;
    let split = text.split(" ");
    return split.splice(0, wordCount).join(" ") + (split.length > wordCount ? "..." : "");
}

export function getDateAndTime(dateTimeString){
    let [date, time] = dateTimeString.split(" ");
    return `${date} ${time}`;
}

export function calculateDeliveryDate(customer, serviceType, truckLoadType, readyDate, sender, consignee, onSuccess){
    if(customer && serviceType && truckLoadType && readyDate && sender && consignee){
        let request = {
            customerId: customer.id,
            loadType: truckLoadType.code,
            serviceType: serviceType.code,
            readyDate: readyDate,
            loadingLocationId: sender.handlingLocation.id,
            unloadingLocationId: consignee.handlingLocation.id,
            loadingCompanyType: sender.handlingCompanyType.code,
            unloadingCompanyType: consignee.handlingCompanyType.code,
        };
        ProjectService.calculateDeliveryDate(request).then(response => {
            onSuccess && onSuccess(response.data.deliveryDate);
        }).catch(error => Notify.showError(error));
    }
}

export function getAdrPackageUnits(){
    return [{id: "KILOGRAM", code:"KILOGRAM", name: "Kilogram"},{id: "LITER", code:"LITER", name: "Liter"}];
}

export function convertEnumToLookup(enumObj){
    if(enumObj){
        return {
            id: enumObj,
            code: enumObj
        };
    }
}

export function newPromise(success, error) {
    return new Promise(function (resolve, reject){
        if(error){
            reject(error)
        } else{
            resolve(success);
        }
    });
}