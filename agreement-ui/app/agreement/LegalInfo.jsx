import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Card, CardHeader, Grid, GridCell} from 'susam-components/layout';
import { Form, ReadOnlyDropDown, Notify, TextInput, Span, TextArea } from 'susam-components/basic';
import { NumericInput, Date } from "susam-components/advanced";
import { CountryDropDown } from "../common/CountryDropDown";
import {withReadOnly} from "../utils";
import { LookupService } from "../services/LookupService";

export class LegalInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
        this.moment = require("moment");
    }

    componentDidMount() {
        this.initializeLookups();
    }

    validate() {
        return this.form.validate();
    }

    handleChange(key, value) {
        let legalInfo = _.cloneDeep(this.props.legalInfo);
        _.set(legalInfo, key, value);
        let keyValuePairs = [{key: "legalInfo", value: legalInfo}];
        this.props.onChange(keyValuePairs);
    }

    initializeLookups() {
        LookupService.getApographType().then(response => {
            let state = _.cloneDeep(this.state);
            state.apographTypes = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    getContent() {
        return(
            <Grid>
                <GridCell width="1-5">
                    <TextInput label="Court"
                               value = {this.props.legalInfo.court}
                               readOnly={this.props.readOnly}
                               uppercase = {true}
                               onchange = {(value) => this.handleChange("court", value)}/>
                </GridCell>
                <GridCell width="1-5">
                    <CountryDropDown label="Law"
                                     value={this.props.legalInfo.law}
                                     translate={true}
                                     valueField="iso"
                                     readOnly={this.props.readOnly}
                                     onchange={(value) => this.handleChange("law", value)}/>
                </GridCell>
                <GridCell width="1-5">
                    <NumericInput label="Number Of Apographs" maxLength={"2"}
                                  digits="0" digitsOptional = {false}
                                  value={this.props.legalInfo.numberOfApographs}
                                  readOnly={this.props.readOnly}
                                  onchange={(value) => this.handleChange("numberOfApographs", value)}/>
                </GridCell>
                <GridCell width="1-5">
                    <ReadOnlyDropDown options={this.state.apographTypes} label="Apograph Type"
                                      readOnly={this.props.readOnly}
                                      value={this.props.legalInfo.apographType}
                                      onchange = {(value) => this.handleChange("apographType", value)}/>
                </GridCell>
                <GridCell width="1-5">
                    <NumericInput label="Number Of Papers" maxLength={"2"}
                                  digits="0" digitsOptional = {false}
                                  value={this.props.legalInfo.numberOfPapers}
                                  readOnly={this.props.readOnly}
                                  onchange={(value) => this.handleChange("numberOfPapers", value)}/>
                </GridCell>
                {this.props.legalInfo.terminationDate
                    ? <GridCell width="1-5">
                        <Span label="Termination Date" value={this.props.legalInfo.terminationDate}/>
                    </GridCell>
                    : null
                }
                {this.props.legalInfo.terminationReason
                    ? <GridCell width="2-5">
                    <ReadOnlyTextArea label="Termination Reason"
                              value={this.props.legalInfo.terminationReason}
                              rows={3} maxLength="1000"
                              readOnly={true}
                              onchange={(value) => this.handleChange("terminationReason", value)}/>
                    </GridCell>
                    : null
                }
            </Grid>
        );
    }

    render() {
        return(
            <Card>
                <Form ref={c => this.form = c}>
                    <CardHeader title="Legal Info"/>
                    {this.getContent()}
                </Form>
            </Card>
        );
    }
}

const ReadOnlyTextArea = withReadOnly(TextArea);