import * as axios from "axios";

export class CountryPlanningService {


    static retrieveCountryPlanningRule(countryIso) {
       return axios.get("/order-template-service/rule/country-planning/" + countryIso);
    }

    static saveRoadSizeLimitationRule(countryIso, data) {
        return axios.post("/order-template-service/rule/country-planning/" + countryIso + "/" + "road-size-limitation", data);
    }

    static saveWeightLimitationRule(countryIso, data) {
        return axios.post("/order-template-service/rule/country-planning/" + countryIso + "/" + "weight-limitation", data);
    }

    static saveExhaustEmission(countryIso, data) {
        return axios.post("/order-template-service/rule/country-planning/" + countryIso + "/" + "exhaust-emission", data);
    }

    static saveAdvancedRule(countryIso, data) {
        return axios.post("/order-template-service/rule/country-planning/" + countryIso + "/" + "advanced-rule", data);
    }
}