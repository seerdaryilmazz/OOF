

export class AddressAppender{
    constructor(){
        this.address = "";
        this.prev = true;
    }
    append(value){
        if(value && this.prev){
            this.address = this.address.concat(value);
        }
        this.prev = value;
        return this;
    }
    clear(){
        this.address = "";
        this.prev = true;
        return this;
    }

    value(){
        return this.address;
    }

    routeStreetNumber(location){
        return this.append("route.long_name").append(" ").appendField("street_number.short_name");
    };
    routeCommaStreetNumber(){
        return this.startWithField("route.long_name").append(", ").appendField("street_number.short_name");
    };
    streetNumberRoute(){
        return this.startWithField("street_number.short_name").append(" ").appendField("route.long_name");
    }


}