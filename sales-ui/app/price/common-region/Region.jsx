import React from 'react';
import { Chip } from 'susam-components/advanced';
import { Button, Form, TextInput, DropDown } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';

const OPERATION_FIELD = {
    single: DropDown,
    multipl: Chip
}

export class Region extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            region: _.cloneDeep(props.region)
        };
    }

    handleSave() {
        let { onSaveClick } = this.props;
        if (onSaveClick && this.regionForm.validate()) {
            let region = _.cloneDeep(this.state.region);
            onSaveClick(region);
        }
    }

    handleRegionChange(changes){
        this.setState(prevState=>{
            for(let key in changes){
                _.set(prevState.region, key, changes[key]);
            }
            return prevState;
        });
    }

    renderOperationField() {
        let field = this.state.region.id ? OPERATION_FIELD.single : OPERATION_FIELD.multipl;
        let props = {
            readOnly: this.state.region.id,
            label: "Operation Types",
            options: this.props.lookup.operations,
            required: true,
            value: this.state.region.operation,
            onchange: value => this.handleRegionChange({ 'operation': value })
        }
        return React.createElement(field, props);
    }

    render() {
        let { onCancelClick } = this.props;
        return (
            <Form ref={c=>this.regionForm=c}>
                <Grid>
                    <GridCell width="1-1">
                        <TextInput label="Name" disableAutocomplete={true} required={true} value={this.state.region.name} onchange={value=>this.handleRegionChange({'name': value})} />
                    </GridCell>
                    <GridCell width="1-1">
                        <TextInput label="Postal Codes" disableAutocomplete={true} value={this.state.region.postalCodes} onchange={value=>this.handleRegionChange({'postalCodes': value})} />
                    </GridCell>
                    <GridCell width="1-1">
                        {this.renderOperationField()}
                    </GridCell>
                    <GridCell width="1-1" style={{ textAlign: "right" }}>
                        <Button label="save" style="success" onclick={() => this.handleSave()} />
                        <Button label="cancel" style="danger" onclick={() => onCancelClick && onCancelClick()} />
                    </GridCell>
                </Grid>
            </Form>
        )
    }
}