import * as axios from 'axios';
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Date, NumberInput } from "susam-components/advanced";
import { DropDown, Form, Notify, Span } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";
import { CountryDropDown, CountryPointDropDown } from "../../../common";
import { LocationService, LookupService, PricingService } from "../../../services";
import { LoadingIndicator, ObjectUtils, PromiseUtils, QuoteUtils } from '../../../utils';

var moment = require("moment");

export class SpotProduct extends TranslatingComponent {

    static defaultProps = {
        product: {}
    };

    state = {
        loading: {},
        delivery: {},
        allPoints: []
    };

    get operation() {
        return _.get(this.pricingConfig, 'operation');
    }

    get pricingConfig() {
        return _.get(this.props, 'pricingConfig');
    }

    resetProductTariffRegion() {
        this.handleChangeMultiple({
            collectionTariffRegion: null,
            collectionWarehouse: null,
            deliveryTariffRegion: null,
            deliveryWarehouse: null
        });
        this.updateState(`loading.tariffRegionParameters`, null)
        this.updateState(`delivery.tariffRegionParameters`, null)
    }

    componentDidMount() {
        this.adjustPointName();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(_.get(this.props, 'product.fromCountry'), _.get(prevProps, 'product.fromCountry'))
            || !_.isEqual(_.get(this.props, 'product.toCountry'), _.get(prevProps, 'product.toCountry'))) {
            this.determinePricingOperation();
        }
        if (this.operation != _.get(prevProps,'pricingConfig.operation')
            ||('EXPORT' === this.operation && _.get(prevProps, 'product.collectionWarehouse.id') !== _.get(this.props, 'product.collectionWarehouse.id'))
            || ('EXPORT' !== this.operation && _.get(prevProps, 'product.fromCountry.iso') !== _.get(this.props, 'product.fromCountry.iso'))) {
            this.retrieveCountryPoints(_.get(this.props, 'product.fromCountry'), 'loading');
        }
        if (this.operation != _.get(prevProps,'pricingConfig.operation')
            ||('IMPORT' === this.operation && _.get(prevProps, 'product.deliveryWarehouse.id') !== _.get(this.props, 'product.deliveryWarehouse.id'))
            || ('IMPORT' !== this.operation && _.get(prevProps, 'product.toCountry.iso') !== _.get(this.props, 'product.toCountry.iso'))) {
            this.retrieveCountryPoints(_.get(this.props, 'product.toCountry'), 'delivery');
        }
        if (_.get(prevProps, 'product.toCountry.iso') !== _.get(this.props, 'product.toCountry.iso') 
            || _.get(prevProps, 'product.fromCountry.iso') !== _.get(this.props, 'product.fromCountry.iso') ) {
            this.getDeliveryTypes(_.get(this.props, 'product'));
        }

        if (this.props.product.shipmentLoadingType &&
            this.props.product.shipmentLoadingType !== prevProps.product.shipmentLoadingType) {
            this.getCalculationTypes(this.props.product.shipmentLoadingType);
        }

        if (_.get(prevProps.product, 'fromPoint.id') !== _.get(this.props.product, 'fromPoint.id')) {
            let loadingType = _.get(this.props, 'product.loadingType');
            if (loadingType) {
                this.retrieveWarehouses('loading', loadingType)
            }
        }
        if (_.get(prevProps.product, 'toPoint.id') !== _.get(this.props.product, 'toPoint.id')) {
            let deliveryType = _.get(this.props, 'product.deliveryType');
            if (deliveryType) {
                this.retrieveWarehouses('delivery', deliveryType)
            }
        }
        if (_.get(prevProps.product, 'loadingType.id') !== _.get(this.props.product, 'loadingType.id')
            && _.isEmpty(this.props.product.loadingCountry)
            && _.find(["SEA", "AIR"], i => this.props.product.serviceArea.code === i)
            && _.isEqual("CUSTOMER_ADDRESS", this.props.product.loadingType.id)) {
            let loadingCountry = _.get(this.props, 'product.fromCountry');
            this.handleChange("loadingCountry", loadingCountry);
        }

