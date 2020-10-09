import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Span, TextInput } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";



export class AddressFormWithDistrict extends TranslatingComponent {
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
                <GridCell width="1-3">
                    <TextInput label="City" required = {true} uppercase = {{locale: locale}}
                               value = {this.props.location.postaladdress.city}
                               readOnly={this.props.readOnly}
                               onchange = {(value) => this.updateState("postaladdress.city", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    <TextInput label="District" required = {this.props.districtRequired} uppercase = {{locale: locale}}
                               value = {this.props.location.postaladdress.district}
                               maxLength="40"
                               readOnly={this.props.readOnly}
                               onchange = {(value) => this.updateState("postaladdress.district", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    <TextInput label="Postal Code" required = {true} uppercase = {{locale: locale}}
                               value = {this.props.location.postaladdress.postalCode}
                               onchange = {(value) => this.updateState("postaladdress.postalCode", value)}
                               readOnly={this.props.readOnly}
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