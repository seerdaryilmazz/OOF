import React from 'react';
import { LookupService } from "../services/LookupService";
import { Notify, ReadOnlyDropDown, Span } from 'susam-components/basic';
import { NumericInput } from "susam-components/advanced";
import { Grid, GridCell } from 'susam-components/layout';

export class RenewalDate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        LookupService.getRenewalDateTypes().then(response => {
            let state = _.cloneDeep(this.state);
            state.renewalDateTypes = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleOnRenewalLengthChange(value) {
        this.props.onRenewalLengthChange && this.props.onRenewalLengthChange(value);
    }

    handleOnRenewalLengthDateTypeChange(value) {
        this.props.onRenewalLengthDateTypeChange && this.props.onRenewalLengthDateTypeChange(value);
    }

    renderReadOnlyRenewalDate() {
        let renewalDate = (this.props.renewalLengthValue && this.props.renewalLengthDateType)
                                    ? this.props.renewalLengthValue + " " + this.props.renewalLengthDateType.name
                                    : "";
        return(
            <div>
                <Span label={this.props.renewalLengthLabel} value={renewalDate}/>
            </div>
        );
    }

    render() {
        return(
            !this.props.readOnly ?
            <Grid collapse={true}>
                <GridCell width="2-3">
                    <NumericInput label={this.props.renewalLengthLabel} maxLength={"3"} style={{ textAlign: "right" }}
                                  value={this.props.renewalLengthValue}
                                  required={this.props.required}
                                  onchange={(value) => this.handleOnRenewalLengthChange(value)} />
                </GridCell>
                <GridCell width="1-3">
                    <ReadOnlyDropDown options={this.state.renewalDateTypes}
                                      readOnly={this.props.readOnly}
                                      required={this.props.renewalLengthValue}
                                      value={this.props.renewalLengthDateType}
                                      onchange = {(value) => this.handleOnRenewalLengthDateTypeChange(value)}/>
                </GridCell>
            </Grid>
                :
            this.renderReadOnlyRenewalDate()
        );
    }
}