import _ from "lodash";
import * as axios from 'axios';
import uuid from "uuid";

import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown} from "susam-components/basic";

import {AssignmentPlanningRuleService} from "../../../services";

import {ResponsibilityRuleForm} from "./ResponsibilityRuleForm";
import {ResponsibilityRuleList} from "./ResponsibilityRuleList";

export class ResponsibilityRule extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            lookup: {},
            selectedItem: this.createNewItem()
        }
    };

    createNewItem() {
        return {_key: uuid.v4()}
    }

    componentWillReceiveProps() {
        if(this.props.data) {
            if(!this.state.dataKey) {
                this.setState({dataKey: this.props.dataKey, selectedItem: {}});
            } else if(this.state.dataKey != this.props.dataKey){
                this.setState({dataKey: this.props.dataKey, selectedItem: {}});
            }
        }
    }

    updateSelectedItem(field, value) {
        let selectedItem = _.cloneDeep(this.state.selectedItem);
        selectedItem[field] = value;
        this.setState({selectedItem : selectedItem});
    }

    updateOperationRegion(value) {
        let selectedItem = _.cloneDeep(this.state.selectedItem);
        selectedItem.operationRegion = value;
        this.setState({selectedItem : selectedItem}, () => {
            if(value) {
                let operationRegion = _.find(this.props.lookup.operationRegion, {id: value.id});
                this.setState({regionOptions: operationRegion })
            } else {
                this.setState({regionOptions: null })
            }
        });
    }

    handleRuleDataUpdate(key, value) {
        let currentState = _.cloneDeep(this.state.selectedItem);
        _.set(currentState, key, value);
        this.setState({selectedItem: currentState});
    }

    selectHandler(item) {
        this.setState({selectedItem: item})
    }

    render() {

        let selectedItem = this.state.selectedItem;
        let data = this.props.data;
        let lookup = this.props.lookup;
        let ruleType = this.props.ruleType;

        if (!ruleType || !lookup ) {
            return null;
        }

        let saveButton =  selectedItem ?
            <GridCell width="1-4">
            <Button label="Save" onclick={() => {
                this.props.saveHandler(this.state.selectedItem, () => { this.setState({selectedItem: this.createNewItem()}) })
            }}/>
        </GridCell> : null;

        let responsibilityRuleList =  data ? <ResponsibilityRuleList  ruleType={ruleType} data={data}
                                                                     handleDeleteItem={(item) => {this.props.deleteHandler(item)}}
                                                                     handleSelectItem={(item) => {this.selectHandler(item)}}/> : null;

        return (
            <div>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <CardHeader title="Rules"/>
                    </GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        <ResponsibilityRuleForm lookup={lookup}
                                                data={selectedItem}
                                                ruleType={ruleType}
                                                ruleDataUpdateHandler={(key, value) => this.handleRuleDataUpdate(key, value)}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <Button label="new" onclick={() => {
                            this.setState({selectedItem: this.createNewItem()})
                        }}/>
                    </GridCell>
                    {saveButton}
                    <GridCell width="1-1" key={"rrl" + this.props.dataKey + this.props.ruleType.name}>
                        {responsibilityRuleList}
                    </GridCell>
                </Grid>
            </div>
        );
    }
}
