import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { LoadingIndicator } from "../utils";
import { Form, ReadOnlyDropDown, TextArea, TextInput } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { NumericInput, Date as DateSelector } from "susam-components/advanced";
import {LookupService} from "../services/LookupService";
import * as axios from 'axios';
import {Notify} from "susam-components/basic";


export class SignatureInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.initializeLookups();
    }

    initializeLookups() {
        axios.all([
            LookupService.getEkolOrCustomer()
        ]).then(axios.spread((signedBy) => {
            let state = _.cloneDeep(this.state);
            state.signedBy = signedBy.data;
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        });
    }


    validate() {
        return this.form.validate();
    }


    handleChange(key, value) {
        let signatureInfo = _.cloneDeep(this.props.signatureInfo);
        _.set(signatureInfo, key, value);
        this.props.onChange(signatureInfo);
    }

    getContent() {
        return(
            <Grid>
                <GridCell width="1-5">
                    <ReadOnlyDropDown options={this.state.signedBy} label="Signed By"
                                      required={true} translate={true}
                                      readOnly={this.props.readOnly}
                                      value={this.props.signatureInfo.signedBy}
                                      onchange = {(value) => this.handleChange("signedBy", value)}/>
                </GridCell>
                <GridCell width="1-5">
                    <TextInput label="Name"
                               value = {this.props.signatureInfo.name}
                               onchange = {(value) => this.handleChange("name", value)}
                               required = {true}/>
                </GridCell>
                <GridCell width="1-5">
                    <TextInput label="Title"
                               value = {this.props.signatureInfo.title}
                               onchange = {(value) => this.handleChange("title", value)}/>
                </GridCell>
                <GridCell width="1-5">
                    <DateSelector label="Date" hideIcon={true}
                                  readOnly={this.props.readOnly}
                                  required={true}
                                  value={this.props.signatureInfo.signedDate}
                                  onchange={(value) => this.handleChange("signedDate", value)} />
                </GridCell>
                <GridCell width="1-5">
                    <TextInput label="Place"
                               value = {this.props.signatureInfo.place}
                               onchange = {(value) => this.handleChange("place", value)}/>
                </GridCell>
            </Grid>
        );
    }

    render() {
        return(
            <div>
                <LoadingIndicator busy={this.state.busy}/>
                <Form ref={c => this.form = c}>
                    {this.getContent()}
                </Form>
            </div>
        );
    }
}