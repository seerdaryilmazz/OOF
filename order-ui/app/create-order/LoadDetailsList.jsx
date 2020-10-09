import React from 'react';
import _ from 'lodash';
import uuid from 'uuid';
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';
import {Button,Form, DropDown, TextInput} from 'susam-components/basic';
import {NumericInput, NumericInputWithUnit} from 'susam-components/advanced';
import {Table} from 'susam-components/table';
import {HSCodeAutoComplete} from 'susam-components/oneorder';

import {DimensionDetailsList} from './DimensionDetailsList';

export class LoadDetailsList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
        this.state.headers = this.getHeaders();
        this.state.inlineEditForm = this.getInlineEditForm();
        this.state.actions = this.getActions();
    }

    componentDidMount(){
        axios.get("/order-service/lookup/package-type").then((response) => {
            let state = _.cloneDeep(this.state);
            state.inlineEditForm.kap = [<NumericInputWithUnit required={true} digits="0" digitsOptional = {false} units = {response.data}/>];
            this.setState(state);
        }).catch((error) => {
            console.log(error);
        });
    }

    getHeaders() {
        return [
            {
                name: "id",
                data: "id",
                hidden: true
            },
            {
                name: "Amount",
                data: "kap",
                width: "15%",
                render: (value) => {
                    let result = "";
                    if(value.kap && value.kap.amount) {
                        result = value.kap.amount;
                        if(value.kap.unit){
                            result = result + " " + value.kap.unit.name;
                        }
                    }
                    return result;
                }
            },
            {
                name: "Gross Weight",
                data: "grossweight",
                width: "10%"
            },
            {
                name: "Dead Weight",
                data: "neatweight",
                width: "10%"
            },
            {
                name: "Volume",
                data: "volume",
                width: "10%"
            },

            {
                name: "LDM",
                data: "ldm",
                width: "10%"
            },
            {
                name: "HS Code",
                data: "hscode",
                width: "25%"
            },
            {
                name: "Load Definition",
                data: "loaddefinition",
                width: "10%"
            },
            {
                name: "Recipient Order No",
                data: "buyerorderno",
                width: "10%"
            }
        ];

    }

    getInlineEditForm() {
        return {
            kap: [<NumericInputWithUnit required={true} digits="0" digitsOptional = {false} />],
            grossweight: [<NumericInput required={true} digits="2" digitsOptional = {false} unit = "kg."/>],
            neatweight: [<NumericInput required={true} digits="2" digitsOptional = {false}  unit = "kg."/>],
            volume: [<NumericInput required={true} digits="2" digitsOptional = {false}  unit = "m3."/>],
            ldm: [<NumericInput required={true} digits="2" digitsOptional = {false}  unit = "m3."/>],
            hscode: [<HSCodeAutoComplete hideLabel = {true} flipDropdown = {true} required={true}/>],
            loaddefinition: [<TextInput required={true}/>],
            buyerorderno: [<TextInput required={true}/>]
        };
    }

    getActions() {
        return {
            actionButtons: [
                {
                    icon: "gear",
                    action: this.handleRowDimensionButtonClick,
                    title: "dimension details"
                }
            ],
            rowEdit: {
                icon: "pencil-square",
                action: this.handleRowEdit,
                title: "edit"
            },
            rowDelete: {
                icon: "close",
                action: this.handleRowDelete,
                title: "remove",
                confirmation: "Are you sure you want to delete?"
            },
            rowAdd: this.handleRowAdd
        };
    }

    handleRowAdd = (loadDetailsElem) => {
        this.props.onLoadDetailsAdd(loadDetailsElem);
    }
    handleRowEdit = (loadDetailsElem, oldLoadDetailsElem) => {
        return this.props.onLoadDetailsEdit(loadDetailsElem);
    }
    handleRowDelete = (loadDetailsElem) => {
        this.props.onLoadDetailsDelete(loadDetailsElem);

    }



    handleRowDimensionButtonClick = (dimensionDetailsElem) => {
        let state = _.cloneDeep(this.state);
        state.selectedLoadDetailsElem = dimensionDetailsElem;
        this.setState(state);
        this.dimensionDetailsModal.open();
    }

    handleAddDimensionDetailsElem = (dimensionDetailsElem) => {

        let state = _.cloneDeep(this.state);
        dimensionDetailsElem._id = uuid.v4();

        state.selectedLoadDetailsElem.dimensionDetailsList.push(dimensionDetailsElem);
        this.handleRowEdit(state.selectedLoadDetailsElem, null);
        this.setState(state);
        return true;
    }

    handleEditDimensionDetailElem = (dimensionDetailsElem) => {
        let state = _.cloneDeep(this.state);
        state.selectedLoadDetailsElem.dimensionDetailsList.forEach((item, index) => {
            if (item._id == dimensionDetailsElem._id) {
                state.selectedLoadDetailsElem.dimensionDetailsList[index] = dimensionDetailsElem;
            }
        });
        this.handleRowEdit(state.selectedLoadDetailsElem, null);
        this.setState(state);
        return true;
    }

    handleDeleteDimensionDetailsElem = (dimensionDetailsElem) => {
        let state = _.cloneDeep(this.state);
        let targetIndex = -1;
        state.selectedLoadDetailsElem.dimensionDetailsList.forEach((item, index) => {
            if (item._id == dimensionDetailsElem._id) {
                state.selectedLoadDetailsElem.dimensionDetailsList[index].deleted = true;
            }
        });
        this.handleRowEdit(state.selectedLoadDetailsElem, null);
        this.setState(state);
    }

    handleCloseDimensionDetailsModal = () => {

        let warningMessage = this.dimensionDetailsTable.constructWarningForDimensionDetailsandLoadDetailsDifference();

        if (warningMessage) {
            UIkit.modal.confirm(warningMessage,
                () => this.closeDimensionDetailsModal());
        } else {
            this.closeDimensionDetailsModal();
        }
    }

    closeDimensionDetailsModal = () => {
        let state = _.cloneDeep(this.state);
        state.selectedDimesionDetailsElem = null;
        this.setState(state);
        this.dimensionDetailsModal.close();
    }


    render() {

        if (!this.props.selectedLoad) {
            return null;
        }

        return (
            <Card title = "Load Details">
                <Grid>
                    <GridCell width="1-1">
                        <Table headers={this.state.headers} actions={this.state.actions}
                               insertion={this.state.inlineEditForm} data={this.props.selectedLoad.loadDetailsList}>
                        </Table>
                    </GridCell>
                </Grid>
                <Modal ref={(c) => this.dimensionDetailsModal = c} large={true} title="Dimension Details"
                       actions = {[{label:"Close", action:() => this.handleCloseDimensionDetailsModal()}]}>

                    <DimensionDetailsList ref={(c) => this.dimensionDetailsTable = c}
                                          selectedLoadDetailsElem={this.state.selectedLoadDetailsElem}
                                          onDimensionDetailsAdd={(values) => this.handleAddDimensionDetailsElem(values)}
                                          onDimensionDetailsEdit={(values) => this.handleEditDimensionDetailElem(values)}
                                          onDimensionDetailsDelete={(values) => this.handleDeleteDimensionDetailsElem(values)}/>
                </Modal>
            </Card>
        );
    }
}

LoadDetailsList.contextTypes = {
    translator: React.PropTypes.object
};
