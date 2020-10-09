export class DistanceUtil {

    static EARTH_RADIUS = 6371e3; // in meters

    static calculateAirDistance(lat1, lon1, lat2, lon2) {

        var lat1Rad = this.degreeToRadian(lat1);
        var lat2Rad = this.degreeToRadian(lat2);
        var latDiffRad = this.degreeToRadian(lat2 - lat1);
        var lonDiffRad = this.degreeToRadian(lon2 - lon1);

        var param1 = Math.sin(latDiffRad / 2) * Math.sin(latDiffRad / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(lonDiffRad / 2) * Math.sin(lonDiffRad / 2);
        var param2 = 2 * Math.atan2(Math.sqrt(param1), Math.sqrt(1 - param1));

        return this.EARTH_RADIUS * param2;
    }

    static degreeToRadian(degrees) {
        return degrees * Math.PI / 180;
    };

}