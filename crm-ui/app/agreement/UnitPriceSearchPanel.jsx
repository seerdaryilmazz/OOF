import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';

import {Grid, GridCell} from "susam-components/layout";
import {TextInput, Button, DropDown} from 'susam-components/basic';
import {Date as DateSelector} from 'susam-components/advanced';

import _ from "lodash";
import uuid from "uuid";

export class UnitPriceSearchPanel extends TranslatingComponent {
    state = {
        filter: {}
    };

    constructor(props){
        super(props);
        this.idForSearchPanel = "unitPriceSearchPanel" + uuid.v4();
    }

    showOrHideSearchPanel() {
        $("#" + this.idForSearchPanel).slideToggle("slow");
    }

    hideSearchPanel(){
        $("#" + this.idForSearchPanel).slideUp();
    }

    componentDidUpdate(prevProps){
        if(!_.isEmpty(this.state.filter) && !_.isEqual(prevProps.pageNumber, this.props.pageNumber)){
            this.handleSearch();
        }
        if(!prevProps.readOnly && this.props.readOnly){
            this.handleSearch(true);
            this.hideSearchPanel();
        }
    }

    updateSearchParams(key, value ,name, path = undefined) {
        let filter = _.cloneDeep(this.state.filter);
        if(filter[key] && (_.isNil(value) || _.isEmpty(value))){
           delete filter[key];
        } else {
            filter[key] = {
                name: name,
                value: value,
                path: _.get(value, path, value)
            };
        }
        this.setState({filter: filter})
    }

    handleSearch(clear = false){
        if(this.props.onSearch){
            if(clear){
                this.setState({filter: {}}, ()=>this.props.onSearch({}));
            } else {
                this.props.onSearch(this.state.filter);
            }
        }
    }

    extractOptions(field, list = _.defaultTo(this.props.unitPrices, [])){
        let extractedList = _.reject(list.map(i=>_.get(i, field)), _.isNil);
        list = _.uniqWith(extractedList, _.isEqual).map(i=>{
            if(_.isString(i)) {
                return {name: i, code: i};
            } else {
                return i;
            }
        });
        return list;
    }

    render() {
        return (
            <div style={{display: "none"}} id={this.idForSearchPanel}>
                <Grid collapse={false}>
                    <GridCell width="1-4">
                        <TextInput label="Service Name"
                                   value = {_.get(this.state.filter, 'serviceName.value')}
                                   uppercase = {true}
                                   onchange = {value => this.updateSearchParams('serviceName', value, 'serviceName')}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <DropDown label="Service Area"
                                  options={this.extractOptions('billingItem.serviceArea')}
                                  value = {_.get(this.state.filter, 'serviceArea.value')}
                                  translate={true}
                                  labelField="name" valueField="code"
                                  onchange={(value) => this.updateSearchParams('serviceArea', value, 'billingItem.serviceArea', 'code')}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <DropDown label="Billing Item"
                                  options={this.extractOptions('billingItem')}
                                  value={_.get(this.state.filter, 'billingItem.value')}
                                  valueField="name" labelField="description"
                                  translate={true}
                                  onchange={(value) => this.updateSearchParams('billingItem', value, 'billingItem.name', 'name')}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <DropDown label="Based On"
                                  options={this.extractOptions('basedOn')}
                                  value={_.get(this.state.filter, 'basedOn.value')}
                                  translate={true}
                                  onchange={(value) => this.updateSearchParams('basedOn', value, 'basedOn.id', 'id')}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <DateSelector label="Validity Start Date"
                                      value={_.get(this.state.filter, 'validityStartDate.value')}
                                      onchange={(value) => this.updateSearchParams('validityStartDate', value, 'validityStartDate')}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <DateSelector label="Validity End Date"
                                      value={_.get(this.state.filter, 'validityEndDate.value')}
                                      onchange={(value) => this.updateSearchParams('validityEndDate', value, 'validityEndDate')}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <DropDown label="Price Models"
                                  options={this.extractOptions('priceModel')}
                                  value={_.get(this.state.filter, 'priceModel.value')}
                                  translate={true}
                                  onchange={(value) => this.updateSearchParams('priceModel', value, 'priceModel.name', 'name')}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="Clear" onclick={() => this.handleSearch(true)}/>
                            <Button label="Search" onclick={() => this.handleSearch()}/>
                        </div>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}