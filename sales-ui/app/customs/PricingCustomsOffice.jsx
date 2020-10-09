import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell} from "susam-components/layout";
import {Notify, DropDown, Form} from 'susam-components/basic';
import {LocationService} from '../services';

export class PricingCustomsOffice extends TranslatingComponent{

    static defaultProps = {
        pricingCustomsOffice: {}
    }

    constructor(props){
        super(props);
        this.state= {
            customsOffices: []
        };
    }

    componentDidMount(){
        this.getCustomsOffices();
    }

    getCustomsOffices(){
        LocationService.retrieveCustomsOffices().then((response) => {
            this.setState({customsOffices: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }

    handleChange(customsOffice){
        let pricingCustomsOffice = _.cloneDeep(this.props.pricingCustomsOffice);
        pricingCustomsOffice.customsOffice = customsOffice;
        this.props.onChange(pricingCustomsOffice);
    }

    validate(){
        return this.form.validate();
    }

    render(){
        let filteredCustomsOffices = [];
        console.log(this.props.currentCustomsOffices);
        this.state.customsOffices.forEach(customsOffice => {
            console.log(customsOffice);
            if(!_.some(this.props.currentCustomsOffices, {id: customsOffice.id})){
                filteredCustomsOffices.push(customsOffice);
            }
        });

        return(
            <Form ref = {c => this.form = c}>
                <Grid widthLarge={true} divider={true}>
                    <GridCell width="1-1">
                        <DropDown options={filteredCustomsOffices} label="Customs Office"
                                  value = {this.props.pricingCustomsOffice.customsOffice} required={true}
                                  onchange = {(value) => {value ? this.handleChange(value) : null}}/>
                    </GridCell>
                </Grid>
            </Form>

        );
    }
}