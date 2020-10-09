import _ from "lodash";
import {Notify} from 'susam-components/basic';

export class AgreementUtils {

    static applyKeyValuePairsToAgreement(keyValuePairs, agreement) {
        let appliedKeys = [];
        keyValuePairs.forEach((pair) => {
            if (appliedKeys.includes(pair.key)) {
                let message = "Duplicate keys are not allowed, check where keyValuePairs array is constructed.";
                Notify.showError(message);
                throw new Error(message);
            } else {
                _.set(agreement, pair.key, pair.value);
                appliedKeys.push(pair.key);
            }
        });
    }
}