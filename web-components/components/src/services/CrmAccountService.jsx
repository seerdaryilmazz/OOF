import * as axios from "axios";

export class CrmAccountService {

    static shiftValidityStartDateOfPotential(potentialId, numberOfDays) {
        return axios.put(`/crm-account-service/potential/${potentialId}/shiftValidityStartDate?numberOfDays=` + numberOfDays, null);
    }
}