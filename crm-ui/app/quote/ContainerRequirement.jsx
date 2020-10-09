import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { NumberInput } from "susam-components/advanced";
import { DropDown, Form } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";


export class ContainerRequirement extends TranslatingComponent{

    state = {};
    static defaultProps = {
        containerRequirement: {}
    }

    validate(){
        return this.form.validate();
    }

    handleChange(key, value){
        let containerRequirement = _.cloneDeep(this.props.containerRequirement);
        _.set(containerRequirement, key, value)
        this.props.onChange(containerRequirement);

    }

    render(){
        return(
            <Form ref = {c => this.form = c}>
                <Grid widthLarge={true}>
                    <GridCell width="1-3">
                        <DropDown options = {this.props.containerTypes} label="Type" valueField="code"
                                  value = {this.props.containerRequirement.type} required={true}
                                  onchange = {(country) => this.handleChange("type", country)} />
                    </GridCell>
                    <GridCell width="1-3">
                        <DropDown options = {this.props.chargeableVolumes} label="Volume" valueField="code"
                                  value = {this.props.containerRequirement.volume} required={true}
                                  onchange = {(country) => this.handleChange("volume", country)} />
                    </GridCell>

                    <GridCell width="1-3">
                        <NumberInput label="Quantity" required={true} maxLength="2"
                                     value = {this.props.containerRequirement.quantity} onchange = {(value) => this.handleChange("quantity", value)}/>
                    </GridCell>
                </Grid>
            </Form>

        );
    }
}