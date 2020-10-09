import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { LoadingIndicator } from "../utils";
import { Form, TextInput, TextArea } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { RenewalDate } from "../common/RenewalDate";
import { Date } from "susam-components/advanced";
import { withReadOnly } from "../utils";

export class KpiInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
        this.moment = require("moment");
    }

    handleChange(key, value) {
        let kpiInfo = _.cloneDeep(this.props.kpiInfo);
        _.set(kpiInfo, key, value);
        this.props.onChange(kpiInfo);
    }

    handleCalculationNextPeriod(key, value){
        this.handleChange(key,value);

        let date = (this.props.kpiInfo.lastUpdateDate &&
            this.props.kpiInfo.updatePeriod &&
            this.props.kpiInfo.renewalDateType)
            ? moment(this.props.kpiInfo.lastUpdateDate, "DD/MM/YYYY")
                .add(this.props.kpiInfo.updatePeriod, this.props.kpiInfo.renewalDateType.id)
                .format('DD/MM/YYYY'): null;
        if(date){
            this.handleChange("nextUpdateDate",date);
        }
    }

    validate() {
        return this.form.validate();
    }

    renderLastUpdateDate() {
        return(
            <Date label="Last Update Date" hideIcon={true}
                  value={this.props.kpiInfo.lastUpdateDate ? this.props.kpiInfo.lastUpdateDate : " "}
                  onchange={(value) => this.handleCalculationNextPeriod("lastUpdateDate", value)} />
        );
    }

    getContent() {
        return(
            <Grid>
                <GridCell width="1-3">
                    <TextInput label="Name"
                               value = {this.props.kpiInfo.name}
                               uppercase = {true}
                               onchange = {(value) => this.handleChange("name", value)}
                               required = {true}/>
                </GridCell>
                <GridCell width="1-3">
                    <ReadOnlyTextArea label="Target" value = {this.props.kpiInfo.target || " "}
                                      rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                      required = {true}
                                      onchange = {(value) => this.handleChange("target", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    <ReadOnlyTextArea label="Actual" value = {this.props.kpiInfo.actual || " "}
                                      rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                      onchange = {(value) => this.handleChange("actual", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    {this.renderLastUpdateDate()}
                </GridCell>
                <GridCell width="1-3">
                    <RenewalDate renewalLengthLabel="Update Period"
                                 renewalLengthValue={this.props.kpiInfo.updatePeriod}
                                 renewalLengthDateType={this.props.kpiInfo.renewalDateType}
                                 onRenewalLengthChange={(value) => this.handleCalculationNextPeriod("updatePeriod", value)}
                                 onRenewalLengthDateTypeChange={(value) => this.handleCalculationNextPeriod("renewalDateType", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    <Date label="Next Update Date" hideIcon={true}
                          value={this.props.kpiInfo.nextUpdateDate}
                          readOnly={true} />
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

const ReadOnlyTextArea = withReadOnly(TextArea);