        if (_.get(prevProps.product, 'deliveryType.id') !== _.get(this.props.product, 'deliveryType.id')
            && _.isEmpty(this.props.product.deliveryCountry)
            && _.find(["SEA", "AIR"], i => this.props.product.serviceArea.code === i)
            && _.isEqual("CUSTOMER_ADDRESS", this.props.product.deliveryType.id)) {
            let deliveryCountry = _.get(this.props, 'product.toCountry');
            this.handleChange("deliveryCountry", deliveryCountry);
        }
        this.retrieveTariffRegions();
        if(this.operation !== _.get(prevProps, 'pricingConfig.operation') && ["IMPORT","EXPORT"].find(i=>i!=this.operation)){
            this.resetProductTariffRegion();
        }
    }

    adjustPointName() {
        let pointName;
        if (this.props.product.serviceArea.code === 'ROAD' || this.props.product.serviceArea.code === 'DTR') {
            pointName = 'Postal';
        } else if (this.props.product.serviceArea.code === 'SEA') {
            pointName = 'Port';
        } else if (this.props.product.serviceArea.code === 'AIR') {
            pointName = 'Airport';
        }
        this.setState({pointName, pointName}, () => this.initializeLookups())
    }

    initializeLookups() {
        if (this.props.product.serviceArea.code === 'DTR') {
            let code = _.get(this.props.product, 'shipmentLoadingType.code');
            if (code) {
                this.getCalculationTypes(code);
            }
        } else {
            this.getIncoterms();
            if (!this.props.loadingAndDelivery) {
                this.getCountries();
            }
        }
        this.getShipmentLoadingTypes();
        this.getLoadingTypes();
        if (this.props.product.toCountry && this.props.product.fromCountry) {
            this.getDeliveryTypes(this.props.product);
        }
        if (_.find(['ROAD', 'DTR'], i => this.props.product.serviceArea.code === i)) {
            this.retrieveWarehouses("loading", this.props.product.loadingType);
            this.retrieveWarehouses("delivery", this.props.product.deliveryType);
        }

        //adjust loading country points
        if (_.get(this.props, 'product.fromCountry')) {
            this.retrieveCountryPoints(this.props.product.fromCountry, 'loading');
        }

        //adjust delivery country points
        if (_.get(this.props, 'product.toCountry')) {
            this.retrieveCountryPoints(this.props.product.toCountry, 'delivery');
        }
        this.retrieveAllCountryPoints();
    }

    retrieveAllCountryPoints() {
        if (['SEA', 'AIR'].includes(this.props.product.serviceArea.code)) {
            LookupService.getAllCountryPointsByType(this.state.pointName.toUpperCase()).then(response => {
                this.updateState('allPoints', response.data);
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    adjustCountryPoints(direction, list) {
        let dir = _.isEqual(direction, 'loading') ? 'from' : 'to';
        let points = _.get(this.props, `loadingAndDelivery.${dir}Point`);
        return _.isEmpty(points) ? list : points;
    }

    getCountries() {
        LookupService.getCountries().then(response => {
            this.setState({ countries: response.data });
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    retrieveCountryPoints(country, direction) {
        let { pricingConfig, product } = this.props;
        let { pointName } = this.state;
        let point = 'loading' === direction ? 'fromPoint' : 'toPoint';

        if(!country){
            this.updateState(`${direction}.countryPoints`, null);
            return
        }

        let listTariffPoints = ()=>PromiseUtils.getFakePromise([]);
        let fetchFromTariff = (('IMPORT' === this.operation && 'toPoint' === point ) || ('EXPORT' === this.operation && 'fromPoint' === point ));
        if('Postal' === pointName && fetchFromTariff){
            let parameter={
                WAREHOUSE: _.get(product, 'collectionWarehouse.id') || _.get(product, 'deliveryWarehouse.id'),
                COUNTRY: country.iso,
                OPERATION: 'IMPORT' === this.operation?'DELIVERY':'COLLECTION'
            };
            if(!parameter.WAREHOUSE){
                this.updateState(`${direction}.countryPoints`, null);
                return 
            }
            listTariffPoints = ()=>PricingService.query('local-region', pricingConfig.subsidiary.id, parameter);
        }

        axios.all([
            LookupService.getCountyPoints(country.iso, this.state.pointName.toUpperCase()),
            listTariffPoints()
        ]).then(axios.spread((points, tariffPoints)=>{
            let countryTariffPoints = ObjectUtils.expressionToArray(tariffPoints.data.map(i=>i.postalCodes)).map(i=>ObjectUtils.enumHelper(i));
            let countryPoints = this.adjustCountryPoints(direction, points.data);
            if(!_.isEmpty(countryTariffPoints)){
                countryPoints = _.filter(countryPoints, i=>_.find(countryTariffPoints, j=>i.code === j.code))
            }
            this.updateState(`${direction}.countryPoints`, countryPoints);
            if (!_.isEmpty(countryPoints) && 1 === countryPoints.length) {
                this.handleChange(point, _.first(countryPoints))
            }
        })).catch(error => {
            this.updateState(`${direction}.countryPoints`, null);
            console.log(error);
            Notify.showError(error);
        });
    }

    adjustShipmentLoadingTypes(shipmentLoadingTypesRaw) {
        let shipmentLoadingTypes = [];
        if (this.props.product.serviceArea.code === 'ROAD') {
            if (!_.isEmpty(shipmentLoadingTypesRaw)) {
                shipmentLoadingTypesRaw.forEach(data => {
                    let masterCode = data.code.substring(0, 3);
                    if (!_.some(shipmentLoadingTypes, { code: masterCode })) {
                        shipmentLoadingTypes.push({ id: masterCode, code: masterCode, name: masterCode })
                    }
                });
            }
        } else {
            shipmentLoadingTypes = shipmentLoadingTypesRaw;
        }
        this.updateState("shipmentLoadingTypes", shipmentLoadingTypes);
    }

    getShipmentLoadingTypes() {
        if (this.props.loadingAndDelivery) {
            this.adjustShipmentLoadingTypes(this.props.loadingAndDelivery.shipmentLoadingTypes);
        } else {
            LookupService.getShipmentLoadingType(this.props.product.serviceArea.code).then(response => {
                this.adjustShipmentLoadingTypes(response.data);
            }).catch(error => {
                console.log(error);
                Notify.showError(error);
            });
        }
    }

    getIncoterms() {
        axios.all([
            LookupService.getIncoterms(),
            LookupService.getIncotermExplanation()
        ]).then(axios.spread((incoterm, incotermExplanation) => {
            this.setState(prevState => {
                prevState.incoterms = incoterm.data;
                prevState.incotermExplanations = incotermExplanation.data;
                return incoterm
            });
        })).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    getCalculationTypes(shipmentLoadingType) {
        LookupService.getCalculationTypes(shipmentLoadingType).then(response => {
            this.updateState("calculationTypes", response.data);
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    getLoadingTypes() {
        LookupService.getLoadingTypes(this.props.product.serviceArea.code).then(response => {
            let loadingTypes = response.data;
            this.updateState('loading.types', loadingTypes);
            if (_.isEmpty(this.props.product.loadingType)) {
                this.handleChange("loadingType", _.find(loadingTypes, { code: "PORT_ADDRESS" }));
            }
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    getDeliveryTypes(product = this.prop.product) {
        QuoteUtils.determineProductOperation(product).then(operation => {
            LookupService.getDeliveryTypes(operation, product.serviceArea.code).then(response => {
                let deliveryTypes = response.data;
                this.updateState('delivery.types', deliveryTypes);
                if (_.isEmpty(this.props.product.deliveryType)) {
                    this.handleChange("deliveryType", _.find(deliveryTypes, { code: "PORT_ADDRESS" }));
                }
            }).catch(error => {
                console.log(error);
                Notify.showError(error);
            });
        }).catch(error=>Notify.showError(error));
    }

    retrieveTariffRegions(){
        this.retrieveTariffRegion('EXPORT');
        this.retrieveTariffRegion('IMPORT');
    }

    retrieveTariffRegion(operation){
        let {product} = this.props;
        let activity = "EXPORT" == operation ? 'loading' : 'delivery';
        let country =  _.get(product, 'loading' === activity ? 'fromCountry.iso' : 'toCountry.iso' )
        let point =  _.get(product, 'loading' === activity ? 'fromPoint.name' : 'toPoint.name' );
        let warehouse = _.get(product, 'loading' === activity ? 'collectionWarehouse.id' : 'deliveryWarehouse.id' );
        let subsidiaryCountry = _.get(this.pricingConfig, 'subsidiaryCountry.iso');
        let subsidiaryId = _.get(this.pricingConfig, 'subsidiary.id');
        let collOrDel = 'loading' === activity ? 'COLLECTION' : 'DELIVERY';
        if(['EXPORT', 'IMPORT'].find(i=>i === this.operation)){
            let path = null;
            let parameters = {
                COUNTRY: country,
                POSTAL_CODE: point,
                OPERATION: collOrDel
            }
            if(country === subsidiaryCountry){
                parameters.WAREHOUSE = warehouse;
                if(!ObjectUtils.hasNull(parameters)){
                    path = 'local-region';
                }
            } else {
                if(!ObjectUtils.hasNull(parameters)){
                    path = 'foreign-region';
                }
            }
            if(path && !_.isEqual(parameters, _.get(this.state, `${activity}.tariffRegionParameters`))){
                this.updateState(`${activity}.tariffRegionParameters`, parameters)
                PricingService.query(path, subsidiaryId, parameters).then(response=>{
                    this.updateState(`${activity}.tariffRegions`, response.data)
                    if(1 === response.data.length){
                        this.handleChange(`${_.toLower(collOrDel)}TariffRegion`, _.first(response.data))
                    }
                }).catch(error=>Notify.showError(error));
            }
        } else if(_.get(this.props, `product.${_.toLower(collOrDel)}TariffRegion`)) {
            this.handleChange(`${_.toLower(collOrDel)}TariffRegion`, null)
        }
    }

    retrieveWarehouses(activity, type) {
        if (type && type.source === 'WAREHOUSE') {
            let country = 'loading' === activity ? this.props.product.fromCountry : this.props.product.toCountry;
            let point = 'loading' === activity ? (this.props.product.fromPoint || {}).name : (this.props.product.toPoint || {}).name;
            LocationService.retrieveWarehouses(type.ownerType, type.customsType, type.companyType, null, country.iso, point).then(response => {
                let warehouses = [];
                response.data.forEach(warehouse => {
                    warehouses.push({
                        id: warehouse.location.id,
                        name: warehouse.location.name,
                        location: warehouse.location,
                        company: warehouse.company
                    });
                });
                this.updateState(`${activity}.locations`, warehouses);
            }).catch(error => {
                this.updateState(`${activity}.locations`, []);
                Notify.showError(error);
            });
        } else {
            this.updateState(`${activity}.locations`, []);
        }
    }

    validate() {
        if (this.props.product.loadingType && this.props.product.loadingType.source) {
            if (!this.props.product.loadingLocation) {
                Notify.showError("Loading Address should not be empty");
                return false;
            }
        }
        if (this.props.product.deliveryType && this.props.product.deliveryType.source) {
            if (!this.props.product.deliveryLocation) {
                Notify.showError("Delivery Address should not be empty");
                return false;
            }
        }
        return this.form.validate();
    }

    updateState(key, value) {
        this.setState(prevState => {
            _.set(prevState, key, value);
            return prevState;
        });
    }

    handleChange(key, value) {
        let product = this.updateProduct(key, value);
        this.props.onChange(product);
    }

    handleChangeMultiple(values) {
        let product = _.cloneDeep(this.props.product);
        for(let key in values) {
            product = this.updateProduct(key, values[key], product);
        }
        this.props.onChange(product);
    }

    updateProduct(key, value, product = _.cloneDeep(this.props.product)) {
        product[key] = value;
        if (key === 'fromCountry') {
            product.fromPoint = null;
            product.loadingLocation = null;
            product.loadingCompany = null;
            product.collectionWarehouse = null;
            product.collectionTariffRegion = null;
            _.isNil(value) && this.updateState('loading.countryPoints', null);
        } else if (key === 'fromPoint') {
            product.loadingLocation = null;
            product.loadingCompany = null;
        } else if (key === 'toCountry') {
            product.toPoint = null;
            product.deliveryType = null;
            product.deliveryLocation = null;
            product.deliveryCompany = null;
            product.deliveryWarehouse = null;
            product.deliveryTariffRegion = null;
            _.isNil(value) && this.updateState('delivery.countryPoints', null);
        } else if (key === 'toPoint') {
            product.deliveryLocation = null;
            product.deliveryCompany = null;
        } else if (key === 'loadingLocation') {
            product.loadingLocation = value ? value.location : null;
            product.loadingCompany = value ? value.company : null;
        } else if (key === 'shipmentLoadingType') {
            if (this.props.product.serviceArea.code === 'ROAD') {
                product.vehicleCount = 1;
            }
        } else if (key === 'deliveryLocation') {
            product.deliveryLocation = value ? value.location : null;
            product.deliveryCompany = value ? value.company : null;
        } else if (key === 'loadingType') {
            product.loadingLocation = null;
            product.loadingCountry = null;
            product.loadingCountryPoint = null;
        } else if (key === 'deliveryType') {
            product.deliveryLocation = null;
            product.deliveryCountry = null;
            product.deliveryCountryPoint = null;
        } else if (key === 'earliestReadyDate') {
            product.latestReadyDate = value;
        } else if (key === 'collectionWarehouse') {
            product.collectionTariffRegion = null;
            product.fromPoint = null;
        } else if (key === 'deliveryWarehouse') {
            product.deliveryTariffRegion = null;
            product.toPoint = null;
        }
        
        return product;
    }

    handleTypeChange(activity, type) {
        this.retrieveWarehouses(activity, type);
        let key = activity + "Type";
        this.handleChange(key, type);
    }

    renderLoadingInfo() {
        return (
            <Grid>
                <GridCell width="1-2">
                    <DropDown options={this.state.loading.types} label="Loading Type"
                        value={this.props.product.loadingType} translate={true} required={true} readOnly={this.props.readOnly}
                        onchange={(value) => { value ? this.handleTypeChange("loading", value) : null }} />
                </GridCell>
                {this.renderLoadingAddress()}
            </Grid>
        );
    }

    renderLoadingAddress() {
        let locationRequired = this.props.product.deliveryType && this.props.product.deliveryType.source ? true : false;
        let serviceArea = _.get(this.props.product, 'serviceArea.code');

        if (_.isEmpty(this.props.product.loadingType)
            || (_.find(["ROAD", "DTR"], i => _.isEqual(i, serviceArea)) && this.props.product.loadingType.id == "CUSTOMER_ADDRESS")
            || (_.find(["SEA", "AIR"], i => _.isEqual(i, serviceArea)) && this.props.product.loadingType.id == "PORT_ADDRESS")) {
            return null;
        }
        else {
            if (_.find(["SEA", "AIR"], i => _.isEqual(i, serviceArea)) && this.props.product.loadingType.id == "CUSTOMER_ADDRESS") {
                return [
                    <GridCell width="1-4" key={0}>
                        <CountryDropDown placeHolder="Country" label="Loading Address" required={true}
                            value={this.props.product.loadingCountry}
                            valueField="iso"
                            translate={true}
                            onchange={(value) => this.handleChange("loadingCountry", value)} />
                    </GridCell>,
                    <GridCell width="1-4" key={1}>
                        <CountryPointDropDown placeHolder="Country Point" required={true}
                            multiple={false}
                            type="POSTAL"
                            country={this.props.product.loadingCountry}
                            value={this.props.product.loadingCountryPoint}
                            onchange={(value) => this.handleChange("loadingCountryPoint", value)} />
                    </GridCell>
                ]
            }
            else {
                return (
                    <GridCell width="1-2">
                        <DropDown options={this.state.loading.locations} label="Loading Address" required={locationRequired}
                            value={this.props.product.loadingLocation} readOnly={this.props.readOnly}
                            onchange={(value) => this.handleChange("loadingLocation", value)} />
                    </GridCell>
                );
            }

        }
    }

    renderDeliveryInfo() {
        return (
            <Grid>
                <GridCell width="1-2">
                    <DropDown options={this.state.delivery.types} label="Delivery Type"
                        value={this.props.product.deliveryType} translate={true} required={true} readOnly={this.props.readOnly}
                        onchange={(value) => { value ? this.handleTypeChange("delivery", value) : null }} />
                </GridCell>
                {this.renderDeliveryAddress()}
            </Grid>
        );
    }

    renderDeliveryAddress() {
        let locationRequired = this.props.product.deliveryType && this.props.product.deliveryType.source ? true : false;
        let serviceArea = _.get(this.props.product, 'serviceArea.code');

        if (_.isEmpty(this.props.product.deliveryType)
            || (_.find(["ROAD", "DTR"], i => _.isEqual(i, serviceArea)) && (this.props.product.deliveryType.id == "CUSTOMER_ADDRESS") ||  (this.props.product.deliveryType.id == "CUSTOMS_ADDRESS") )
            || (_.find(["SEA", "AIR"], i => _.isEqual(i, serviceArea)) && this.props.product.deliveryType.id == "PORT_ADDRESS")) {
            return null;
        }
        else {
            if (_.find(["SEA", "AIR"], i => _.isEqual(i, serviceArea)) && this.props.product.deliveryType.id == "CUSTOMER_ADDRESS") {
                return [
                    <GridCell width="1-4" key={0}>
                        <CountryDropDown placeHolder="Country" label="Delivery Address" required={true}
                            value={this.props.product.deliveryCountry}
                            valueField="iso"
                            translate={true}
                            onchange={(value) => this.handleChange("deliveryCountry", value)} />
                    </GridCell>,
                    <GridCell width="1-4" key={1}>
                        <CountryPointDropDown placeHolder="Country Point" required={true}
                            multiple={false}
                            type="POSTAL"
                            country={this.props.product.deliveryCountry}
                            value={this.props.product.deliveryCountryPoint}
                            onchange={(value) => this.handleChange("deliveryCountryPoint", value)} />
                    </GridCell>
                ];
            }
            else {
                return (
                    <GridCell width="1-2">
                        <DropDown options={this.state.delivery.locations} label="Delivery Address" required={locationRequired}
                            value={this.props.product.deliveryLocation} readOnly={this.props.readOnly}
                            onchange={(value) => this.handleChange("deliveryLocation", value)} />
                    </GridCell>
                );
            }
        }
    }

    renderReadyDate() {
        let today =  moment().format('DD/MM/YYYY');
        let minLatestReadyDate = this.props.product.earliestReadyDate ? this.props.product.earliestReadyDate : today;
        return (
            <Grid>
                <GridCell width="1-2">
                    <Date label="Ready Date (Earliest)" required={true} minDate={today} hideIcon={true}
                        value={this.props.product.earliestReadyDate ? this.props.product.earliestReadyDate : " "}
                        onchange={(value) => this.handleChange("earliestReadyDate", value)} />
                </GridCell>
                <GridCell width="1-2">
                    <Date label="Ready Date (Latest)" required={true} minDate={minLatestReadyDate} hideIcon={true}
                        value={this.props.product.latestReadyDate ? this.props.product.latestReadyDate : " "}
                        onchange={(value) => this.handleChange("latestReadyDate", value)} />
                </GridCell>
            </Grid>

        );
    }

    getContent() {
        switch (this.props.product.serviceArea.code) {
            case 'ROAD':
                return this.renderRoadProduct();

            case 'SEA':
                return this.renderSeaProduct();

            case 'AIR':
                return this.renderAirProduct();

            case 'DTR':
                return this.renderDomesticProduct();

            default:
                return null;
        }
    }

    determinePricingOperation(pricingConfig = _.cloneDeep(this.pricingConfig), product = this.props.product){
        let { onPricingConfigUpdate } = this.props;
        if(pricingConfig && onPricingConfigUpdate){
            pricingConfig.operation = QuoteUtils.determinePricingOperation(pricingConfig, product);
            onPricingConfigUpdate(pricingConfig);
        }
    }

    determineOperation(operation) {
        let { pricingConfig } = this.props;
        let ops = null;
        if(this.operation === operation) {
            if('IMPORT' === pricingConfig.operation){
                ops = 'delivery';
            } else if('EXPORT' === pricingConfig.operation) {
                ops = 'collection';
            }
        }
        return ops;
    }

    renderWarehouse(operation) {
        let { pricingConfig, product } = this.props;
        if (!pricingConfig) {
            return null;
        }
        let ops = this.determineOperation(operation);
        let ddl = null;
        if (ops) {
            ddl = <GridCell width="1-4">
                <DropDown label={`${_.capitalize(ops)} Warehouse`} required={true}
                    options={pricingConfig.warehouses}
                    value={product[`${ops}Warehouse`]}
                    onchange={value => this.handleChange(`${ops}Warehouse`, value)} />
            </GridCell>
        }
        return ddl;
    }

    renderTariffRegion(operation) {
        let { pricingConfig, product} = this.props;
        if (!pricingConfig) {
            return null;
        }
        let ops = ["IMPORT","EXPORT"].find(i=>i==this.operation) ? (operation == 'EXPORT'?'collection' : 'delivery'):null;
        let ddl = null;
        if(ops){
            let activity = 'collection' === ops ? 'loading' : 'delivery';
            ddl = <GridCell width="1-4">
                <DropDown label={`${_.capitalize(ops)} Region`} required={true} 
                    optionTooltip={{field: "postalCodes"}}
                    readOnly = {1 === _.get(this.state,`${activity}.tariffRegions`,[]).length}
                    options={_.get(this.state,`${activity}.tariffRegions`)}
                    value={product[`${ops}TariffRegion`]} valueField="code"
                    onchange={value=>this.handleChange(`${ops}TariffRegion`, value)} />
            </GridCell>
        }
        return ddl;
    }

    renderRoadCountryPoints(operation){
        let ops = this.determineOperation(operation);
        let ddl = null;
        if(!this.pricingConfig || this.operation){
            let activity = 'EXPORT' === operation ? 'loading' : 'delivery';
            let direction = 'loading' === activity ? 'from' : 'to';
            ddl = <DropDown options={_.get(this.state, `${activity}.countryPoints`)} label={`${_.startCase(direction)} Postal`} 
                        labelField="name" required={true} value={_.get(this.props, `product.${direction}Point`)}
                        readOnly={_.get(this.state, `${activity}.countryPoints.length`) === 1}
                        onchange={(value) => { value ? this.handleChange(`${direction}Point`, value) : null }} />;
        }
        return <GridCell width={ops || ["IMPORT","EXPORT"].find(i=>i===this.operation) ? '1-4':'1-2'}>{ddl}</GridCell>
    }

    renderRoadProduct() {
        return (
            <Grid widthLarge={true}>
                <GridCell width={this.determineOperation("EXPORT") ? '1-4':'1-2'}>
                    <DropDown options={this.state.countries} label="From Country" valueField="iso"
                        translate={true}
                        value={this.props.product.fromCountry} required={true} readOnly={this.props.loadingAndDelivery}
                        onchange={(country) => this.handleChange("fromCountry", country)} />
                </GridCell>
                {this.renderWarehouse('EXPORT')}
                {this.renderRoadCountryPoints('EXPORT')}
                {this.renderTariffRegion('EXPORT')}
                <GridCell width={this.determineOperation("IMPORT") ? '1-4':'1-2'}>
                    <DropDown options={this.state.countries} label="To Country" valueField="iso"
                        translate={true}
                        value={this.props.product.toCountry} required={true} readOnly={this.props.loadingAndDelivery}
                        onchange={(country) => this.handleChange("toCountry", country)} />
                </GridCell>
                {this.renderWarehouse('IMPORT')}
                {this.renderRoadCountryPoints('IMPORT')}
                {this.renderTariffRegion('IMPORT')}
                <GridCell width="1-2">
                    <DropDown options={this.state.shipmentLoadingTypes} label="FTL/LTL"
                        readOnly={((this.props.loadingAndDelivery || {}).shipmentLoadingTypes || []).length === 1}
                        value={this.props.product.shipmentLoadingType} required={true}
                        onchange={(shipmentLoadingType) => { shipmentLoadingType ? this.handleChange("shipmentLoadingType", shipmentLoadingType.code) : null }} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.incoterms} label="Incoterm" labelField="name"
                        valueField="code" value={this.props.product.incoterm} required={true}
                        onchange={(incoterm) => { incoterm ? this.handleChange("incoterm", incoterm.code) : null }} />
                </GridCell>
                <GridCell width="1-1">
                    {this.renderReadyDate()}
                </GridCell>
                <GridCell width="1-1">
                    {this.renderLoadingInfo()}
                </GridCell>
                <GridCell width="1-1">
                    {this.renderDeliveryInfo()}
                </GridCell>
                <GridCell width="1-2">
                    <NumberInput label="Vehicle Count" maxLength={"2"} style={{ textAlign: "right" }}
                        value={this.props.product.vehicleCount} required={true}
                        disabled={'LTL' === this.props.product.shipmentLoadingType}
                        onchange={(value) => this.handleChange("vehicleCount", value)} />
                </GridCell>
            </Grid>
        );
    }

    renderSeaProduct() {
        return (
            <Grid widthLarge={true}>
                <GridCell width="1-2">
                    <DropDown options={this.state.countries} label="From Country" valueField="iso"
                        translate={true}
                        value={this.props.product.fromCountry} required={true} readOnly={this.props.loadingAndDelivery}
                        onchange={(country) => this.handleChange("fromCountry", country)} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.loading.countryPoints} label="From Port" labelField="name"
                        readOnly={this.props.loadingAndDelivery} required={true}
                        value={this.props.product.fromPoint}
                        onchange={(value) => { value ? this.handleChange("fromPoint", value) : null }} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.countries} label="To Country" valueField="iso"
                        translate={true}
                        value={this.props.product.toCountry} required={true} readOnly={this.props.loadingAndDelivery}
                        onchange={(country) => this.handleChange("toCountry", country)} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.delivery.countryPoints} label="To Port" labelField="name"
                        readOnly={this.props.loadingAndDelivery} required={true}
                        value={this.props.product.toPoint}
                        onchange={(value) => { value ? this.handleChange("toPoint", value) : null }} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.shipmentLoadingTypes} label="FCL/LCL"
                        readOnly={((this.props.loadingAndDelivery || {}).shipmentLoadingTypes || []).length === 1}
                        value={this.props.product.shipmentLoadingType} required={true}
                        onchange={(shipmentLoadingType) => { shipmentLoadingType ? this.handleChange("shipmentLoadingType", shipmentLoadingType.code) : null }} />
                </GridCell>
                <GridCell width="1-2" />
                <GridCell width="1-2">
                    <DropDown options={this.state.incoterms} label="Incoterm" labelField="name"
                        valueField="code" value={this.props.product.incoterm} required={true}
                        onchange={(incoterm) => { incoterm ? this.handleChange("incoterm", incoterm.code) : null }} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.incotermExplanations} label="Incoterm Explanation" labelField="name"
                        translate={true}
                        valueField="code" value={this.props.product.incotermExplanation} required={true}
                        onchange={(incotermExplanation) => { incotermExplanation ? this.handleChange("incotermExplanation", incotermExplanation.code) : null }} />
                </GridCell>
                <GridCell width="1-1">
                    {this.renderReadyDate()}
                </GridCell>
                <GridCell width="1-2">
                    <NumberInput label="Transit Time(days)" maxLength={"2"} style={{ textAlign: "right" }}
                        value={this.props.product.transitTime} required={false}
                        onchange={(value) => this.handleChange("transitTime", value)} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.allPoints} label="Transshipment Port" labelField="name"
                        value={this.props.product.transshipmentPort} required={false}
                        onchange={(value) => this.handleChange("transshipmentPort", value)} />
                </GridCell>
                <GridCell width="1-1">
                    {this.renderLoadingInfo()}
                </GridCell>
                <GridCell width="1-1">
                    {this.renderDeliveryInfo()}
                </GridCell>
            </Grid>
        );
    }

    renderAirProduct() {
        return (
            <Grid widthLarge={true}>
                <GridCell width="1-2">
                    <DropDown options={this.state.countries} label="From Country" valueField="iso"
                        translate={true}
                        value={this.props.product.fromCountry} required={true} readOnly={this.props.loadingAndDelivery}
                        onchange={(country) => this.handleChange("fromCountry", country)} />

                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.loading.countryPoints} label="From Airport" labelField="name"
                        readOnly={this.props.loadingAndDelivery} required={true}
                        value={this.props.product.fromPoint}
                        onchange={(value) => { value ? this.handleChange("fromPoint", value) : null }} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.countries} label="To Country" valueField="iso"
                        translate={true}
                        value={this.props.product.toCountry} required={true} readOnly={this.props.loadingAndDelivery}
                        onchange={(country) => this.handleChange("toCountry", country)} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.delivery.countryPoints} label="To Airport" labelField="name"
                        readOnly={this.props.loadingAndDelivery} required={true}
                        value={this.props.product.toPoint}
                        onchange={(value) => { value ? this.handleChange("toPoint", value) : null }} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.incoterms} label="Incoterm" labelField="name"
                        valueField="code" value={this.props.product.incoterm} required={true}
                        onchange={(incoterm) => { incoterm ? this.handleChange("incoterm", incoterm.code) : null }} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.incotermExplanations} label="Incoterm Explanation" labelField="name"
                        translate={true}
                        valueField="code" value={this.props.product.incotermExplanation} required={true}
                        onchange={(incotermExplanation) => { incotermExplanation ? this.handleChange("incotermExplanation", incotermExplanation.code) : null }} />
                </GridCell>
                <GridCell width="1-1">
                    {this.renderReadyDate()}
                </GridCell>
                <GridCell width="1-2">
                    <NumberInput label="Transit Time(days)" maxLength={"2"} style={{ textAlign: "right" }}
                        value={this.props.product.transitTime} required={false}
                        onchange={(value) => this.handleChange("transitTime", value)} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.allPoints} label="Transshipment Airport" labelField="name"
                        value={this.props.product.transshipmentPort} required={false}
                        onchange={(value) => this.handleChange("transshipmentPort", value)} />
                </GridCell>
                <GridCell width="1-1">
                    {this.renderLoadingInfo()}
                </GridCell>
                <GridCell width="1-1">
                    {this.renderDeliveryInfo()}
                </GridCell>
            </Grid>
        );
    }

    renderDomesticProduct() {
        return (
            <Grid widthLarge={true}>
                <GridCell width="1-2">
                    <Span label="From Country" value={(this.props.product.fromCountry || {}).name} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.loading.countryPoints} label="From Postal" labelField="name"
                        readOnly={this.props.loadingAndDelivery} required={true}
                        value={this.props.product.fromPoint}
                        onchange={(value) => { value ? this.handleChange("fromPoint", value) : null }} />
                </GridCell>
                <GridCell width="1-2">
                    <Span label="To Country" value={(this.props.product.toCountry || {}).name} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.delivery.countryPoints} label="To Postal" labelField="name"
                        readOnly={this.props.loadingAndDelivery} required={true}
                        value={this.props.product.toPoint}
                        onchange={(value) => { value ? this.handleChange("toPoint", value) : null }} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.shipmentLoadingTypes} label="Transportation Type"
                        value={this.props.product.shipmentLoadingType} required={true}
                        onchange={(shipmentLoadingType) => { shipmentLoadingType ? this.handleChange("shipmentLoadingType", shipmentLoadingType.code) : null }} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options={this.state.calculationTypes} label="Calculation Type"
                        value={this.props.product.calculationType} required={true}
                        onchange={(value) => { value ? this.handleChange("calculationType", value) : null }} />
                </GridCell>
                <GridCell width="1-1">
                    {this.renderReadyDate()}
                </GridCell>
                <GridCell width="1-1">
                    {this.renderLoadingInfo()}
                </GridCell>
                <GridCell width="1-1">
                    {this.renderDeliveryInfo()}
                </GridCell>
            </Grid>
        );
    }

    render() {
        return (
            <div>
                <LoadingIndicator busy={this.state.busy} />
                <Form ref={c => this.form = c}>
                    {this.getContent()}
                </Form>
            </div>
        );
    }
}

SpotProduct.contextTypes = {
    getOption: PropTypes.func
}