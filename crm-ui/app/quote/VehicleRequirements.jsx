import React from "react";
import * as axios from "axios";
import PropTypes from "prop-types";

import {TranslatingComponent} from 'susam-components/abstract';
import {Notify, Form} from 'susam-components/basic';
import {Card, CardHeader, Grid, GridCell} from 'susam-components/layout';
import {LookupService, OrderService} from '../services';
import {Chip} from "susam-components/advanced";
import {withReadOnly} from "../utils";
import {AxiosUtils} from "susam-components/utils/AxiosUtils";

export class VehicleRequirements extends TranslatingComponent {

    static defaultProps = {
        vehicleRequirements: []
    }

    constructor(props) {
        super(props);
        this.state={
            vehicleRequirements:{
                loading:{},
                unloading:{}
            }
        }
    }

    componentDidMount() {
        this.initializeLookups();
    }

    initializeLookups(){
        axios.all([
            LookupService.getVehicleFeatures()
        ]).then(axios.spread((vehicleFeatures) => {
            this.setState({vehicleFeatures:  vehicleFeatures.data}, () => this.seperateVehicleRequirements(this.props.vehicleRequirements));
        })).catch(error => {
            Notify.showError(error);
        })
    }

    componentWillReceiveProps(nextProps){
        if(!_.isEqual(this.props.vehicleRequirements, nextProps.vehicleRequirements)){
            this.seperateVehicleRequirements(nextProps.vehicleRequirements);
        }
    }

    seperateVehicleRequirements(currentVehicleRequirements){
        if(currentVehicleRequirements){
            let state = _.cloneDeep(this.state);
            state.vehicleRequirements.loading.removable =  _.filter(currentVehicleRequirements, (vehicleRequirement) => {
                    return vehicleRequirement.operationType.code === 'COLLECTION' && vehicleRequirement.removable === true
            }).map(item => item.requirement);
            state.vehicleRequirements.loading.unremovable=  _.filter(currentVehicleRequirements, (vehicleRequirement) => {
                return vehicleRequirement.operationType.code === 'COLLECTION' && vehicleRequirement.removable === false
            }).map(item => item.requirement);
            state.vehicleRequirements.unloading.removable =  _.filter(currentVehicleRequirements, (vehicleRequirement) => {
                return vehicleRequirement.operationType.code === 'DISTRIBUTION' && vehicleRequirement.removable === true
            }).map(item => item.requirement);
            state.vehicleRequirements.unloading.unremovable =  _.filter(currentVehicleRequirements, (vehicleRequirement) => {
                return vehicleRequirement.operationType.code === 'DISTRIBUTION' && vehicleRequirement.removable === false
            }).map(item => item.requirement);
            this.setState(state, ()=>this.validateFeatures());
        }
    }


    handleChange(key, value){
        let vehicleRequirements = _.cloneDeep(this.state.vehicleRequirements);
        _.set(vehicleRequirements, key, value);
        this.setState({vehicleRequirements: vehicleRequirements}, ()=> this.aggregateVehicleRequirements());
    }

    aggregateVehicleRequirements(){

        this.validateFeatures();

        let vehicleRequirements = [];

        if(this.state.vehicleRequirements.loading.removable){
            this.state.vehicleRequirements.loading.removable.forEach(currentRequirement => {
                let vehicleRequirement;
                if(this.props.vehicleRequirements){
                    vehicleRequirement = _.find(this.props.vehicleRequirements, vehicleRequirement => {
                        return vehicleRequirement.requirement.code === currentRequirement.code && vehicleRequirement.operationType.code === 'COLLECTION'
                    });
                }
                if(!_.find(this.state.vehicleRequirements.loading.unremovable, {code: currentRequirement.code})){
                    vehicleRequirements.push(vehicleRequirement ? vehicleRequirement :
                        {requirement : currentRequirement, operationType: {code: 'COLLECTION', name: 'Collection'}, removable: true});
                }
            });
        }

        if(this.state.vehicleRequirements.unloading.removable){
            this.state.vehicleRequirements.unloading.removable.forEach(currentRequirement => {
                let vehicleRequirement;
                if(this.props.vehicleRequirements){
                    vehicleRequirement = _.find(this.props.vehicleRequirements, vehicleRequirement => {
                        return vehicleRequirement.requirement.code === currentRequirement.code && vehicleRequirement.operationType.code === 'DISTRIBUTION'
                    });
                }
                if(!_.find(this.state.vehicleRequirements.unloading.unremovable, {code: currentRequirement.code})){
                    vehicleRequirements.push(vehicleRequirement ? vehicleRequirement :
                        {requirement : currentRequirement, operationType: {code: 'DISTRIBUTION', name: 'Distribution'}, removable: true});
                }
            });
        }

        if(this.props.vehicleRequirements){
            vehicleRequirements.push(..._.filter(this.props.vehicleRequirements, (vehicleRequirement) => {
                return vehicleRequirement.removable === false
            }));
        }
        this.props.onChange(vehicleRequirements);
    }

