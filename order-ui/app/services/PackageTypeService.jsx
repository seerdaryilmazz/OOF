import * as axios from 'axios';

export class PackageTypeService {
    
    static getAllPackageTypesWithRestriction() {
        return axios.get("/order-service/lookup/package-type/with-restriction");
    }
    
    static deletePackageType(packageTypeId) {
        return axios.delete("/order-service/lookup/package-type/" + packageTypeId);
    }

    static addPackageType(packageType) {
        return axios.post("/order-service/lookup/package-type", packageType);
    }

    static updatePackageType(packageType) {
        return axios.put("/order-service/lookup/package-type/" + packageType.id, packageType)
    }

    static getRestrictionByPackageTypeId(packageTypeId) {
        return axios.get("/order-service/package-type/restriction?packageTypeId=" + packageTypeId);
    }

    static addRestriction(restriction) {
        return axios.post("/order-service/package-type/restriction", restriction);
    }

    static updateRestriction(restriction) {
        return axios.put("/order-service/package-type/restriction/" + restriction.id, restriction);
    }
}
