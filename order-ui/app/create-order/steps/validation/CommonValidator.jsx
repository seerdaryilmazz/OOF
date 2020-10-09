import _ from 'lodash';
import moment from 'moment';
import { StepValidationResult } from "./StepValidationResult";

export class CodeValidator{

    static validate(value, message){
        let result = new StepValidationResult();
        if(!value || !value.code){
            result.addMessage(message || "Please select an option");
        }
        return result;
    }
}

export class IdValidator{

    static validate(value, message){
        let result = new StepValidationResult();
        if(!value || !value.id){
            result.addMessage(message || "Please select an option");
        }
        return result;
    }
}

export class EmptyValidator{

    static validate(value, message){
        let result = new StepValidationResult();
        if(!value){
            result.addMessage(message || "Please enter a value");
        }
        return result;
    }
}

export class DateTimeRangeValidator{

    static validate(value){
        let result = new StepValidationResult();
        if(!value || !value.startDateTime){
            result.addMessage("Date time range is not valid");
        }else{
            let startDate = moment(value.startDateTime, "DD/MM/YYYY HH:mm Z");
            let startIsValid = startDate.isValid();
            if(!startIsValid){
                result.addMessage("Start date time is not valid");
            }
            if(value.endDateTime){
                let endDate = moment(value.endDateTime, "DD/MM/YYYY HH:mm Z");
                let endIsValid = endDate.isValid();
                if(!endIsValid){
                    result.addMessage("End date time is not valid");
                }
                if(startDate.isAfter(endDate)){
                    result.addMessage("Start date should be before end date");
                }
            }

        }
        return result;
    }
}

export class AppointmentDateValidator{
    static validate(value, readyAt, deliveryDate){
        let result = DateTimeRangeValidator.validate(value);
        if(!result.hasError()){
            let startDateTime = moment(value.startDateTime, "DD/MM/YYYY HH:mm Z");
            if(moment().isAfter(startDateTime)){
                result.addMessage("Appointment date should not be a past date");
            }
            if(moment().add(90, 'days').isBefore(startDateTime)){
                result.addMessage("Appointment should be within 90 days");
            }
            if(readyAt){
                let readyAtDate = moment(readyAt, "DD/MM/YYYY HH:mm Z");
                if(readyAtDate.isAfter(startDateTime)){
                    result.addMessage("Unload appointment date should be a after ready date");
                }
            }
            if(deliveryDate){
                let delivery = moment(deliveryDate, "DD/MM/YYYY HH:mm Z");
                delivery.startOf('date');
                if(delivery.isAfter(startDateTime)){
                    result.addMessage("Unload appointment date should be a after delivery date");
                }
            }
        }
        return result;
    }
}

export class DateTimeValidator{

    static validate(value){
        let result = new StepValidationResult();
        let isValid = moment(value, "DD/MM/YYYY HH:mm Z").isValid();
        if(!isValid){
            result.addMessage("Date time is not valid");
        }
        return result;
    }
}
export class ReadyDateValidator{
    static validate(value){
        let result = DateTimeValidator.validate(value && value.value);
        if(!result.hasError()){
            let readyDate = moment(value.value, "DD/MM/YYYY HH:mm Z");
            if(value.isWorkingHoursExist){
                if(!value.workingHours || _.isEmpty(value.workingHours.timeWindows)){
                    result.addMessage("According to Location Definitions, loading location does not work on entered date");
                } else {
                    let isWorking = false
                    value.workingHours && value.workingHours.timeWindows.forEach(w=>{
                        let [startHour, startMinute] = w.startTime.split(":");
                        let [endHour, endMinute] = w.endTime.split(":");
                        let start = _.cloneDeep(readyDate).set({hour: startHour, minute: startMinute});
                        let end = _.cloneDeep(readyDate).set({hour: endHour, minute: endMinute});
                        if(readyDate.isBetween(start, end, null, "[]")){
                            isWorking = true;
                        }
                    });
                    if(!isWorking){
                        result.addMessage("According to Location Definitions, entered time is out of working hours.");
                    }
                }
            }
            if(moment().isAfter(readyDate)){
                result.addMessage("Ready date should not be a past date");
            }
            if(moment().add(1, 'year').isBefore(readyDate)){
                result.addMessage("Ready date should be within a year");
            }
        }
        return result;
    }
}

export class AmountWithUnitValidator{

    static validate(value, message) {
        let result = new StepValidationResult();
        if(value){
            if(value.amount && (!value.unit || !value.unit.code)){
                result.addMessage(message || "Please enter amount unit");
            }
            if(value.unit && (!value.amount)){
                result.addMessage(message || "Please enter amount");
            }
        }
        return result;
    }
}

export class ListValidator{

    static validate(value, message) {
        let result = new StepValidationResult();
        if(!(value && _.isArray(value) && value.length > 0)){
            result.addMessage(message || "Please select an option");
        }
        return result;
    }
}

export class NumberRangeValidator{

    static validate(value) {
        let result = new StepValidationResult();
        if(!value){
            result.addMessage("Please enter a value");
        }else{
            if(_.isNil(value.min)){
                result.addMessage("Please enter a min/fixed value");
            }
            if(!_.isNil(value.max) && parseInt(value.min) > parseInt(value.max)){
                result.addMessage("Min value should be smaller than max value");
            }
        }

        return result;
    }
}
export class TemperatureValidator{
    static validate(value) {
        let result = NumberRangeValidator.validate(value);
        if(value && parseInt(value.min) < -25){
            result.addMessage("Minimum value should be greater than -25 C");
        }
        if(value && !_.isNil(value.max) && parseInt(value.max) > 25){
            result.addMessage("Maximum value should be less than 25 C");
        }
        return result;
    }

}