import * as axios from 'axios';

export class PackageGroupService {


    static retrievePackageGroups() {
        return axios.get("/order-service/lookup/package-group");
    }

    static addPackageGroup(packageGroup) {
        return axios.post("/order-service/lookup/package-group", packageGroup);
    }

    static updatePackageGroup(packageGroup) {
        return axios.put("/order-service/lookup/package-group/" + packageGroup.id, packageGroup);
    }

    static deletePackageGroup(id) {
        return axios.delete("/order-service/lookup/package-group/" + id);
    }
}