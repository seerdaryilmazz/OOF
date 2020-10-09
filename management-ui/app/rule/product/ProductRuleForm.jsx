import _ from "lodash";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Span} from "susam-components/basic";
import {Chip, YesNoDropDown} from 'susam-components/advanced';

import {RuleService} from '../../services';

import {ProductSchedules} from './ProductSchedule';
import {ProductException} from './ProductException';


export class ProductRuleForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {ruleSet: {}};
    }

    componentDidMount(){
        this.initialize(this.props);
    }
    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    componentDidUpdate(){

    }
    componentWillUnmount(){

    }

    initialize(props){
        this.setState({ruleSet: props.data});
    }

    updateOriginRegion(value) {
        let ruleSet = _.cloneDeep(this.state.ruleSet);
        ruleSet.originRegion = value;
        ruleSet.collectionRegion = null;
        this.setState({ruleSet: ruleSet});
    }

    updateDestinationRegion(value) {
        let ruleSet = _.cloneDeep(this.state.ruleSet);
        ruleSet.destinationRegion = value;
        ruleSet.distributionRegion = null;
        this.setState({ruleSet: ruleSet});
    }

    updateState(key, value){
        let ruleSet = _.cloneDeep(this.state.ruleSet);
        _.set(ruleSet, key, value);
        this.setState({ruleSet: ruleSet});
    }

    handleSaveRuleSet(){
        if(!this.form.validate()){
            return;
        }
        let ruleSet = _.cloneDeep(this.state.ruleSet);
        ruleSet.schedules = ruleSet.schedules.map(item => {
            return {
                readyDate: {
                    dayOfWeek: item.readyDate.day.dayIndex,
                    weekOffset: item.readyDate.day.weekOffset,
                    hour: item.readyDate.time
                },
                deliveryDate: {
                    dayOfWeek: item.deliveryDate.day.dayIndex,
                    weekOffset: item.deliveryDate.day.weekOffset,
                    hour: item.deliveryDate.time
                }
            };
        });
        console.log("handleSaveRuleSet", ruleSet);
        RuleService.saveDeliveryDateRule(ruleSet).then(response => {
            Notify.showSuccess("Product rule saved");
            this.props.onsave && this.props.onsave(response.data);
        }).catch(error => {
            Notify.showError(error);
        });

    }


    render(){
        if(!this.state.ruleSet || !this.props.lookups){
            return null;
        }

        let collectionRegions = [];
        let distributionRegions = [];

        if (this.state.ruleSet.originRegion) {
            let operationRegion = _.find(this.props.lookups.operationRegions, elem => {
                return elem.id == this.state.ruleSet.originRegion.id;
            });
            collectionRegions = operationRegion.collectionRegions;
        }

        if (this.state.ruleSet.destinationRegion) {
            let operationRegion = _.find(this.props.lookups.operationRegions, elem => {
                return elem.id == this.state.ruleSet.destinationRegion.id;
            });
            distributionRegions = operationRegion.distributionRegions;
        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c} >
                        <Grid>
                            <GridCell width="1-1">
                                <Grid>
                                    <GridCell width="1-2">
                                        <DropDown label="Origin Operation Region"
                                                  options = {this.props.lookups.operationRegions}
                                                  value = {this.state.ruleSet.originRegion}
                                                  onchange = {(value) => this.updateOriginRegion(value)}
                                                  required = {true} />
                                    </GridCell>
                                    <GridCell width="1-2">
                                        <DropDown label="From Collection Region"
                                                  options = {collectionRegions}
                                                  value = {this.state.ruleSet.collectionRegion}
                                                  onchange = {(value) => this.updateState("collectionRegion", value)}
                                                  required = {true} />
                                    </GridCell>
                                    <GridCell width="1-2">
                                        <DropDown label="To Operation Region"
                                                  options = {this.props.lookups.operationRegions}
                                                  value = {this.state.ruleSet.destinationRegion}
                                                  onchange = {(value) => this.updateDestinationRegion(value)}
                                                  required = {true} />
                                    </GridCell>
                                    <GridCell width="1-2">
                                        <DropDown label="To Distribution Region"
                                                  options = {distributionRegions}
                                                  value = {this.state.ruleSet.distributionRegion}
                                                  onchange = {(value) => this.updateState("distributionRegion", value)}
                                                  required = {true} />
                                    </GridCell>
                                    <GridCell width="1-2">
                                        <DropDown label="Load Type" options = {this.props.lookups.truckLoadTypes}
                                              value = {this.state.ruleSet.loadType} valueField = "code"
                                              onchange = {(value) => this.updateState("loadType", value)}
                                              required = {true}/>
                                    </GridCell>
                                    <GridCell width="1-2">
                                        <DropDown label="Service Type" options = {this.props.lookups.serviceTypes}
                                              value = {this.state.ruleSet.serviceType} valueField = "code"
                                              onchange = {(value) => this.updateState("serviceType", value)}
                                              required = {true}/>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    <ProductSchedules lookups = {this.props.lookups}
                                      rules = {this.state.ruleSet.schedules}
                                      onchange = {(value) => this.updateState("schedules", value)}/>
                </GridCell>
                <GridCell width="1-1">
                    <ProductException lookups = {this.props.lookups}
                                      rules = {this.state.ruleSet.additionalDays}
                                      onchange = {(value) => this.updateState("additionalDays", value)}/>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Save" waves = {true} style="primary"
                                onclick = {() => {this.handleSaveRuleSet()}} />
                    </div>
                </GridCell>
            </Grid>
        );
    }
}

