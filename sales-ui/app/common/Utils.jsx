import _ from "lodash";

export class Utils {

    static sortScales(scales) {
        return _.sortBy(scales, [(scale) => {
            if (scale.type.code == "LTL") {
                return scale.minimum;
            } else {
                return Number.MAX_SAFE_INTEGER;
            }
        }]);
    }
}