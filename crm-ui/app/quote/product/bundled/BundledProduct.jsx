import React from "react";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell} from "susam-components/layout";
import {Span, Notify, DropDown, Form} from 'susam-components/basic';
import {LocationService, LookupService} from "../../../services";
import {NumberInput, NumericInput, Chip} from "susam-components/advanced";

export class BundledProduct extends TranslatingComponent{

    static defaultProps = {
        product: {}
        
    }

    constructor(props){
        super(props);
        this.state={
            loading: {},
            delivery: {},
            points: {}
        };
    }

    componentDidMount(){
        this.adjustPointName();

        if(!_.isEmpty(this.props.product)){
            this.retrieveCrossDocks(this.props.product);
        }
    }

    componentWillReceiveProps(nextProps){
        let state = _.cloneDeep(this.state);
        if(nextProps.product.fromCountry &&
            nextProps.product.fromCountry.iso !== (this.props.product.fromCountry || {}).iso){
            this.retrieveCountryPoints(nextProps.product.fromCountry, 'loading', state);
        }
        if(nextProps.product.toCountry &&
            nextProps.product.toCountry.iso !== (this.props.product.toCountry || {}).iso){
            this.retrieveCountryPoints(nextProps.product.toCountry, 'delivery', state);
        }
        if(nextProps.product.country &&
            nextProps.product.country.iso !== (this.props.product.country || {}).iso) {
                this.retrieveCountryPoints(nextProps.product.country, 'points', state);
        }
        if(nextProps.product.shipmentLoadingType &&
            nextProps.product.shipmentLoadingType !== this.props.product.shipmentLoadingType){
            this.retrieveUnitOfMeasures(nextProps.product.shipmentLoadingType);
            if(this.props.product.serviceArea.code === 'DTR'){
                this.getCalculationTypes(nextProps.product.shipmentLoadingType);
            }
        }
        this.retrieveCrossDocks(nextProps.product);
    }

    adjustPointName(){
        let pointName;
        if(this.props.product.serviceArea.code === 'ROAD' || this.props.product.serviceArea.code === 'DTR' || this.props.product.serviceArea.code === 'WHM'){
            pointName = 'Postal';
        }else if(this.props.product.serviceArea.code === 'SEA') {
            pointName = 'Port';
        }else{
            pointName = 'Airport';
        }
        this.setState({pointName: pointName}, ()=>this.initializeLookups());
    }

    initializeLookups(){
        axios.all([
            LookupService.getShipmentLoadingType(this.props.product.serviceArea.code),
            LookupService.getExistenceTypes(),
            LookupService.getCurrencies(),
            LookupService.getVehicleType()
        ]).then(axios.spread((shipmentLoadingTypes, existenceTypes, currencies, vehicleTypes) => {
            this.setState({
                shipmentLoadingTypes: this.adjustShipmentLoadingTypes(shipmentLoadingTypes.data),
                existenceTypes: existenceTypes.data,
                currencies: currencies.data,
                vehicleTypes: vehicleTypes.data
            });
        })).catch(error => {
            Notify.showError(error);
        });

        if(this.props.product.serviceArea.code === 'DTR'){
            if(this.props.product.shipmentLoadingType){
                this.getCalculationTypes(this.props.product.shipmentLoadingType);
            }
        }else if(this.props.product.serviceArea.code === 'CCL'){
            this.getCustomsServiceTypes();
            if(this.props.loadingAndDelivery){
                this.setState({customsOffices: this.props.loadingAndDelivery.customsOffices});
            }else{
                this.getCustomsOffices();
            }
        }else{
            axios.all([
                LookupService.getCountries(),
                LookupService.getIncoterms(),
                LookupService.getIncotermExplanation()
            ]).then(axios.spread((countries, incoterms, incotermExplanations) => {
                this.setState({countries: countries.data, incoterms: incoterms.data, incotermExplanations: incotermExplanations.data});
            })).catch(error => {
                Notify.showError(error);
            });
        }

        this.retrieveUnitOfMeasures(this.props.product.shipmentLoadingType);

        let state = _.cloneDeep(this.state);
        if(this.props.product.fromCountry){
            this.retrieveCountryPoints(this.props.product.fromCountry, 'loading', state);
        }
        if(this.props.product.toCountry){
            this.retrieveCountryPoints(this.props.product.toCountry, 'delivery', state);
        }
        if(this.props.product.country){
            this.retrieveCountryPoints(this.props.product.country, 'points', state);
        }
    }

