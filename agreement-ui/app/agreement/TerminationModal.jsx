import React from "react";
import PropTypes from "prop-types";
import {TranslatingComponent} from 'susam-components/abstract';
import { Grid, GridCell} from 'susam-components/layout';
import { TextInput, TextArea, Form } from 'susam-components/basic';
import { Date } from "susam-components/advanced";

export class TerminationModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleChange(key, value){
        let legalInfo = _.cloneDeep(this.props.legalInfo);
        legalInfo[key] = value;
        this.props.onChange && this.props.onChange(legalInfo);
    }

    validate(){
        return this.form.validate();
    }

    render(){
        return (
            <Form ref = {c => this.form = c}>
                <Grid>
                    <GridCell width="1-3">
                        <Date label="Termination Date" hideIcon={false}
                              value={this.props.legalInfo.terminationDate}
                              required={true}
                              onchange={(value) => this.handleChange("terminationDate", value)} />
                    </GridCell>
                    <GridCell width="2-3">
                    <TextArea label="Termination Reason"
                              value = {this.props.legalInfo.terminationReason}
                              required={true}
                              rows={3} maxLength="1000"
                              onchange = {(value) => this.handleChange("terminationReason", value)}/>
                    </GridCell>
                </Grid>
            </Form>
        );
    }
}

TerminationModal.contextTypes = {
    translator: PropTypes.object
};
