import React from "react";
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {TextInput, Button, DropDown, Checkbox} from 'susam-components/basic';
import {NumericInput} from "susam-components/advanced";

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";


export class PackageHandlingRuleEdit extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: {range:{}},
            lookup: {}
        }
        this.PACKAGE_HANDLING_TYPE_CANNOT_BE_HANDLED = "CAN_NOT_BE_HANDLED";
        this.PACKAGE_HANDLING_TYPE_HANDLING_STAFF_NEEDED = "HANDLING_STAFF_NEEDED";
        this.PACKAGE_HANDLING_TYPE_SPECILA_EQUIPMENT_NEEDED = "SPECIAL_EQUIPMENT_IS_NEEDED";
    }

    componentDidMount() {
        if (this.props.data) {
            this.setState({data: _.cloneDeep(this.props.data)});
        } else {
            this.setState({data: {range:{}}});
        }
        if (this.props.lookup) {
            this.setState({lookup: this.props.lookup});
        }
        this.handleReadOnlyRangeType(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({data: _.cloneDeep(nextProps.data)});
        } else {
            this.setState({data: {range:{}}});
        }
        if (nextProps.lookup) {
            this.setState({lookup: nextProps.lookup});
        }
        this.handleReadOnlyRangeType(nextProps);
    }

    handleReadOnlyRangeType(props) {
        if(props.readonlyRangeType) {
            this.setState({readonlyRangeType: props.readonlyRangeType}, () => {
                this.updateRangeData("rangeType", props.readonlyRangeType);
            });
        }else {
            this.setState({readonlyRangeType: null});
        }
    }

    updateData(field, value) {
        let data = this.state.data;
        data[field] = value;
        this.setState({data: data})
    }

    updateRangeData(field, value) {
        let data = this.state.data;
        data.range[field] = value;
        this.setState({data: data})
    }

    handleSave() {
        let data = this.state.data;
        if(data.packageHandlingType && data.packageHandlingType.id == this.PACKAGE_HANDLING_TYPE_CANNOT_BE_HANDLED) {
            data.responsibleUser = null;
        }
        let result = this.props.saveClickHandler(data);
    }

    render() {
        let data = this.state.data;
        let lookup = this.state.lookup;

        let readonlyRangeType = this.state.readonlyRangeType;

        let saveButtonLabel;
        if(data._uikey) {
            saveButtonLabel = "Save";
        } else {
            saveButtonLabel = "Add";
        }

        let responsibleUserElem = null;



        if(data.packageHandlingType &&
            (data.packageHandlingType.id == this.PACKAGE_HANDLING_TYPE_HANDLING_STAFF_NEEDED
            || data.packageHandlingType.id == this.PACKAGE_HANDLING_TYPE_SPECILA_EQUIPMENT_NEEDED)) {
            responsibleUserElem =
                <GridCell width="2-10"  >
                    <TextInput label="Responsible User" value={data.responsibleUser} onchange={(e) => this.updateData("responsibleUser", e)}/>
                </GridCell>
        }
        return (
            <Grid>
                <GridCell width="2-10" noMargin={true}>
                    <DropDown label="PackageGroup"
                              options={lookup.packageGroup}
                              value={data.packageGroup}
                              onchange={(e) => this.updateData("packageGroup", e)}/>
                </GridCell>
                <GridCell width="2-10"noMargin={true}>
                    <DropDown label="Range Type" options={lookup.rangeType}
                              readOnly={readonlyRangeType}
                              value={readonlyRangeType ? readonlyRangeType : data.range.rangeType}
                              onchange={(e) => this.updateRangeData("rangeType", e)}/>
                </GridCell>
                <GridCell width="1-10"noMargin={true}>
                    <NumericInput label="Min Range" value={data.range.minRange} onchange={(e) => this.updateRangeData("minRange", e)}/>
                </GridCell>
                <GridCell width="1-10"noMargin={true}>
                    <NumericInput label="Max Range" value={data.range.maxRange} onchange={(e) => this.updateRangeData("maxRange", e)}/>
                </GridCell>
                <GridCell width="4-10" noMargin={true}/>
                <GridCell width="2-10" >
                    <DropDown label="Handling" options={lookup.warehousePackageHandlingType} value={data.packageHandlingType} onchange={(e) => this.updateData("packageHandlingType", e)}/>
                </GridCell>
                {responsibleUserElem}
                <GridCell width="1-10">
                    <Button label={saveButtonLabel} onclick={() => {this.handleSave()}}/>
                </GridCell>
            </Grid>
        );
    }
}