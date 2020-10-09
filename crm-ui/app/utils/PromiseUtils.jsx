
export class PromiseUtils {

    /**
     * axios.all kullanırken bazen sadece belli bir koşul sağlandığında backend service'e gitmemiz gerekiyor.
     * Bu gibi durumlarda getFakePromise metodunu aşağıdaki şekilde kullanabiliriz:
     *      axios.all([
     *          condition1 ? LookupService.getPaymentTypes() : getFakePromise([]),
     *          condition2 ? AuthorizationService.getSubsidiariesOfCurrentUser() : getFakePromise([]),
     *          UserService.getUsers()
     *      ]).then(axios.spread((response1, response2, response3) => {
     *          ...
     *      })).catch(error => {
     *          ...
     *      })
     */
    static getFakePromise(data) {
        return Promise.resolve({data: data});
    }
}