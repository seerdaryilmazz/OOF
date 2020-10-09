import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Span, TextInput } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";



export class AddressFormWithDistrictAndRegion extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){

    }

    updateState(key, value){
        this.props.onupdate && this.props.onupdate(key, value);
    }

    render(){
        if(!this.props.location){
            return null;
        }
        let locale = this.props.location.postaladdress.country ? this.props.location.postaladdress.country.language :  (this.props.location.company ? this.props.location.company.country : null);
        return (
            <Grid>
                <GridCell width="1-2">
                    <TextInput label="Region" required = {true} uppercase = {{locale: locale}}
                               value = {this.props.location.postaladdress.region}
                               readOnly={this.props.readOnly}
                               onchange = {(value) => this.updateState("postaladdress.region", value)}
                               />
                </GridCell>
                <GridCell width="1-2">
                    <TextInput label="City" required = {true} uppercase = {{locale: locale}}
                               value = {this.props.location.postaladdress.city}
                               readOnly={this.props.readOnly}
                               onchange = {(value) => this.updateState("postaladdress.city", value)}/>
                </GridCell>
                <GridCell width="1-2">
                    <TextInput label="District" required = {true} uppercase = {{locale: locale}}
                               value = {this.props.location.postaladdress.district}
                               readOnly={this.props.readOnly}
                               onchange = {(value) => this.updateState("postaladdress.district", value)}/>
                </GridCell>
                <GridCell width="1-2">
                    <TextInput label="Postal Code" required = {true} uppercase = {{locale: locale}}
                               value = {this.props.location.postaladdress.postalCode}
                               readOnly={this.props.readOnly}
                               onchange = {(value) => this.updateState("postaladdress.postalCode", value)}
                               errors={this.props.errors.postalCode}/>
                </GridCell>
                <GridCell width="1-1">
                    <TextInput label="Street Name" required = {true} uppercase = {{locale: locale}}
                               value = {this.props.location.postaladdress.streetName}
                               readOnly={this.props.readOnly}
                               onchange = {(value) => this.updateState("postaladdress.streetName", value)} />
                </GridCell>
                <GridCell width="1-1">
                <Span label="Address" uppercase = {{locale: locale}}
                      value = {this.props.location.postaladdress.formattedAddress}/>
                </GridCell>
            </Grid>
        );

    }
}