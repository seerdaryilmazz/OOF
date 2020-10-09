import React from 'react';
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Modal} from 'susam-components/layout';
import {Button,Form, DropDown, TextInput} from 'susam-components/basic';
import {NumericInput, NumericInputWithUnit} from 'susam-components/advanced';
import {Table} from 'susam-components/table';

export class DimensionDetailsList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
        this.state.footers = [];
        this.state.footers.push({});
        this.state.headers = this.getHeaders();
        this.state.inlineEditForm = this.getInlineEditForm();
        this.state.actions = this.getActions();

        this.state.selectedLoadSummaryHeaders = this.getSelectedLoadSummaryHeaders();
    }
    componentDidMount(){
        axios.get("/order-service/lookup/package-type").then((response) => {
            let state = _.cloneDeep(this.state);
            state.inlineEditForm.amount = [<NumericInputWithUnit required={true} digits="0" digitsOptional = {false} units = {response.data}/>];
            this.setState(state);
        }).catch((error) => {
            console.log(error);
        });
    }


    getSelectedLoadSummaryHeaders () {
        return [
            {
                name: "Miktar",
                data: "kap"
            },
            {
                name: "Brüt",
                data: "grossweight"
            },
            {
                name: "Net",
                data: "neatweight"
            },
            {
                name: "Hacim",
                data: "volume"
            },
            {
                name: "LDM",
                data: "ldm"
            }
        ]
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
                data: "amount",
                render: (value) => {
                    let result = "";
                    if(value.amount && value.amount.amount) {
                        result = value.amount.amount;
                        if(value.amount.unit){
                            result = result + " " + value.amount.unit.name;
                        }
                    }
                    return result;
                }
            },
            {
                name: "Package",
                data: "ambalaj"
            },
            {
                name: "Width",
                data: "xdim"
            },
            {
                name: "Length",
                data: "ydim"
            },

            {
                name: "Height",
                data: "height"
            },
            {
                name: "Gross Weight",
                data: "grossweight"
            },
            {
                name: "Dead Weight",
                data: "neatweight"
            },
            {
                name: "Stack",
                data: "istif"
            },
            {
                name: "Article No",
                data: "articleno"
            },
            {
                name: "Load Piece",
                data: "productnumber"
            },
            {
                name: "Volume",
                data: "volume"
            },
            {
                name: "LDM",
                data: "ldm"
            }
        ];

    }

    getInlineEditForm() {
        return {
            amount: [<NumericInputWithUnit required={true} digits="0" digitsOptional = {false} />],
            ambalaj: [<NumericInput required={true} digits="0" digitsOptional = {false} unit="m."/>],
            xdim: [<NumericInput required={true} digits="2" digitsOptional = {false} unit="m."/>],
            ydim: [<NumericInput required={true} digits="2" digitsOptional = {false} unit="m."/>],
            height: [<NumericInput required={true} digits="2" digitsOptional = {false} unit="m."/>],
            grossweight: [<NumericInput required={true} digits="2" digitsOptional = {false} unit="kg."/>],
            neatweight: [<NumericInput required={true} digits="2" digitsOptional = {false} unit="kg."/>],
            istif: [<NumericInput required={true} digits="0" digitsOptional = {false} unit=""/>],
            articleno: [<TextInput required={true}/>],
            productnumber: [<TextInput required={true}/>]
        };
    }

    getActions() {
        return {
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

    handleRowAdd = (dimensionDetailsElem) => {
        this.calculateDimensionDetailsElemVolumeandLDM(dimensionDetailsElem)
        this.props.onDimensionDetailsAdd(dimensionDetailsElem);
        this.calculateFooterValues();
        this.setState(this.state);
    }
    handleRowEdit = (dimensionDetailsElem, oldDimensionDetailsElem) => {
        this.calculateDimensionDetailsElemVolumeandLDM(dimensionDetailsElem)
        this.props.onDimensionDetailsEdit(dimensionDetailsElem);
        this.calculateFooterValues();
        this.setState(this.state);
        return true;
    }
    handleRowDelete = (dimensionDetailsElem) => {
        this.props.onDimensionDetailsDelete(dimensionDetailsElem);
        this.calculateFooterValues();
        this.setState(this.state);
    }

    calculateDimensionDetailsElemVolumeandLDM = (dimensionDetailsElem) => {
        
        let xdim = !isNaN(parseFloat(dimensionDetailsElem.xdim)) ? +dimensionDetailsElem.xdim : 0;
        let ydim = !isNaN(parseFloat(dimensionDetailsElem.ydim)) ? +dimensionDetailsElem.ydim : 0;
        let height = !isNaN(parseFloat(dimensionDetailsElem.height)) ? +dimensionDetailsElem.height : 0;

        let amount = !isNaN(parseFloat(dimensionDetailsElem.amount)) ? +dimensionDetailsElem.amount : 0;

        dimensionDetailsElem.volume = +this.calculateVolumePerUnit(xdim, ydim, height) * amount;
        dimensionDetailsElem.ldm = +this.calculateLDMPerUnit(xdim, ydim, height) * amount;

    }

    calculateVolumePerUnit = (xdim, ydim, height) => {
        return xdim * ydim * height
    }

    calculateLDMPerUnit = (xdim, ydim, height) => {
        return xdim * ydim * height
    }

    constructWarningForDimensionDetailsandLoadDetailsDifference = () => {

        let selectedLoad = this.props.selectedLoadDetailsElem
        let dimensionDetails = selectedLoad.dimensionDetailsList;

        let totalAmount = 0;
        let totalGrossWeight = 0;
        let totalNeatWeight = 0;
        let totalVolume = 0;
        let totalLDM = 0;

        dimensionDetails.forEach(dimensionData => {

            totalAmount += +dimensionData.amount;
            totalGrossWeight += +(dimensionData.amount * dimensionData.grossweight);
            totalNeatWeight += +(dimensionData.amount * dimensionData.neatweight);
            totalVolume += +dimensionData.volume;
            totalLDM += +dimensionData.ldm;
        });

        let message1 = "";
        let message2 = ""
        if (selectedLoad.kap != totalAmount) {
            message1 += "  Kap miktarı: " + selectedLoad.kap + "<br/>";
            message2 += "  Kap miktarı: " + totalAmount + "<br/>";
        }
        if (selectedLoad.grossweight != totalGrossWeight) {
            message1 += "  Brüt Ağırlık: " + selectedLoad.grossweight + "<br/>";
            message2 += "  Brüt Ağırlık: " + totalGrossWeight + "<br/>";
        }
        if (selectedLoad.neatweight != totalNeatWeight) {
            message1 += "  Net Ağırlık: " + selectedLoad.neatweight + "<br/>";
            message2 += "  Net Ağırlık: " + totalNeatWeight + "<br/>";
        }
        if (selectedLoad.volume != totalVolume) {
            message1 += "  Hacim: " + selectedLoad.volume + "<br/>";
            message2 += "  Hacim: " + totalVolume + "<br/>";
        }
        if (selectedLoad.ldm != totalLDM) {
            message1 += "  LDM: " + selectedLoad.ldm + "<br/>";
            message2 += "  LDM: " + totalLDM + "<br/>";
        }

        let finalMessage = null;
        if (message1 != "" || message2 != "") {
            finalMessage =
                "<b>" + "Tutarsız Veri:" + "</b><br/></br>"
                + "Yük Detayları:" + "<br/>" + message1 + "<br/>"
                + "Ölçü Detayları:" + "<br/>" + message2 + "<br/>"
                + "Devam etmek istiyor musunuz?";
        }

        return finalMessage;


    }

    calculateFooterValues() {

        let footerElem = this.state.footers[0];

        footerElem.amount = 0;
        footerElem.grossweight = 0;
        footerElem.neatweight = 0;
        footerElem.volume = 0;
        footerElem.ldm = 0;

        this.props.selectedLoadDetailsElem.dimensionDetailsList.forEach(dimensionElem => {

                let amount = !isNaN(parseFloat(dimensionElem.amount)) ? +dimensionElem.amount : 0;

                footerElem.amount += +amount;
                footerElem.grossweight += (amount * (!isNaN(parseFloat(dimensionElem.grossweight)) ? +dimensionElem.grossweight : 0));
                footerElem.neatweight += (amount * (!isNaN(parseFloat(dimensionElem.neatweight)) ? +dimensionElem.neatweight : 0));
                footerElem.volume += !isNaN(parseFloat(dimensionElem.volume)) ? +dimensionElem.volume : 0;
                footerElem.ldm += !isNaN(parseFloat(dimensionElem.ldm)) ? +dimensionElem.ldm : 0;
            }
        )
    }

    render() {

        if (!this.props.selectedLoadDetailsElem) {
            return null;
        }
        return (
            <Grid key="dimensionDetialsCard">
                <GridCell width="1-1">{super.translate("Selected Load Details")}</GridCell>
                <GridCell width="1-1">
                    <Table headers={this.state.selectedLoadSummaryHeaders}
                           data={[this.props.selectedLoadDetailsElem]}>
                    </Table>
                </GridCell>
                <GridCell width="1-1">{super.translate("Dimension Details")}</GridCell>
                <GridCell width="1-1">
                    <Table headers={this.state.headers} actions={this.state.actions}
                           insertion={this.state.inlineEditForm} data={this.props.selectedLoadDetailsElem.dimensionDetailsList}
                           footers={this.state.footers}
                           hover={false}>
                    </Table>
                </GridCell>
            </Grid>

        );
    }
}

DimensionDetailsList.contextTypes = {
    translator: React.PropTypes.object
};
