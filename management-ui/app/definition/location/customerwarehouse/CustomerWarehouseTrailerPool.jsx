import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { NumericInput } from 'susam-components/advanced';
import { Form, Notify } from 'susam-components/basic';
import { CardHeader, Grid, GridCell } from "susam-components/layout";
import { CompanyLocationSearchAutoComplete } from 'susam-components/oneorder/CompanyLocationSearchAutoComplete';
import { CustomsDetails } from "../place/CustomsDetails";



export class CustomerWarehouseTrailerPool extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: {}
        }
        this.durations = [];
        for(let counter = 30; counter <= (4 * 24 * 60); counter+=30){
            let time = convertMinutesToTime(counter);
            this.durations.push({id: time, name: time});
        }
    }

    componentDidMount() {
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        let state = _.cloneDeep(this.state);
        if (props.data) {
            state.data = _.cloneDeep(props.data);
        }
        if (props.lookup) {
            state.lookup = props.lookup;
        }
        if(!state.data.customsDetails){
            let defaultCustomsType = null, customsCode = null, customsOffice = null;
            if(state.data.companyType.id === "COMPANY"){
                defaultCustomsType = "NON_BONDED_WAREHOUSE";
            }else if(state.data.companyType.id === "CUSTOMS"){
                defaultCustomsType = "CUSTOMS_WAREHOUSE";
                customsCode = state.data.company.customsCode;
                customsOffice = state.data.company;
            }

            state.data.customsDetails = {
                customsType: {id: defaultCustomsType},
                customsCode: customsCode,
                customsOffice: customsOffice
            }
        }

        this.setState(state);
    }
    updateState(field, value) {
        let data = this.state.data;
        data[field] = value;
        this.updateData(data);
    }

    updateRegistrationCompanyLocation(value){
        let data = _.cloneDeep(this.state.data);
        data.registrationCompany = value.company;
        data.registrationCompanyLocation = value.location;
        this.updateData(data);
    }

    updateDocumentClaimCompanyLocation(value){
        let data = _.cloneDeep(this.state.data);
        data.documentClaimCompany = value.company;
        data.documentClaimCompanyLocation = value.location;
        this.updateData(data);
    }
    
    updateData(data) {
        this.setState({data: data});
    }

    next() {
        let data = this.state.data;
        return new Promise(
            (resolve, reject) => {
                if (!this.form.validate() || !this.customsDetails.validate()) {
                    Notify.showError("There are eori problems");
                    reject();
                    return;
                }
                this.props.handleSave(data);
                resolve(true);

            });
    }
    render() {
        let data = this.state.data;
        if (!data) {
            return null;
        }
        console.log("data", data);
        return (
                <Grid>
                    <GridCell width="1-1">
                        <CustomsDetails ref = {c => this.customsDetails = c}
                                        companyType = {this.props.data.companyType}
                                        company = {this.props.data.company}
                                        customsTypes = {this.props.customsTypes}
                                        customsOffices = {this.props.customsOffices}
                                        countryCode = {data.establishment ? data.establishment.address.country.iso : ""}
                                        details = {data.customsDetails}
                                        onChange = {value => this.updateState("customsDetails", value)}
                                        externalIds = {data.externalIds}
                                        onExternalIdsChange = {value => this.updateState("externalIds", value)} />
                    </GridCell>
                    <GridCell width="1-1">
                        <CardHeader title="Operational Details"/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Form ref={(c) => this.form = c}>
                            <Grid>
                                <GridCell width="2-3">
                                    <CompanyLocationSearchAutoComplete inline={true}
                                                                       companyLabel="Registration Company" locationLabel="Registration Location"
                                                                       value={{company: data.registrationCompany, location: data.registrationCompanyLocation}}
                                                                       onChange = {value => this.updateRegistrationCompanyLocation(value)}/>
                                </GridCell>
                                <GridCell width="1-3"/>
                                <GridCell width="2-3">
                                    <CompanyLocationSearchAutoComplete inline={true}
                                                                       companyLabel="Document Claim Company" locationLabel="Document Claim Location"
                                                                       value={{company: data.documentClaimCompany, location: data.documentClaimCompanyLocation}}
                                                                       onChange = {value => this.updateDocumentClaimCompanyLocation(value)}/>
                                </GridCell>
                                <GridCell width="1-3"/>
                            </Grid>
                        </Form>
                    </GridCell>
                    <GridCell width="1-1">
                        <CardHeader title="Trailer Pool"/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Form ref={(c) => this.form = c}>
                            <Grid>
                                <GridCell width="1-4">
                                    <NumericInput label="Minimum Amount of Trailers" value={data.trailerMinRequired}
                                                  onchange={(value) => this.updateState("trailerMinRequired", value)}/>
                                </GridCell>

                                <GridCell width="1-4">
                                    <NumericInput label="Trailer Capacity" value={data.trailerCapacity}
                                                  onchange={(value) => this.updateState("trailerCapacity", value)}/>
                                </GridCell>
                                <GridCell width="1-2"/>
                            </Grid>
                        </Form>
                    </GridCell>
                </Grid>
        );
    }
}

function convertMinutesToTime(value){
    let hours = parseInt(value / 60);
    hours = hours < 10 ? ("0" + hours) : ("" + hours);
    let minutes = parseInt(value % 60);
    minutes = minutes < 10 ? ("0" + minutes) : ("" + minutes);
    return hours + ":" + minutes;

}