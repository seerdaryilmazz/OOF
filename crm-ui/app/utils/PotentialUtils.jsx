
export class PotentialUtils {

    static getEmptyPotential(serviceAreaCode) {
        return {
            discriminator : serviceAreaCode,
            serviceArea : {code: serviceAreaCode}
        };
    }    
}