    adjustShipmentLoadingTypes(shipmentLoadingTypesRaw){
        let shipmentLoadingTypes = [];
        if(this.props.product.serviceArea.code === 'ROAD'){
            if(!_.isEmpty(shipmentLoadingTypesRaw)){
                shipmentLoadingTypesRaw.forEach(data => {
                    let masterCode = data.code.substring(0, 3);
                    if(!_.some(shipmentLoadingTypes, {code: masterCode})){
                        shipmentLoadingTypes.push({id: masterCode, code: masterCode, name: masterCode})
                    }
                });
            }
        }else{
            shipmentLoadingTypes = shipmentLoadingTypesRaw;
        }
        return shipmentLoadingTypes;
    }

    retrieveCountryPoints(country, direction, state){
        if(!state ){
            state = _.cloneDeep(this.state);
        }
        LookupService.getCountyPoints(country.iso, this.state.pointName.toUpperCase()).then(response => {
            _.get(state, direction).countryPoints = response.data;
            this.setState(state);
        }).catch(error => {
            _.get(state, direction).countryPoints = null;
            this.setState({state});
            console.log(error);
            Notify.showError(error);
        });
    }

    retrieveCrossDocks(product = this.props.product){
        let country = product.country;
        let point = product.point;
        if(!country  || !point) {
            this.setState({locations: []});
            return;
        }
        LocationService.retrieveWarehouses("EKOL_WAREHOUSE", null, null, null, country.iso, point.code).then(response => {
            let warehouses = [];
            response.data.forEach(warehouse => {
                warehouses.push({
                    id: warehouse.location.id,
                    name: warehouse.location.name,
                    location: warehouse.location,
                    company: warehouse.company
                });
            });
                this.setState({
                    locations : warehouses
               });

        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }


    getCalculationTypes(shipmentLoadingType){
        LookupService.getCalculationTypes(shipmentLoadingType).then(response => {
            this.setState({calculationTypes: response.data});
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    getCustomsServiceTypes(){
        LookupService.getCustomsServiceTypes().then(response => {
            this.setState({customsServiceTypes: response.data.map(item => {return {id: item, code: item, name: item}})});
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    getCustomsOffices(){
        LocationService.retrieveCustomsOffices().then(response => {
            this.setState({customsOffices: response.data});
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    getScope(shipmentLoadingType){
        if(!shipmentLoadingType){
            return this.getDefaultScope();
        }
        if(this.props.product.serviceArea.code === 'DTR' && shipmentLoadingType === 'LTL'){
            return "DOMESTIC_LTL";
        }
        return shipmentLoadingType;
    }

    getDefaultScope () {
        switch (this.props.product.serviceArea.code) {
            case 'ROAD':
                return 'LTL';

            case 'SEA':
                return 'LCL';

            case 'AIR':
                return 'AIR';

            case 'DTR':
                return 'DOMESTIC_LTL';

            case 'CCL':
                return 'CUSTOMS';

            case 'WHM' :
                return 'WAREHOUSE';

            default:
                return null;
        }
    }

    retrieveUnitOfMeasures(shipmentLoadingType){
        LookupService.getUnitOfMeasures(this.getScope(shipmentLoadingType)).then(response => {
            if(!this.props.unitOfMeasure && !_.isEmpty(response.data) && response.data.length === 1){
                this.handleChange("unitOfMeasure", response.data[0]);
            }
            this.setState({unitOfMeasures: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    validate(){
        if(!this.form.validate()){
            return false;
        }
        return true;
    }

    updateState(key, value) {
        let state = _.cloneDeep(this.state);
        _.set(state, key, value)
        this.setState(state);
    }

    handleChange(key, value){
        let product = _.cloneDeep(this.props.product);
        _.set(product, key, value)
        if(key === 'fromCountry'){
            product.fromPoint = null;
        }else if(key === 'toCountry'){
            product.toPoint = null;
        }else if(key === 'country'){
            product.point =null;
            product.crossDock = null;
        }else if(key === 'point'){
            product.crossDock= null;
        }else if(key === 'shipmentLoadingType'){
            product.unitOfMeasure = null;
            if(product.priceOriginal){
                product.priceOriginal.amount = null;
            }
        }
        else if(key ==='crossDock'){
            product.crossDock = value ? value.location : null;
        }
        if(product.expectedTurnoverOriginal){
            if(product.expectedTurnoverOriginal.amount==0.00){
                product.expectedTurnoverOriginal.amount=null;
            }
        }
        if(product.priceOriginal){
            if(product.priceOriginal.amount==0.00){
                product.priceOriginal.amount=null;
            }
        }
        console.log(product);
        this.props.onChange(product);
    }

    handleCurrencyChange(value){
        let product = _.cloneDeep(this.props.product);
        if(value==null){
            if(product.expectedTurnoverOriginal.currency){
                _.unset(product, "expectedTurnoverOriginal.currency");
            }
            if(product.priceOriginal.currency){
                _.unset(product, "priceOriginal.currency");
            }
        }else{
            _.set(product, "expectedTurnoverOriginal.currency", value);
            _.set(product, "priceOriginal.currency", value);
        }

        this.props.onChange(product);
    }

    arrangeFromPostal(){
        if (this.props.quote.discriminator == "TENDER"){
            return(
                <DropDown options = {this.state.loading.countryPoints} label="From Postal"
                          value = {this.props.product.fromPoint}
                          onchange = {(value) => {value ? this.handleChange("fromPoint", value) : null}}/>
            )
        }else {
            return(
                <DropDown options = {this.state.loading.countryPoints} label="From Postal"
                          value = {this.props.product.fromPoint} required={true}
                          onchange = {(value) => {value ? this.handleChange("fromPoint", value) : null}}/>
            )
        }
    }
    arrangeToPostal(){
        if (this.props.quote.discriminator == "TENDER"){
            return(
                <DropDown options = {this.state.delivery.countryPoints} label="To Postal"
                          value = {this.props.product.toPoint}
                          onchange = {(value) => {value ? this.handleChange("toPoint", value) : null}}/>
            )
        }
        else{
            return(
                <DropDown options = {this.state.delivery.countryPoints} label="To Postal"
                          required= {this.props.quote.serviceArea.code === 'ROAD'}
                          value = {this.props.product.toPoint}
                          onchange = {(value) => this.handleChange("toPoint", value)}/>
            )
        }
    }
    arrangeQuantityPerYear(){
        if (this.props.quote.discriminator == "TENDER"){
            return(
                <NumberInput label="Quantity per Year" maxLength={"8"} style={{textAlign: "right"}}
                             value = {this.props.product.quantity}
                             onchange = {(value) => this.handleChange("quantity", value)}/>
            )
        }else {
            return(
                <NumberInput label="Quantity per Year" maxLength={"8"} style={{textAlign: "right"}}
                             value = {this.props.product.quantity} required={true}
                             onchange = {(value) => this.handleChange("quantity", value)}/>
            )
        }
    }
    arrangeExpectedTurnoverPerYear(){
        if (this.props.quote.discriminator == "TENDER"){
            return(
                <NumericInput label = "Expected Turnover per Year" digits="2" digitsOptional = {false}
                              value = {this.props.product.expectedTurnoverOriginal ? this.props.product.expectedTurnoverOriginal.amount : null}
                              onchange = {(value) => this.handleChange("expectedTurnoverOriginal.amount", value)}/>
            )
        }else {
            return(
                <NumericInput label = "Expected Turnover per Year" digits="2" digitsOptional = {false} required={true}
                              value = {this.props.product.expectedTurnoverOriginal ? this.props.product.expectedTurnoverOriginal.amount : null}
                              onchange = {(value) => this.handleChange("expectedTurnoverOriginal.amount", value)}/>
            )
        }
    }

    arrangeCurrency() {
        if (this.props.quote.discriminator == "TENDER") {
            if (!((this.props.product.expectedTurnoverOriginal && this.props.product.expectedTurnoverOriginal.amount > 0.00) ||
                (this.props.product.priceOriginal && this.props.product.priceOriginal.amount > 0.00))) {
                return (
                    <DropDown options={this.state.currencies} label="Currency"
                              value={this.props.product.expectedTurnoverOriginal ? this.props.product.expectedTurnoverOriginal.currency : null}
                              onchange={(value) => this.handleCurrencyChange(value)}/>
                )
            }

        }
        return (
            <DropDown options={this.state.currencies} label="Currency"
                      required={true}
                      value={this.props.product.expectedTurnoverOriginal ? this.props.product.expectedTurnoverOriginal.currency : null}
                      onchange={(value) => this.handleCurrencyChange(value)}/>
        )
    }

    getContent () {
        switch (this.props.product.serviceArea.code) {
            case 'ROAD':
                return this.renderRoadProduct();

            case 'SEA':
                return this.renderSeaProduct();

            case 'AIR':
                return this.renderAirProduct();

            case 'DTR':
                return this.renderDomesticProduct(); 

            case 'CCL':
                return this.renderCustomsProduct();
            
            case 'WHM' :
                return this.renderWarehouseProduct();

            default:
                return null;
        }
    }

    renderRoadProduct(){
        return (
            <Grid widthLarge={true}>
                <GridCell width="1-4">
                    <DropDown options = {this.state.countries} label="From Country" valueField="iso"
                              translate={true}
                              value = {this.props.product.fromCountry} required={true}
                              onchange = {(country) => this.handleChange("fromCountry", country)} />
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeFromPostal()}
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.countries} label="To Country" valueField="iso"
                              translate={true}
                              value = {this.props.product.toCountry} required={true}
                              onchange = {(country) => this.handleChange("toCountry", country)} />
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeToPostal()}
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.existenceTypes} label="New/Existing"
                              translate={true}
                              value = {this.props.product.existence} required={true}
                              onchange = {(value) => this.handleChange("existence", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.shipmentLoadingTypes} label="FTL/LTL"
                              value = {this.props.product.shipmentLoadingType} required={true}
                              onchange = {(shipmentLoadingType) => {shipmentLoadingType ? this.handleChange("shipmentLoadingType", shipmentLoadingType.code) : null}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.unitOfMeasures} label="Unit of Measure"
                              translate={true}
                              value = {this.props.product.unitOfMeasure} required={true}
                              onchange = {(value) => this.handleChange("unitOfMeasure", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeQuantityPerYear()}
                </GridCell>
                <GridCell width="1-4">
                    <NumericInput label = "Price" digits="2" digitsOptional = {false}
                                  disabled={this.props.product.shipmentLoadingType && 'LTL' === this.props.product.shipmentLoadingType}
                                  value = {this.props.product.priceOriginal ? this.props.product.priceOriginal.amount : null}
                                  onchange = {(value) => this.handleChange("priceOriginal.amount", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeExpectedTurnoverPerYear()}
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeCurrency()}
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.incoterms} label="Incoterm"  labelField = "name"
                              valueField="code" value={this.props.product.incoterm}
                              onchange = {(incoterm) => {incoterm ? this.handleChange("incoterm", incoterm.code) : null}}/>
                </GridCell>
            </Grid>
        );
    }

    renderSeaProduct(){
        return (
            <Grid widthLarge={true}>
                <GridCell width="1-4">
                    <DropDown options = {this.state.countries} label="From Country" valueField="iso"
                              translate={true}
                              value = {this.props.product.fromCountry} required={true}
                              onchange = {(country) => this.handleChange("fromCountry", country)} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.loading.countryPoints} label="From Port"
                              value = {this.props.product.fromPoint} required={true}
                              onchange = {(value) => {value ? this.handleChange("fromPoint", value) : null}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.countries} label="To Country" valueField="iso"
                              translate={true}
                              value = {this.props.product.toCountry} required={true}
                              onchange = {(country) => this.handleChange("toCountry", country)} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.delivery.countryPoints} label="To Port"
                              value = {this.props.product.toPoint} required={true}
                              onchange = {(value) => {value ? this.handleChange("toPoint", value) : null}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.existenceTypes} label="New/Existing"
                              translate={true}
                              value = {this.props.product.existence} required={true}
                              onchange = {(value) => this.handleChange("existence", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.shipmentLoadingTypes} label="FCL/LCL"
                              value = {this.props.product.shipmentLoadingType} required={true}
                              onchange = {(shipmentLoadingType) => {shipmentLoadingType ? this.handleChange("shipmentLoadingType", shipmentLoadingType.code) : null}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.unitOfMeasures} label="Unit of Measure"
                              translate={true}
                              value = {this.props.product.unitOfMeasure} required={true}
                              onchange = {(value) => this.handleChange("unitOfMeasure", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeQuantityPerYear()}
                </GridCell>
                <GridCell width="1-4">
                    <NumericInput label = "Price" digits="2" digitsOptional = {false}
                                  disabled={this.props.product.shipmentLoadingType && 'LCL' === this.props.product.shipmentLoadingType}
                                  value = {this.props.product.priceOriginal ? this.props.product.priceOriginal.amount : null}
                                  onchange = {(value) => this.handleChange("priceOriginal.amount", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeExpectedTurnoverPerYear()}
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeCurrency()}
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.incoterms} label="Incoterm"  labelField = "name"
                              valueField="code" value={this.props.product.incoterm}
                              onchange = {(incoterm) => {incoterm ? this.handleChange("incoterm", incoterm.code) : null}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.incotermExplanations} label="Incoterm Explanation"  labelField = "name"
                              translate={true}
                              valueField="code" value={this.props.product.incotermExplanation}

                              onchange = {(incotermExplanation) => {incotermExplanation ? this.handleChange("incotermExplanation", incotermExplanation.code) : null}}/>
                </GridCell>
            </Grid>
        );
    }

    renderAirProduct(){
        return (
            <Grid widthLarge={true}>
                <GridCell width="1-4">
                    <DropDown options = {this.state.countries} label="From Country" valueField="iso"
                              translate={true}
                              value = {this.props.product.fromCountry} required={true}
                              onchange = {(country) => this.handleChange("fromCountry", country)} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.loading.countryPoints} label="From Airport"
                              value = {this.props.product.fromPoint} required={true}
                              onchange = {(value) => {value ? this.handleChange("fromPoint", value) : null}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.countries} label="To Country" valueField="iso"
                              translate={true}
                              value = {this.props.product.toCountry} required={true}
                              onchange = {(country) => this.handleChange("toCountry", country)} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.delivery.countryPoints} label="To Airport"
                              value = {this.props.product.toPoint} required={true}
                              onchange = {(value) => {value ? this.handleChange("toPoint", value) : null}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.existenceTypes} label="New/Existing"
                              translate={true}
                              value = {this.props.product.existence} required={true}
                              onchange = {(value) => this.handleChange("existence", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.unitOfMeasures} label="Unit of Measure"
                              translate={true}
                              value = {this.props.product.unitOfMeasure} required={true}
                              onchange = {(value) => this.handleChange("unitOfMeasure", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeQuantityPerYear()}
                </GridCell>
                <GridCell width="1-4">
                    <NumericInput label = "Price" digits="2" digitsOptional = {false}
                                  value = {this.props.product.priceOriginal ? this.props.product.priceOriginal.amount : null}
                                  onchange = {(value) => this.handleChange("priceOriginal.amount", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeExpectedTurnoverPerYear()}
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeCurrency()}
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.incoterms} label="Incoterm"  labelField = "name"
                              valueField="code" value={this.props.product.incoterm}
                              onchange = {(incoterm) => {incoterm ? this.handleChange("incoterm", incoterm.code) : null}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.incotermExplanations} label="Incoterm Explanation"  labelField = "name"
                              translate={true}
                              valueField="code" value={this.props.product.incotermExplanation}
                              onchange = {(incotermExplanation) => {incotermExplanation ? this.handleChange("incotermExplanation", incotermExplanation.code) : null}}/>
                </GridCell>
            </Grid>
        );
    }

    renderDomesticProduct(){
        return (
            <Grid widthLarge={true}>
                <GridCell width="1-4">
                    {this.arrangeFromPostal()}
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeToPostal()}
                </GridCell>
                <GridCell width="2-4">
                    <Chip label="Vehicle Type" options={this.state.vehicleTypes} 
                        translate={true}
                        value={this.props.product.vehicleType}
                        onchange = {(value) => this.handleChange("vehicleType", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.existenceTypes} label="New/Existing"
                              translate={true}
                              value = {this.props.product.existence} required={true}
                              onchange = {(value) => this.handleChange("existence", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.shipmentLoadingTypes} label="Transportation Type"
                              translate={true}
                              value = {this.props.product.shipmentLoadingType} required={true}
                              onchange = {(shipmentLoadingType) => {shipmentLoadingType ? this.handleChange("shipmentLoadingType", shipmentLoadingType.code) : null}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.calculationTypes} label="Calculation Type"
                              translate={true}
                              value = {this.props.product.calculationType} required={true}
                              onchange = {(value) => {value ? this.handleChange("calculationType", value) : null}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.unitOfMeasures} label="Unit of Measure"
                              translate={true}
                              value = {this.props.product.unitOfMeasure} required={true}
                              onchange = {(value) => this.handleChange("unitOfMeasure", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeQuantityPerYear()}
                </GridCell>
                <GridCell width="1-4">
                    <NumericInput label = "Price" digits="2" digitsOptional = {false}
                                  disabled={!(this.props.product.shipmentLoadingType  === 'FTL' || this.props.product.shipmentLoadingType === 'DEDICATED')}
                                  value = {this.props.product.priceOriginal ? this.props.product.priceOriginal.amount : null}
                                  onchange = {(value) => this.handleChange("priceOriginal.amount", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeExpectedTurnoverPerYear()}
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeCurrency()}
                </GridCell>
            </Grid>
        );
    }

    renderCustomsProduct(){
        return (
            <Grid widthLarge={true}>
                <GridCell width="1-4">
                    <DropDown options = {this.state.customsServiceTypes} label="Customs Service Types"
                              translate={true}
                              value = {this.props.product.customsServiceType} required={true}
                              onchange = {(customsServiceType) => {customsServiceType ? this.handleChange("customsServiceType", customsServiceType.code) : null}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.customsOffices} label="Customs Offices"
                              value={this.props.product.customsOffice}
                              onchange={(value) => this.handleChange("customsOffice", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.existenceTypes} label="New/Existing"
                              translate={true}
                              value = {this.props.product.existence} required={true}
                              onchange = {(value) => this.handleChange("existence", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.unitOfMeasures} label="Unit of Measure"
                              translate={true}
                              value = {this.props.product.unitOfMeasure} required={true}
                              onchange = {(value) => this.handleChange("unitOfMeasure", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeQuantityPerYear()}
                </GridCell>
                <GridCell width="1-4">
                    <NumericInput label = "Price" digits="2" digitsOptional = {false}
                                  value = {this.props.product.priceOriginal ? this.props.product.priceOriginal.amount : null}
                                  onchange = {(value) => this.handleChange("priceOriginal.amount", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeExpectedTurnoverPerYear()}
                </GridCell>
                <GridCell width="1-4">
                    {this.arrangeCurrency()}
                </GridCell>
            </Grid>
        );
    }

    renderWarehouseProduct(){
        return (
            <Grid widthLarge={true}>
                <GridCell width="1-3">
                    <DropDown options = {this.state.countries} label="Country" valueField="iso"
                              translate={true}
                              value = {this.props.product.country} required={true}
                              onchange = {(country) => this.handleChange("country", country)} />
                </GridCell>
                <GridCell width="1-3">
                    <DropDown options = {this.state.points.countryPoints} label="Postal"
                          value = {this.props.product.point} required={true}
                          onchange = {(value) => {value ? this.handleChange("point", value) : null}}/>
                </GridCell>
                <GridCell width="1-3">
                    <DropDown label="Warehouse"
                        value = {this.props.product.crossDock} readOnly={this.props.readOnly}
                        options= {this.state.locations}
                        onchange = {(value) => this.handleChange("crossDock", value)}
                    />
                </GridCell>
                <GridCell width="1-3">
                    <DropDown options={this.state.existenceTypes} label="Existence"
                              translate={true}
                              value = {this.props.product.existence} required={true}
                              onchange = {(value) => this.handleChange("existence", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    {this.arrangeExpectedTurnoverPerYear()}
                </GridCell>
                <GridCell width="1-3">
                    {this.arrangeCurrency()}
                </GridCell>
            </Grid>
        );
    }

    render(){
        return(
            <div>
                <Form ref = {c => this.form = c}>
                    {this.getContent()}
                </Form>
            </div>
        );
    }
}