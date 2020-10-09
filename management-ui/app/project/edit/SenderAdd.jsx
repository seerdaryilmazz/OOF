import React from "react";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader, Modal} from "susam-components/layout";
import {TextInput, Notify, Button, Form} from "susam-components/basic";
import {Chip, DateRange} from "susam-components/advanced";
import {CompanySearchAutoComplete, CompanyLocationSearchAutoComplete} from "susam-components/oneorder";

import {ProjectService} from '../../services';

export class SenderAdd extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {data:{}}

        this.modalActions = [
            {
                label: "Cancel",
                action: () => this.handleCancel()
            }
        ];
    }

    componentDidMount() {
        this.loadData(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this.loadData(nextProps)

    }

    loadData(props) {
        let lookup = this.state.lookup;

        if(props.lookup) {
            lookup = props.lookup;
        }
        this.setState({lookup: lookup});
    }

    updateState(field, value) {
        let data = this.state.data;
        data[field] = value;
        this.setState({data: data});
    }

    updateCompanyLocationState(value) {
        let data = _.cloneDeep(this.state.data);
        data.loadingCompany = value.company;
        data.loadingLocation = value.location;
        this.setState({data: data});
    }


    openModal() {
        this.modalReference.open();
    }

    handleCancel() {
        let data = {};
        this.setState({data: data}, () => {
            this.modalReference.close();
        });
    }

    handleAdd() {
        if(!this.senderAddFormReference.validate()) {
            Notify.error("Please fill the required fields;");
            return
        }
        let data = _.cloneDeep(this.state.data);
        data._guiKey = uuid.v4();
        this.props.handleAdd(data);
        this.setState({data: {}}, () => {
            this.modalReference.close();
        });
    }


    render() {

        let data = this.state.data;

        return (
            <Modal title="New Sender"
                   large={false}
                   ref={(c) => this.modalReference = c}
                   actions={this.modalActions}>
                <Form ref={(c) => this.senderAddFormReference = c}>
                <Grid>
                    <GridCell width="1-1">
                        <CompanySearchAutoComplete label="Sender" required={true}
                                                   value={data.senderCompany}
                                                   onchange={(data) => {
                                                       this.updateState("senderCompany", data)
                                                   }}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <CompanyLocationSearchAutoComplete companyLabel={"Loading Company"}
                                                           locationLabel={"Loading Location"}
                                                           value={{company: data.loadingCompany, location: data.loadingLocation}}
                                                           onChange = {value => this.updateCompanyLocationState(value)}/>
                    </GridCell>

                    <GridCell width="1-10">
                        <Button label="Add" style="success" onclick={() => {
                            this.handleAdd()
                        }}/>
                    </GridCell>
                </Grid>
                </Form>
            </Modal>
        );
    }
}