import React from "react";
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown, Checkbox} from 'susam-components/basic';
import {NumericInput} from "susam-components/advanced";

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";


export class HandlingControlEdit extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: {range:{}},
            lookup: {}
        }
        this.APPROVAL_TYPE_POSIBLE_WITH_APPROVAL_ID = "POSSIBLE_WITH_APPROVAL";
        this.APPROVAL_TYPE_NOT_ALLOWED_ID = "NOT_ALLOWED";
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
        if (data.approvalType && data.approvalType.id == this.APPROVAL_TYPE_NOT_ALLOWED_ID) {
            data.approvalWorkflow = null;
        }
        let result = this.props.saveClickHandler(data);
    }

    render() {
        let data = this.state.data;
        let lookup = this.state.lookup;

        let readonlyRangeType = this.state.readonlyRangeType;

        let saveButtonLabel;
        if (data._uikey) {
            saveButtonLabel = "Save";
        } else {
            saveButtonLabel = "Add";
        }

        let approvalWorkflowElem = null;

        if (data.approvalType && data.approvalType.id == this.APPROVAL_TYPE_POSIBLE_WITH_APPROVAL_ID) {
            approvalWorkflowElem =
                <GridCell width="2-10" noMargin={true}>
                    <DropDown label="Approval Workflow" options={lookup.approvalWorkflow}
                              value={data.approvalWorkflow} onchange={(e) => this.updateData("approvalWorkflow", e)}/>
                </GridCell>
        }

        return (
            <Grid>

                <GridCell width="2-10" noMargin={true}>
                    <DropDown label="Range Type" options={lookup.rangeType}
                              readOnly={readonlyRangeType}
                              value={readonlyRangeType ? readonlyRangeType : data.range.rangeType}
                              onchange={(e) => this.updateRangeData("rangeType", e)}/>
                </GridCell>
                <GridCell width="1-10" noMargin={true}>
                    <NumericInput label="Min Range" value={data.range.minRange}
                               onchange={(e) => this.updateRangeData("minRange", e)}/>
                </GridCell>
                <GridCell width="1-10" noMargin={true}>
                    <NumericInput label="Max Range" value={data.range.maxRange}
                               onchange={(e) => this.updateRangeData("maxRange", e)}/>
                </GridCell>
                <GridCell width="2-10" noMargin={true}>
                    <DropDown label="Handling" options={lookup.approvalType} value={data.approvalType}
                              onchange={(e) => this.updateData("approvalType", e)}/>
                </GridCell>
                {approvalWorkflowElem}
                <GridCell width="1-10" noMargin={true}>
                    <Button label={saveButtonLabel} onclick={() => {this.handleSave()}}/>
                </GridCell>
            </Grid>
        );
    }
}