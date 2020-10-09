import _ from "lodash";
export class GoogleAddressComponents {

    constructor(addressComponents){
        this.googleReader = new GoogleComponentsReader(addressComponents);
        this.addressBuilder = new AddressBuilder(this.googleReader);
        this.cityFields = {
            TR: "administrative_area_level_1.long_name",
            ES: "administrative_area_level_2.long_name",
            SE: "postal_town.long_name",
            NO: "postal_town.long_name",
            SI: "postal_town.long_name",
            GB: "postal_town.long_name",
            REST: "locality.long_name"
        };
        this.districtFields = {
            TR: "administrative_area_level_2.long_name",
            ES: "locality.long_name",
            CN: "sublocality_level_1.long_name",
            IR: "sublocality_level_1.long_name",
            GB: "sublocality_level_1.long_name",
            IE: "neighborhood.long_name"
        };
        this.regionFields = {
            US: "administrative_area_level_1.short_name",
            CN: "administrative_area_level_1.long_name",
            IR: "administrative_area_level_1.long_name"
        };
        this.streetNameFields = {
            TR: () => {
                return this.addressBuilder.startWithField('administrative_area_level_4.long_name')
                    .append(", ")
                    .appendField("route.long_name")
                    .append(" No:")
                    .appendField("street_number.short_name")
            },
            GB: () => {
                return this.addressBuilder.startWithField('premise.long_name')
                .append(" ")
                    .appendField("neighborhood.long_name")
                    .append(" ")
                .appendField("street_number.short_name")
                .append(" ")
                .appendField("route.long_name")
            },
            IT: () => {return this.addressBuilder.routeCommaStreetNumber()},
            FR: () => {return this.addressBuilder.streetNumberRoute()},
            ES: () => {return this.addressBuilder.routeCommaStreetNumber()},
            CZ: () => {
                return this.addressBuilder.startWithField('route.long_name')
                    .append(" ")
                    .appendField("premise.short_name")
            },
            CN: () => {return this.addressBuilder.streetNumberRoute()},
            US: () => {return this.addressBuilder.streetNumberRoute()},
            IR: () => {
                return this.addressBuilder.startWithField('route.long_name')
                    .append(" No. ")
                    .appendField("street_number.short_name")
            },
            IE: () => {return this.addressBuilder.streetNumberRoute()},
            SK: () => {
                return this.addressBuilder.startWithField('route.long_name')
                    .append(" ")
                    .appendField("premise.short_name")
                    .append("/")
                    .appendField("street_number.short_name")
            },
            REST: () => {return this.addressBuilder.routeStreetNumber()}
        };

        let countryCode = this.countryCode();
        let formattedAddressParts = {
            countryCode: countryCode,
            countryName: this.countryName(),
            region: this.region(countryCode),
            city: this.city(countryCode),
            district: this.district(countryCode),
            postalCode: this.postalCode(),
            streetName: this.streetName(countryCode)
        };

        this.formattedAddressBuilder = new FormattedAddressBuilder(formattedAddressParts);
        this.address = this.formattedAddressBuilder.buildAddress();
    }

    countryCode(){
        return this.googleReader.read("country.short_name");
    }
    countryName(){
        return this.googleReader.read("country.long_name");
    }
    city(country) {
        let countryCode = country ? country : this.countryCode();
        let field = this.cityFields[countryCode] ? this.cityFields[countryCode] : this.cityFields.REST;
        return this.googleReader.read(field);
    }
    district(country){
        let countryCode = country ? country : this.countryCode();
        if(this.districtFields[countryCode]){
            return this.googleReader.read(this.districtFields[countryCode]);
        }
        return "";
    }
    region(country){
        let countryCode = country ? country : this.countryCode();
        if(this.regionFields[countryCode]){
            return this.googleReader.read(this.regionFields[countryCode]);
        }
        return "";
    }
    postalCode(){
        return this.googleReader.read("postal_code.long_name");
    }
    streetName(country){
        let countryCode = country ? country : this.countryCode();
        let retrieveFunc = this.streetNameFields[countryCode] ? this.streetNameFields[countryCode] : this.streetNameFields.REST;
        let result = retrieveFunc();
        return result.value();
    }

