import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import { Card, CardHeader, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from 'uuid';
import { ProjectService } from '../services/ProjectService';



export class DeliveryDateRuleList extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        if(this.props.customer){
            this.loadRulesForCustomer(this.props.customer);
        }
    }

    componentWillReceiveProps(nextProps){
        let currentCustomerId = _.get(this.props, "customer.id");
        let nextCustomerId = _.get(nextProps, "customer.id");
        if(currentCustomerId != nextCustomerId){
            this.loadRulesForCustomer(nextProps.customer);
        }
    }

    processRuleSchedules(schedules){
        return schedules.map(item => {
            let readyDateDay = this.props.lookup.days[item.readyDate.dayOfWeek];
            let deliveryDateDay = this.props.lookup.days[item.deliveryDate.dayOfWeek];
            return {
                _key: uuid.v4(),
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
    processOperation(operation){
        operation.postalCodes = operation.postalCodes.length > 0 ? operation.postalCodes.join(",") : "";
        return operation;
    }

    loadRulesForCustomer(customer){
        ProjectService.getDeliveryDateRulesForCustomer(customer.id).then(response => {
            let rules = response.data;
            rules.forEach(rule => {
                rule.schedules = this.processRuleSchedules(rule.schedules);
                rule.origin = this.processOperation(rule.origin);
                rule.destination = this.processOperation(rule.destination);
            });
            let groupedByCustomer = _.groupBy(rules, item => item.customer.name);
            Object.keys(groupedByCustomer).forEach(customerName => {
                let groupedByFromTo = _.groupBy(groupedByCustomer[customerName],
                        item => this.getPostalCodesKey(item.origin) + " : " + this.getPostalCodesKey(item.destination));

                Object.keys(groupedByFromTo).forEach(fromTo => {
                    let groupedByServiceAndLoadType = _.groupBy(groupedByFromTo[fromTo],
                            item => item.serviceType.name + " - " + item.loadType.name);

                    groupedByFromTo[fromTo] = groupedByServiceAndLoadType;
                });

                groupedByCustomer[customerName] = groupedByFromTo;

            });
            this.setState({rules: groupedByCustomer});
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }
    getPostalCodesKey(item){
        let result = item.country.code + " - " + (item.includeAllPostalCodes ? "All Postal Codes" : item.postalCodes);
        if(item.warehouseDelivery){
            result += " (WH Delivery)";
        }
        return result;
    }
    handleCreateNewRule(){
        this.props.onCreate && this.props.onCreate();
    }
    handleNewRuleForCustomerAndRoute(serviceAndLoad){
        let rule = this.state.rules[this.state.selectedCustomer][this.state.selectedRoute][serviceAndLoad][0];
        this.props.onCreate && this.props.onCreate(rule);
    }

    handleSelectCustomer(customer){
        this.props.onCustomerSelect && this.props.onCustomerSelect(customer);
    }

    handleSelectFromTo(e, customerName, route){
        e.preventDefault();
        this.setState({selectedCustomer: customerName, selectedRoute: route});
    }

    handleRuleSelect(serviceAndLoad){
        let rule = this.state.rules[this.state.selectedCustomer][this.state.selectedRoute][serviceAndLoad][0];
        this.props.onEdit && this.props.onEdit(rule);
    }
    handleRuleDelete(serviceAndLoad){
        Notify.confirm("Are you sure?", () => {
            let rule = this.state.rules[this.state.selectedCustomer][this.state.selectedRoute][serviceAndLoad][0];
            ProjectService.deleteDeliveryDateRule(rule).then(response => {
                Notify.showSuccess("Delivery date rule deleted");
                this.setState({selectedRoute: null}, () => this.loadRulesForCustomer(this.props.customer));
            }).catch(error => Notify.showError(error));
        });
    }

    handleSelectCustomer(customer){
        this.props.onCustomerSelect(customer);
    }

    renderServiceAndLoadOptions(rule){
        if(!this.state.selectedCustomer || !this.state.selectedRoute){
            return null;
        }
        return (
            <ul className = "md-list">
                {Object.keys(rule[this.state.selectedRoute]).map(serviceAndLoad => {
                    return(
                        <li key = {serviceAndLoad}>
                            <div className="md-list-content">
                                <span className="md-list-heading">{serviceAndLoad}</span>
                                <div style = {{float: "right"}}>
                                    <Button label = "Edit" size = "small" flat = {true} style = "success"
                                            onclick = {() => this.handleRuleSelect(serviceAndLoad)} />
                                    <Button label = "Delete" size = "small" flat = {true} style = "danger"
                                            onclick = {() => this.handleRuleDelete(serviceAndLoad)} />
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }
    renderRouteOptions(rule, customerName){
        return (
            <ul className = "md-list">
                {Object.keys(rule).map(route => {
                    let selected = route === this.state.selectedRoute;
                    return(
                        <li key = {route} className = {selected ? "md-bg-blue-50" : ""}>
                            <div className="md-list-content">
                                <span className="md-list-heading">
                                    <a onClick = {(e) => this.handleSelectFromTo(e, customerName, route)}>{route}</a>
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }

    renderRule(customerName, rule){
        let newRuleButton = null;
        if(this.state.selectedRoute){
            let firstServiceAndLoad = Object.keys(rule[this.state.selectedRoute])[0];
            newRuleButton = <Button label = {"new rule for " + this.state.selectedRoute} style = "success" flat = {true} size = "small"
                    onclick = {() => this.handleNewRuleForCustomerAndRoute(firstServiceAndLoad)} />
        }

        return (
            <li key = {customerName}>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width = "1-2">
                            <CardHeader title = "Origin & Destination Postal Codes" />
                            {this.renderRouteOptions(rule, customerName)}
                        </GridCell>
                        <GridCell width = "1-2">
                            <CardHeader title = "Load & Service Type" />
                            {newRuleButton}
                            {this.renderServiceAndLoadOptions(rule)}
                        </GridCell>
                    </Grid>
                </div>
            </li>
        );
    }

    renderList(){
        if(!this.state.rules){
            return null;
        }
        if(this.state.rules.length === 0){
            return <div>{super.translate("There are no rules for this customer")}</div>;
        }

        return (
            <ul className="md-list">
                {Object.keys(this.state.rules).map(key => this.renderRule(key, this.state.rules[key]))}
            </ul>
        );
    }

    render(){

        return(
            <div>
                <PageHeader title="Customer Delivery Date Rules"  translate={true}  />
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-3">
                                    <CompanySearchAutoComplete label = "Customer" value = {this.props.customer} readOnly={this.props.readOnly}
                                                               onchange = {(value) => this.handleSelectCustomer(value)} />
                                </GridCell>
                                <GridCell width="1-6">
                                    <div className = "uk-margin-top">
                                        <Button label="Create New Rule" size="small" style="success"
                                                onclick = {() => this.handleCreateNewRule()} />
                                    </div>
                                </GridCell>
                                <GridCell width="1-1">
                                    {this.renderList()}
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}
DeliveryDateRuleList.contextTypes = {
    router: React.PropTypes.object.isRequired
};