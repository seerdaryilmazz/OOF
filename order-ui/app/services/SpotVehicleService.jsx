import * as axios from "axios";


export class SpotVehicleService {

    static SPOT_VEHICLE_ROUTE_TYPE_DEPARTURE_ID = "DEPARTURE";
    static SPOT_VEHICLE_ROUTE_TYPE_RETURN_ID = "RETURN";

    static USAGE_ID_IN = "IN";
    static USAGE_ID_BETWEEN = "BETWEEN";

    static USAGE_TYPE_ID_ONE_WAY = "ONE_WAY";
    static USAGE_TYPE_ID_ROUND_TRIP = "ROUND_TRIP";

    static findSpotVehicleRoutes() {
        return axios.get("/vehicle-service/spot-vehicle-route/usable-routes")
    }
}