import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import {GridCell, PageHeader} from "susam-components/layout";
import {Notify} from "susam-components/basic";
import {QuoteCommonInfo, Customs, PackageList, ServiceList, LoadList, PriceList, PaymentRule, VehicleRequirements, ContainerRequirements} from "../../quote";
import {SpotProductList} from "../product/spot/SpotProductList";
import {CrmQuoteService, LookupService} from '../../services';
import * as Constants from "../../common/Constants";
import _ from "lodash";
import {ObjectUtils, PackageUtils, QuoteUtils} from "../../utils";
import { QuoteStatusPrinter } from "../../common";

const VEHICLE_REQUIREMENT_FRIGO = {code: 'FRIGO', name: 'Frigo'};
const VEHICLE_REQUIREMENT_CURTAIN_SIDER = {code: 'CURTAIN_SIDER', name: 'Curtain Sider'};
const VEHICLE_REQUIREMENT_HANGING_LOAD = {code: 'SUITABLE_FOR_HANGING_LOADS', name: 'Suitable For Hanging Loads'};

const OPERATION_TYPE_COLLECTION = {code: 'COLLECTION', name: 'Collection'};
const OPERATION_TYPE_DISTRIBUTION = {code: 'DISTRIBUTION', name: 'Distribution'};

export class SpotQuote extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.retrieveBillingItems();
    }

    componentDidUpdate(prevProps){
        if(!_.isEqual(this.props.quote.products, prevProps.quote.products) ){
            if(!this.props.readOnly) {
                this.handleChange("containerRequirements", null)
            }
        }
        if(!_.isEqual(prevProps.quote.id, this.props.quote.id) && !this.props.readOnly){
            PackageUtils.calculatePayWeight(this.props.quote, payWeightCalculation=>{
                let quote = _.cloneDeep(this.props.quote);
                quote.payWeight = payWeightCalculation.payWeight;
                quote.payWeightCalculation = payWeightCalculation;
                this.props.onChange(quote);
            });
        }
    }

    updateState(key, value) {
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleChange(key, value) {
        this.handleChangeMultiple([{key: key, value: value}]);
    }

    /**
     * Tek seferde birden çok değeri değiştirmek için...
     */
    handleChangeMultiple(keyValuePairs, resultCallback) {

        let quote = _.cloneDeep(this.props.quote);
        ObjectUtils.applyKeyValuePairs(keyValuePairs, quote);

        let calculatePayWeight = false;
        let calculateCW = false;

        if (quote.status.code == "OPEN" && quote.serviceArea.code == "ROAD") {
            let currentPayWeightRelatedParams = this.getPayWeightRelatedParams(this.props.quote);
            let newPayWeightRelatedParams = this.getPayWeightRelatedParams(quote);
            if (!_.isEqual(currentPayWeightRelatedParams, newPayWeightRelatedParams)) {
                let currentPayWeightCalculationParams = this.getPayWeightCalculationParams(this.props.quote);
                if (_.isEmpty(quote.packages)) {
                    if (newPayWeightRelatedParams.isFtl) {
                        if (newPayWeightRelatedParams.isSpeedyService) {
                            quote.measurement.ldm = Constants.FTL_TOTAL_LDM_SPEEDY;
                        } else if(newPayWeightRelatedParams.isSpeedyVanService){
                            quote.measurement.ldm = Constants.FTL_TOTAL_LDM_SPEEDY_VAN;
                        } else {
                            quote.measurement.ldm = Constants.FTL_TOTAL_LDM;
                        }
                    }
                }
                let newPayWeightCalculationParams = this.getPayWeightCalculationParams(quote);
                if (!_.isEqual(currentPayWeightCalculationParams, newPayWeightCalculationParams)) {
                    calculatePayWeight = true;
                }
            }
        }

        if (quote.status.code == "OPEN" && quote.serviceArea.code == "AIR" && (quote.measurement.weight !=0 || quote.measurement.volume !=0)) {
            calculateCW =true;
        }
        if (calculateCW) {
            let callback = (chargeableWeight) => {
                quote.prices && quote.prices.forEach(price=>{
                    price.priceCalculation=null;
                });
                quote.chargeableWeight = chargeableWeight;
                this.props.onChange(quote);
                resultCallback && resultCallback({chargeableWeight});
            };
            PackageUtils.calculateChargeableWeight(quote, callback);
        }

        if (calculatePayWeight) {
            let callback = (payWeightCalculation) => {
                quote.prices && quote.prices.forEach(price=>{
                    price.priceCalculation=null;
                });
                quote.payWeightCalculation = payWeightCalculation;
                quote.payWeight = payWeightCalculation.payWeight;
                this.props.onChange(quote);
                resultCallback && resultCallback({payWeight: payWeightCalculation.payWeight});
            };
            PackageUtils.calculatePayWeight(quote, callback);
        } else {
            this.props.onChange(quote);
        }
    }

    /**
     * Pay weight hesabını etkileyen tüm parametreler...
     */
    getPayWeightRelatedParams(quote) {
        let mainService = QuoteUtils.getMainService(quote);
        let product = !_.isEmpty(quote.products) ? quote.products[0] : null;
        return {
            weight: _.get(quote, "measurement.weight", null),
            ldm: _.get(quote, "measurement.ldm", null),
            volume: _.get(quote, "measurement.volume", null),
            isSpeedyService: mainService ? mainService.type.code == "SPEEDY" : null,
            isSpeedyVanService: mainService ? mainService.type.code =="SPEEDY_VAN" : null,
            isFtl: product ? product.shipmentLoadingType == "FTL" : null
        };
    }

    /**
     * Direkt olarak pay weight hesabında kullanılan parametreler...
     */
    getPayWeightCalculationParams(quote) {
        let mainService = QuoteUtils.getMainService(quote);
        return {
            weight: _.get(quote, "measurement.weight", null),
            ldm: _.get(quote, "measurement.ldm", null),
            volume: _.get(quote, "measurement.volume", null),
            isSpeedyService: mainService ? mainService.type.code == "SPEEDY" : false,
            isSpeedyVanService: mainService ? mainService.type.code =="SPEEDY_VAN" : false
        };
    }
    
    handleVehicleRequirementsChange(value) {
        let keyValuePairs = [{key: "vehicleRequirements", value: value}];
        this.adjustPriceItems(keyValuePairs);
    }

    handleProductsChange(keyValuePairs) {
        this.adjustPriceItems(keyValuePairs);
    }

    handleServicesChange(value) {
        let keyValuePairs = [{key: "services", value: value}];
        this.adjustPriceItems(keyValuePairs);
    }

    handleCustomsChange(value) {
        let keyValuePairs = [{key: "customs", value: value}];
        this.adjustPriceItems(keyValuePairs);
    }

    retrieveBillingItems(){
        LookupService.getBillingItems(this.props.quote.serviceArea.code).then(response => {
            this.setState({billingItems: response.data}, ()=>this.adjustInitialValues());
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    adjustInitialValues(){
        if(this.state.billingItems){
            if(!this.props.quote.id && _.isEmpty(this.props.quote.prices)){
                let billingItem = _.find(this.state.billingItems, {name: this.props.quote.serviceArea.code + '_FREIGHT'});
                let services = [{type: {id: 'STANDARD', code: 'STANDARD', name: 'Standard', category: 'MAIN'}}];
                let prices = [{type:{code: 'INCOME'}, billingItem: billingItem, _key: billingItem.name + '_INCOME' , charge: {amount: 0, currency: {id: 'EUR', code: 'EUR', name: 'EUR'}}, priceExchanged: {amount: 0, currency: {id: 'EUR', code: 'EUR', name: 'EUR'}} }];
                if(this.props.quote.serviceArea.code === 'SEA' || this.props.quote.serviceArea.code === 'AIR'){
                    prices.push({type:{code: 'EXPENSE'}, billingItem: billingItem, _key: billingItem.name + '_EXPENSE' , charge: {amount: 0, currency: {id: 'EUR', code: 'EUR', name: 'EUR'}}, priceExchanged: {amount: 0, currency: {id: 'EUR', code: 'EUR', name: 'EUR'}}});
                }
                let keyValuePairs = [
                    {key: "services", value: services},
                    {key: "prices", value: prices},
                ];
                this.handleChangeMultiple(keyValuePairs);
            }
        }
    }

    validate() {
        if (!this.quoteCommonInfo.validate() |
            (this.packageList && !this.packageList.validate()) |
            (this.customs && !this.customs.validate()) |
            (this.vehicleRequirements && !this.vehicleRequirements.validate()) |
            !this.serviceDetailInfo.validate() |
            !this.paymentRuleInfo.validate()) {
            return false;
        }
        return true;
    }


    addVehicleRequirements(requirement, itemRequirements, allRequirements){

        let collectionRequirement = _.find(itemRequirements, vehicleRequirement => vehicleRequirement.operationType.code === OPERATION_TYPE_COLLECTION.code);
            collectionRequirement ? collectionRequirement.removable = false : allRequirements.push({requirement: requirement, operationType: OPERATION_TYPE_COLLECTION, removable: false});

        let distributionRequirement = _.find(itemRequirements, vehicleRequirement => vehicleRequirement.operationType.code === OPERATION_TYPE_DISTRIBUTION.code);
            distributionRequirement ? distributionRequirement.removable = false : allRequirements.push({requirement: requirement, operationType: OPERATION_TYPE_DISTRIBUTION, removable: false});
    }

    removeVehicleRequirements(itemRequirements, allRequirements){
        itemRequirements.forEach(vehicleRequirement => {
            if(vehicleRequirement.removable === false){
                allRequirements.splice(allRequirements.indexOf(vehicleRequirement), 1);
            }
        });
    }

    handlePackagesChange(keyValuePairs){

        let quote = _.cloneDeep(this.props.quote);
        ObjectUtils.applyKeyValuePairs(keyValuePairs, quote);
        
        if(this.vehicleRequirements){
            let vehicleRequirements = quote.vehicleRequirements ? quote.vehicleRequirements : [];

            let hangingLoadRequirements = _.filter(vehicleRequirements, (vehicleRequirement) => vehicleRequirement.requirement.code === VEHICLE_REQUIREMENT_HANGING_LOAD.code);
            if(_.find(quote.packages, quotePackage => quotePackage.type === 'Stange')){
                this.addVehicleRequirements(VEHICLE_REQUIREMENT_HANGING_LOAD, hangingLoadRequirements, vehicleRequirements);
            }else{
                this.removeVehicleRequirements(hangingLoadRequirements, vehicleRequirements);
            }
            keyValuePairs.push({key: "vehicleRequirements", value: vehicleRequirements});
        }
        this.handleChangeMultiple(keyValuePairs, result=>_.has(result, 'payWeight') && this.adjustPriceItems([result]));
    }

    handleLoadsChange(loads){
        let keyValuePairs = [];
        if(this.vehicleRequirements){
            let vehicleRequirements = this.props.quote.vehicleRequirements ? _.cloneDeep(this.props.quote.vehicleRequirements) : [];

            //FRIGO
            let frigoRequirements = _.filter(vehicleRequirements, (vehicleRequirement) => vehicleRequirement.requirement.code === VEHICLE_REQUIREMENT_FRIGO.code);
            if(_.find(loads, (load) => load.type.code === 'FRIGO')){
                this.addVehicleRequirements(VEHICLE_REQUIREMENT_FRIGO, frigoRequirements, vehicleRequirements);
            }else{
                this.removeVehicleRequirements(frigoRequirements, vehicleRequirements);
            }

            // LONG
            let curtainSiderRequirements = _.filter(vehicleRequirements, (vehicleRequirement) => vehicleRequirement.requirement.code === VEHICLE_REQUIREMENT_CURTAIN_SIDER.code);
            if(_.find(loads, (load) => load.type.code === 'LONG')){
                this.addVehicleRequirements(VEHICLE_REQUIREMENT_CURTAIN_SIDER, curtainSiderRequirements, vehicleRequirements);
            }else{
                this.removeVehicleRequirements(curtainSiderRequirements, vehicleRequirements);
            }
            keyValuePairs.push({key: "vehicleRequirements", value: vehicleRequirements});
        }
        keyValuePairs.push({key: "loads", value: loads});
        this.adjustPriceItems(keyValuePairs);
    }

    adjustPriceItems(keyValuePairs){
        
        if (this.props.readOnly) {
            return;
        }
        
        let quote = _.cloneDeep(this.props.quote);
        ObjectUtils.applyKeyValuePairs(keyValuePairs, quote);

        CrmQuoteService.determineBillingItems(quote).then(response => {
            
            //ADD PRICE OBJECT
            response.data.forEach(billingItem => {
                let price = _.find(quote.prices, price => price.billingItem.name === billingItem.name);
                if(!price){
                    quote.prices.push({type:{code: 'INCOME'}, billingItem: billingItem, _key: billingItem.name + '_INCOME' , charge: {amount: 0, currency: {id: 'EUR', code: 'EUR', name: 'EUR'}}, priceExchanged: {amount: 0, currency: {id: 'EUR', code: 'EUR', name: 'EUR'}} });
                    if(this.props.quote.serviceArea.code === 'SEA' || this.props.quote.serviceArea.code === 'AIR'){
                        quote.prices.push({type:{code: 'EXPENSE'}, billingItem: billingItem, _key: billingItem.name + '_EXPENSE' , charge: {amount: 0, currency: {id: 'EUR', code: 'EUR', name: 'EUR'}}, priceExchanged: {amount: 0, currency: {id: 'EUR', code: 'EUR', name: 'EUR'}} });
                    }
                }
            });

            let freightName = this.props.quote.serviceArea.code + '_FREIGHT';

            //REMOVE PRICE OBJECT
            _.remove(quote.prices, price => price.billingItem.name !== freightName &&
                !_.find(response.data, billingItem => billingItem.code === price.billingItem.code));

            quote.prices = _.sortBy(quote.prices, (price) => {
                return price.billingItem.code;
            });

            // keyValuePairs içinde zaten prices varsa önce siliyoruz çünkü tekrar ekliyoruz.
            _.remove(keyValuePairs, (item) => {
                return item.key == "prices";
            });
            
            keyValuePairs.push({key: "prices", value: quote.prices});
            
            this.handleChangeMultiple(keyValuePairs);
            
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    renderCustoms(){
        if(this.props.quote.serviceArea.code === 'ROAD'){
            return(
                <Customs ref = {c => this.customs = c}
                         product = {(this.props.quote.products &&this.props.quote.products[0]) || {}}
                         customs = {this.props.quote.customs || undefined}
                         onChange={(value) => this.handleCustomsChange(value)}
                         readOnly={this.props.readOnly}/>
            );
        }
    }

    renderVehicleRequirements(){
        if(this.props.quote.serviceArea.code === 'ROAD'){
            return(
                <VehicleRequirements ref = {c => this.vehicleRequirements = c}
                                     vehicleRequirements= {this.props.quote.vehicleRequirements || undefined}
                                     onChange={(vehicleRequirements) => this.handleVehicleRequirementsChange(vehicleRequirements)}
                                     readOnly={this.props.readOnly}/>
            );
        }
    }

    renderContainerRequirements(){
        if(this.props.quote.serviceArea.code === 'SEA' &&
            (!_.isEmpty(this.props.quote.products) && (this.props.quote.products[0].shipmentLoadingType || {}) === 'FCL')){
            return(
                <ContainerRequirements ref = {c => this.containerRequirements = c}
                                       containerRequirements= {this.props.quote.containerRequirements || undefined}
                                       onChange={(containerRequirements) => this.handleChange("containerRequirements", containerRequirements)}
                                       readOnly={this.props.readOnly}/>
            );
        }
    }

    renderLoads(){
        if(this.props.quote.serviceArea.code !== 'DTR'){
            return(
                <LoadList loads = {this.props.quote.loads || undefined}
                          serviceArea = {this.props.quote.serviceArea}
                          onEdit={(loads) => this.handleChange("loads", loads)}
                          onAddOrRemove={(loads) => this.handleLoadsChange(loads)}
                          readOnly={this.props.readOnly}/>
            );
        }
    }

    renderPackages(){
        if(this.props.quote.serviceArea.code !== 'DTR'){
            return(
                <PackageList ref = {c => this.packageList = c}
                             quote = {this.props.quote}
                             onChange={(keyValuePairs) => this.handlePackagesChange(keyValuePairs)}
                             readOnly={this.props.readOnly}/>
            );
        }
    }
    
    renderPageHeader(){
        let quoteNumberSuffix = !_.isNil(this.props.quote.number) ? " - " + this.props.quote.number : "";
        return (
                    <GridCell noMargin={true} style={{paddingLeft:"10px",paddingTop:"10px",position:"fixed",zIndex:2,marginTop: "-54px", marginRight:"50px", background:"#eeeeee"}}>
                        <PageHeader title={super.translate("Spot Quote") + quoteNumberSuffix}/>
                    </GridCell>
        );
    }

    render(){
        return(
            <div>
                {this.renderPageHeader()}

                <QuoteCommonInfo ref = {c => this.quoteCommonInfo = c}
                                 account = {this.props.account}
                                 quote = {this.props.quote}
                                 onChange={(keyValuePairs) => this.handleChangeMultiple(keyValuePairs)}
                                 readOnly={this.props.readOnly}/>
                <SpotProductList quote = {this.props.quote}
                                 onChange={(keyValuePairs) => this.handleProductsChange(keyValuePairs)}
                                 readOnly={this.props.readOnly}/>
                {this.renderCustoms()}
                {this.renderPackages()}
                {this.renderLoads()}
                {this.renderVehicleRequirements()}
                {this.renderContainerRequirements()}
                <ServiceList ref = {c => this.serviceDetailInfo = c}
                             quote={this.props.quote}
                             services = {this.props.quote.services || undefined}
                             serviceArea = {this.props.quote.serviceArea}
                             onAddOrRemove={(value) => this.handleServicesChange(value)}
                             readOnly={this.props.readOnly}/>
                <PriceList quote = {this.props.quote}
                           onChange={(value) => this.handleChange("prices", value)}
                           readOnly={this.props.readOnly}/>
                <PaymentRule ref = {c => this.paymentRuleInfo = c}
                             quote = {this.props.quote}
                             paymentRule = {this.props.quote.paymentRule || undefined}
                             onChange={(paymentRule) => this.handleChange("paymentRule", paymentRule)}
                             readOnly={this.props.readOnly}/>
            </div>
        );
    }
}