    formattedAddress(){
        return this.address;
    }
}
export class FormattedAddressBuilder{
    constructor(components) {
        if(!components.countryCode){
            components.countryCode = components.country ? components.country.iso : "";
        }
        if(!components.countryName){
            components.countryName = components.country ? components.country.countryName : "";
        }
        this.countryCode = components.countryCode;
        this.builder = new AddressBuilder(new SimpleReader(components));
        this.addressBuilderFields = {
            TR: () => {
                return this.builder
                    .startWithField("streetName").append(", ")
                    .appendField("postalCode").append(" ")
                    .appendField("district").append("/").appendField("city").append(", ")
                    .appendField("countryName")
            },
            GB: () => {
                return this.builder
                    .startWithField("streetName").append(", ")
                    .appendField("district").append(" ")
                    .appendField("city").append(" ")
                    .appendField("postalCode").append(", ")
                    .appendField("countryName")
            },
            ES: () => {
                return this.builder
                    .startWithField("streetName").append(", ")
                    .appendField("postalCode").append(" ")
                    .appendField("district").append(", ")
                    .appendField("city").append(", ")
                    .appendField("countryName")
            },
            GR: () => {
                return this.builder
                    .startWithField("streetName").append(", ")
                    .appendField("city").append(" ")
                    .appendField("postalCode").append(", ")
                    .appendField("countryName")
            },
            CN: () => {
                return this.builder
                    .startWithField("streetName").append(", ")
                    .appendField("district").append(", ")
                    .appendField("city").append(", ")
                    .appendField("region").append(", ")
                    .appendField("countryName").append(", ")
                    .appendField("postalCode")
            },
            HU: () => {
                return this.builder
                    .startWithField("city").append(", ")
                    .appendField("streetName").append(", ")
                    .appendField("postalCode").append(" ")
                    .appendField("countryName")
            },
            US: () => {
                return this.builder
                    .startWithField("streetName").append(", ")
                    .appendField("city").append(", ")
                    .appendField("region").append(" ")
                    .appendField("postalCode").append(", ")
                    .appendField("countryCode")
            },
            IR: () => {
                return this.builder
                    .startWithField("region").append(", ")
                    .appendField("city").append(", ")
                    .appendField("district").append(", ")
                    .appendField("streetName").append(", ")
                    .appendField("countryName")
            },
            IE: () => {
                return this.builder
                    .startWithField("streetName").append(", ")
                    .appendField("district").append(", ")
                    .appendField("city").append(", ")
                    .appendField("postalCode").append(", ")
                    .appendField("countryName")
            },
            REST: () => {
                return this.builder
                    .startWithField("streetName").append(", ")
                    .appendField("postalCode").append(" ")
                    .appendField("city").append(", ")
                    .appendField("countryName")
            }
        };
    }
    buildAddress(){
        let retrieveFunc = this.addressBuilderFields[this.countryCode] ? this.addressBuilderFields[this.countryCode] : this.addressBuilderFields.REST;
        let result = retrieveFunc();
        return result.value();
    }
}
class GoogleComponentsReader{
    constructor(addressComponents) {
        this.components = addressComponents;
    }
    read(field){
        let fields = field.split(".");
        let filtered = _.find(this.components, (item) => {return item.types.indexOf(fields[0]) != -1;});
        if(filtered){
            return _.get(filtered, fields[1]);
        }
        return "";
    }
}
class SimpleReader{
    constructor(components) {
        this.components = components;
    }
    read(field){
        let value = _.get(this.components, field);
        if(!value){
            value = "";
        }
        return value;
    }
}
class AddressBuilder{
    constructor(reader){
        this.reader = reader;
        this.address = "";
        this.prev = true;
    }
    read(field){
        let value = this.reader.read(field);
        if(value == "Unnamed Road"){
            value = "";
        }
        return value;
    }
    appendField(field){
        let value = this.read(field);
        return this.append(value);
    }
    append(value){
        if(value && this.prev){
            this.address = this.address.concat(value);
        }
        this.prev = value;
        return this;
    }
    startWithField(field){
        let value = this.read(field);
        this.address = value;
        this.prev = value;
        return this;
    }
    routeStreetNumber(){
        return this.startWithField("route.long_name").append(" ").appendField("street_number.short_name");
    };
    routeCommaStreetNumber(){
        return this.startWithField("route.long_name").append(", ").appendField("street_number.short_name");
    };
    streetNumberRoute(){
        return this.startWithField("street_number.short_name").append(" ").appendField("route.long_name");
    }
    value(){
        return this.address;
    }


}