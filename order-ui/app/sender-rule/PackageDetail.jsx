import _ from "lodash";
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumericInput } from 'susam-components/advanced';
import { DropDown } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { OrderService } from "../services";

const MAX_STACK = 20;

export class PackageDetail extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.maxStackOption = { id: "0", name: "Maximum" };
        this.noStackOption = { id: "1", name: "Not Stackable" };
        this.state = { packageDetail: {}, stackOptions: this.populateStackOptions(MAX_STACK), packageTypes: {} };
        this.truckHeight = 300;
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.packageDetail, this.props.packageDetail)) {
            this.handleStackSizeUpdate(this.props.packageDetail);
        }
    }
    s
    loadData() {
        OrderService.getPackageTypesAndGroups().then(response => {
            let state = _.cloneDeep(this.state);
            state.packageTypes = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    populateStackOptions(max) {
        let stackOptions = [...Array(_.clamp(max, 1, MAX_STACK) - 1).keys()].map(item => {
            return { id: item + 2, name: "" + (item + 2) }
        });
        stackOptions.splice(0, 0, this.noStackOption);
        if (_.get(this.props.packageDetail, 'packageType.packageGroup.code') === 'BULK') {
            stackOptions.push(this.maxStackOption);
        }
        return stackOptions;
    }

    handleStackSizeUpdate(packageDetail) {
        var stackSize = Math.floor(this.truckHeight / packageDetail.height);
        stackSize = stackSize <= MAX_STACK ? stackSize : MAX_STACK;
        this.setState({ stackOptions: this.populateStackOptions(stackSize) });

        if (packageDetail.stackSize && (packageDetail.stackSize.id > stackSize)) {
            this.props.onChange("stackSize");
        }


    }

    render() {
        let customComponent = "";
        if (this.props.customComponent) {
            customComponent = this.props.customComponent;
        }

        return (
            <Grid>
                <GridCell width="1-6">
                    <DropDown label="Package Type" options={this.state.packageTypes}
                        value={this.props.packageDetail.packageType} required={true}
                        onchange={(value) => { this.props.onChange("packageType", value) }} />
                </GridCell>
                <GridCell width="1-10">
                    <NumericInput label="Width"
                        value={this.props.packageDetail.width}
                        unit="cm"
                        digits="2"
                        onchange={(value) => this.props.onChange("width", value)} />
                </GridCell>
                <GridCell width="1-10">
                    <NumericInput label="Length"
                        value={this.props.packageDetail.length}
                        unit="cm"
                        digits="2"
                        onchange={(value) => this.props.onChange("length", value)} />
                </GridCell>
                <GridCell width="1-10">
                    <NumericInput label="Height"
                        value={this.props.packageDetail.height}
                        unit="cm"
                        digits="2"
                        onchange={(value) => { this.props.onChange("height", value) }} />
                </GridCell>
                <GridCell width="1-6">
                    <DropDown label="Stackability" options={this.state.stackOptions}
                        value={this.props.packageDetail.stackSize}
                        onchange={(value) => this.props.onChange("stackSize", value)} />
                </GridCell>
                {customComponent}
            </Grid>
        );
    }
}