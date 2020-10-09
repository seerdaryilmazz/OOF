import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from 'susam-components/advanced';
import { Span } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { AxiosUtils } from "susam-components/utils/AxiosUtils";
import { OrderService } from "../../services";
import { DefaultInactiveElement } from "./OrderSteps";

export class VehicleRequirements extends TranslatingComponent{
    state = {};

    updateState(key, value){
        let details = _.cloneDeep(this.props.value);
        details[key] = value;
        this.props.onChange && this.props.onChange(details);
    }

    componentDidMount(){
        this.validateFeatures(this.props.value);
    }

    componentWillReceiveProps(nextProps){
        if(!_.isEqual(this.props.value, nextProps.value)){
            this.validateFeatures(nextProps.value);
        }
    }

    validateFeatures(value){
        if(_.isArray(value.requiredForLoading)){
            let requiredForLoading = value.requiredForLoading
                .concat(this.props.featuresLoadingByWarehouse)
                .concat(this.props.featuresRequiredByLoad);
            let loadingFeatures = requiredForLoading.map(item => item.code);
            OrderService.validateVehicleFeatures(loadingFeatures).then(response => {
                this.updateState("loadingValidation", null);
            }).catch(error => {
                this.updateState("loadingValidation", AxiosUtils.getErrorMessage(error));
            });
        }
        if(_.isArray(value.requiredForUnloading)){
            let requiredForUnloading = value.requiredForUnloading
                .concat(this.props.featuresUnloadingByWarehouse)
                .concat(this.props.featuresRequiredByLoad);
            let unloadingFeatures = requiredForUnloading.map(item => item.code);
            OrderService.validateVehicleFeatures(unloadingFeatures).then(response => {
                this.updateState("unloadingValidation", null);
            }).catch(error => {
                this.updateState("unloadingValidation", AxiosUtils.getErrorMessage(error));
            });
        }
    }

    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }

    renderValidation(){
        let validationResult = [];
        if(this.props.value.loadingValidation){
            validationResult.push(
                <li key = "loadingValidation" width = "1-1">
                    {super.translate(this.props.value.loadingValidation.message)}
                </li>
            )
        }
        if(this.props.value.unloadingValidation){
            validationResult.push(
                <li key = "unloadingValidation" width = "1-1">
                    {super.translate(this.props.value.unloadingValidation.message)}
                </li>
            )
        }

        return <GridCell width = "1-1" noMargin = {true}><ul className="uk-text-danger">{validationResult}</ul></GridCell>;
    }

    renderInactive(){
        if(this.props.value.requiredForUnloading.length === 0 && this.props.value.requiredForLoading.length === 0){
            return <DefaultInactiveElement value="No selection" />;
        }
        let requiredForLoading = null;
        if(this.props.value.requiredForLoading.length > 0){
            requiredForLoading =
                <GridCell width = "1-2">
                    <Span label="Required For Loading" value = {this.props.value.requiredForLoading.map(item => super.translate(item.name)).join(", ")}/>
                </GridCell>;
        }
        let requiredForUnloading = null;
        if(this.props.value.requiredForUnloading.length > 0){
            requiredForUnloading =
                <GridCell width = "1-2">
                    <Span label="Required For Unloading" value = {this.props.value.requiredForUnloading.map(item => super.translate(item.name)).join(", ")}/>
                </GridCell>;
        }
        return (
            <Grid>
                {requiredForLoading}
                {requiredForUnloading}
            </Grid>
        );
    }
    renderActive(){
        let value = this.props.value;
        let loadingRequirements =
            _.uniqWith(value.requiredByWarehouseForLoading.concat(value.requiredByLoad),
                (item1, item2) => item1.code === item2.code).map(item => item.name);
        let unloadingRequirements =
            _.uniqWith(value.requiredByWarehouseForUnloading.concat(value.requiredByLoad),
                (item1, item2) => item1.code === item2.code).map(item => item.name);


        return(
            <Grid>
                {this.renderValidation()}
                <GridCell width = "1-2">
                    <Grid>
                        <GridCell width = "1-1">
                            <div className = "label">{super.translate("Required For Loading")}</div>
                            <div>{loadingRequirements.join(",")}</div>
                            <Chip options = {this.props.featuresLoading} id = "requiredForLoading"
                                  value = {value.requiredForLoading} hideSelectAll = {true} translate = {true}
                                  onchange = {(value) => this.updateState("requiredForLoading", value)} />
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width = "1-2">
                    <Grid>
                        <GridCell width = "1-1">
                            <div className = "label">{super.translate("Required For Unloading")}</div>
                            <div>{unloadingRequirements.join(",")}</div>
                            <Chip options = {this.props.featuresUnloading} id = "requiredForUnloading"
                                  value = {value.requiredForUnloading} hideSelectAll = {true} translate = {true}
                                  onchange = {(value) => this.updateState("requiredForUnloading", value)} />
                        </GridCell>
                    </Grid>
                </GridCell>
            </Grid>
        );

    }
}

VehicleRequirements.contextTypes = {
    translator: PropTypes.object
};