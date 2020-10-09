import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";

import {ProductRuleForm} from './ProductRuleForm';
import {ProductRuleList} from './ProductRuleList';
import {CommonService, ZoneService, RuleService} from "../../services";

export class ProductRules extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            lookups: {}, selectedItem: {}
        };
    }

    componentDidMount(){
        axios.all([
            CommonService.getTruckLoadTypes(),
            CommonService.retrievePackageGroups(),
            CommonService.getServiceTypes(),
            CommonService.getADRClasses(),
            CommonService.getPriorities(),
            CommonService.getDaysOfWeek(),
            CommonService.retrieveOrderPlanningOperationType(),
            CommonService.retrieveRegionCategory(),
            CommonService.retrieveLoadSpecs(),
            ZoneService.getOperationRegionListAccordingToQueryThree()
        ]).then(axios.spread((truckLoadTypes, packageGroups, serviceTypes,
                              adrClasses, priorities, days, orderPlanningOperationType, regionCategory, loadSpecs, operationRegions) => {
            let state = _.cloneDeep(this.state);
            state.lookups = {};
            state.lookups.truckLoadTypes = truckLoadTypes.data;
            state.lookups.packageGroups = packageGroups.data;
            state.lookups.adrClasses = adrClasses.data;
            state.lookups.priorities = priorities.data;
            state.lookups.serviceTypes = serviceTypes.data;
            state.lookups.days = days.data;
            state.lookups.days.forEach((item, index) => item.index = index);
            state.lookups.orderPlanningOperationTypes = orderPlanningOperationType.data;
            state.lookups.regionCategories = regionCategory.data;
            state.lookups.loadSpecs = loadSpecs.data;
            state.lookups.operationRegions = operationRegions.data;
            this.setState(state, () => this.refreshList());

        })).catch((error) => {
            console.log(error);
            Notify.showError(error);
        });
    }

    convertRuleSchedules(schedules){
        return schedules.map(item => {
            let readyDateDay = this.state.lookups.days[item.readyDate.dayOfWeek];
            let deliveryDateDay = this.state.lookups.days[item.deliveryDate.dayOfWeek];
            return {
                readyDate: {
                    day: {
                        id: readyDateDay.id,
                        name: readyDateDay.name,
                        dayIndex: item.readyDate.dayOfWeek,
                        weekOffset: item.readyDate.weekOffset
                    },
                    dayIndex: item.readyDate.dayOfWeek,
                    weekOffset: item.readyDate.weekOffset,
                    time: item.readyDate.hour
                },
                deliveryDate: {
                    day: {
                        id: deliveryDateDay.id,
                        name: deliveryDateDay.name,
                        dayIndex: item.deliveryDate.dayOfWeek,
                        weekOffset: item.deliveryDate.weekOffset
                    },
                    dayIndex: item.deliveryDate.dayOfWeek,
                    weekOffset: item.deliveryDate.weekOffset,
                    time: item.deliveryDate.hour
                }
            };
        });
    }

    refreshList(){
        RuleService.getDeliveryDateRules().then(response => {
            let rules = response.data;
            rules.forEach(rule => {
                rule.schedules = this.convertRuleSchedules(rule.schedules);
            });
            this.setState({rules: rules});
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    handleSelectFromList(item){
        this.setState({selectedItem: item});
    }

    handleCreateNewClick(){
        let ruleSet = {};
        this.setState({selectedItem: ruleSet});
    }

    handleSave(value){
        value.schedules = this.convertRuleSchedules(value.schedules);
        this.setState({selectedItem: value});
        this.refreshList();

    }
    handleDelete(value){
        UIkit.modal.confirm("Are you sure?", () => {
            RuleService.deleteDeliveryDateRule(value.id).then(response => {
                Notify.showSuccess("Product rule deleted");
                this.refreshList();
                this.handleCreateNewClick();
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    render(){
        return(
            <div>
                <PageHeader title="Product Rules" />
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-4" noMargin = {true}>
                            <Grid>
                                <GridCell width="1-1">
                                    <div className="uk-align-right">
                                        <Button label="Create New" style="success" waves = {true}
                                                flat = {true} onclick = {() => this.handleCreateNewClick()} />
                                    </div>
                                </GridCell>
                                <GridCell width="1-1" noMargin = {true}>
                                    <ProductRuleList data = {this.state.rules}
                                                     onselect = {(value) => this.handleSelectFromList(value)}
                                                     ondelete = {(value) => this.handleDelete(value)}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="3-4" noMargin = {true}>
                            <ProductRuleForm data = {this.state.selectedItem}
                                                    lookups = {this.state.lookups}
                                                    onsave = {(data) => this.handleSave(data)}
                                                    ondelete = {(data) => this.handleDelete(data)} />
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}