    validateFeatures(){
        let requiredForLoading = [].concat(this.state.vehicleRequirements.loading.removable)
            .concat(this.state.vehicleRequirements.loading.unremovable);
        if(!_.isEmpty(requiredForLoading)){
            let loadingFeatures = requiredForLoading.map(item => item.code);
            OrderService.validateVehicleFeatures(loadingFeatures).then(response => {
                this.setState({loadingValidation: null});
            }).catch(error => {
                this.setState({loadingValidation: AxiosUtils.getErrorMessage(error)});
            });
        }

        let requiredForUnloading = [].concat(this.state.vehicleRequirements.unloading.removable)
            .concat(this.state.vehicleRequirements.unloading.unremovable);

        if(!_.isEmpty(requiredForUnloading)){
            let loadingFeatures = requiredForUnloading.map(item => item.code);
            OrderService.validateVehicleFeatures(loadingFeatures).then(response => {
                this.setState({unloadingValidation: null});
            }).catch(error => {
                this.setState({unloadingValidation: AxiosUtils.getErrorMessage(error)});
            });
        }
    }

    renderLoadingValidation(){
        return (
            <GridCell width = "1-1" noMargin = {true}>
                <span className="uk-text-danger" >{this.state.loadingValidation ? this.state.loadingValidation.message : ""}</span>
            </GridCell>
        );
    }

    renderUnloadingValidation(){
        return (
            <GridCell width = "1-1" noMargin = {true}>
                <span className="uk-text-danger" >{this.state.unloadingValidation ? this.state.unloadingValidation.message : ""}</span>
            </GridCell>
        );
    }

    validate(){
        if(this.form.validate()){
            if(!this.state.loadingValidation && !this.state.unloadingValidation){
                return true;
            }
        }
        return false;
    }

    render() {

        let unremovableLoadingVehicles = this.state.vehicleRequirements.loading.unremovable ?
            this.state.vehicleRequirements.loading.unremovable.map(item => item.name).join(",") : null;

        let unremovableUnloadingVehicles = this.state.vehicleRequirements.unloading.unremovable ?
            this.state.vehicleRequirements.unloading.unremovable.map(item => item.name).join(",") : null;


        let vehicleFeatures = _.filter(this.state.vehicleFeatures, (vehicleFeature) => {
            return !_.find(this.state.vehicleRequirements.loading.unremovable, {code: vehicleFeature.code})
        });

        return (
            <Form ref = {c => this.form = c}>
                <Card>
                    <CardHeader title="Vehicle Requirements"/>
                    <Grid>
                        <GridCell width="1-3" noMargin={true}>
                            <Grid>
                                {this.renderLoadingValidation()}
                                <GridCell width = "1-1" noMargin={true}>
                                    <div className = "label">{super.translate("Required For Loading")}</div>
                                    <div>{unremovableLoadingVehicles}</div>
                                    <ReadOnlyChip options={vehicleFeatures} id="requiredForLoading" hideSelectAll = {true} translate={true}
                                                  value={this.state.vehicleRequirements.loading.removable} valueField="code" readOnly={this.props.readOnly}
                                                  onchange={(service) => {this.handleChange("loading.removable", service)}}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="2-3" noMargin={true}>
                            <Grid>
                                {this.renderUnloadingValidation()}
                                <GridCell width = "1-1" noMargin={true}>
                                    <div className = "label">{super.translate("Required For Unloading")}</div>
                                    <div>{unremovableUnloadingVehicles}</div>
                                    <ReadOnlyChip options={vehicleFeatures} id="requiredForUnloading" hideSelectAll = {true} translate={true}
                                                  value={this.state.vehicleRequirements.unloading.removable} valueField="code" readOnly={this.props.readOnly}
                                                  onchange={(service) => {this.handleChange("unloading.removable", service)}}/>
                                </GridCell>
                            </Grid>

                        </GridCell>
                    </Grid>
                </Card>
            </Form>
        );
    }
}

VehicleRequirements.contextTypes = {
    translator: PropTypes.object
};


const ReadOnlyChip = withReadOnly(Chip);

