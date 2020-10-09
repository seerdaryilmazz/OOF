import React from 'react';

import {Form, DropDown, TextInput, Button} from 'susam-components/basic';
import {DateTime} from 'susam-components/advanced';
import {Table} from 'susam-components/table';

export default class OrderInfoDimensionDetailsTable extends React.Component{

    constructor(props){
        super(props);
        this.state = {};
    }
    componentWillMount(){
        this.loadTableDetails();
    }

    render(){

        let loadDetailsSingleData = this.props.loadDetailsSingleData;

        if(!loadDetailsSingleData) {
            return null;
        }

        return(
            <Table headers={this.state.headers} actions={this.state.actions} insertion={this.state.insertion} data={loadDetailsSingleData.dimensionDetails}>
                <Button label="Kapat" onclick={this.closeClicked}/>
            </Table>
        );

    }

    closeClicked = () => {

        let warningMessage = this.compareDimensionDetailsandLoadDetails();

        if (warningMessage != "") {
            UIkit.modal.confirm(warningMessage,
                () => this.closeThis());
        } else {
            this.closeThis();
        }

    }

    closeThis = () => {
        this.props.closeThis();
    }


    compareDimensionDetailsandLoadDetails = () => {

        let loadDetailsSingleData = this.props.loadDetailsSingleData;
        let dimensionDetails = loadDetailsSingleData.dimensionDetails;


        let totalAmount = 0;
        let totalGrossWeight = 0;
        let totalNeatWeight = 0;
        let totalVolume = 0;
        let totalLDM = 0;

        dimensionDetails.forEach(dimensionData => {

            totalAmount += +dimensionData.amount;
            totalGrossWeight += +(dimensionData.amount * dimensionData.grossweight);
            totalNeatWeight += +(dimensionData.amount * dimensionData.neatweight);
            totalVolume += +(dimensionData.amount * this.calculateVolumePerUnit(dimensionData.xdim, dimensionData.ydim, dimensionData.height));
            totalLDM += +(dimensionData.amount * this.calcualteLDMPerUnit(dimensionData.xdim, dimensionData.ydim, dimensionData.height));
        });

        let message1 = "";
        let message2 = ""
        if (loadDetailsSingleData.kap != totalAmount) {
            message1 += "  Kap miktarı: " + loadDetailsSingleData.kap + "<br/>";
            message2 += "  Kap miktarı: " + totalAmount + "<br/>";
        }
        if (loadDetailsSingleData.grossweight != totalGrossWeight) {
            message1 += "  Brüt Ağırlık: " + loadDetailsSingleData.grossweight + "<br/>";
            message2 += "  Brüt Ağırlık: " + totalGrossWeight + "<br/>";
        }
        if (loadDetailsSingleData.neatweight != totalNeatWeight) {
            message1 += "  Net Ağırlık: " + loadDetailsSingleData.neatweight + "<br/>";
            message2 += "  Net Ağırlık: " + totalNeatWeight + "<br/>";
        }
        if (loadDetailsSingleData.volume != totalVolume) {
            message1 += "  Hacim: " + loadDetailsSingleData.volume + "<br/>";
            message2 += "  Hacim: " + totalVolume + "<br/>";
        }
        if (loadDetailsSingleData.ldm != totalLDM) {
            message1 += "  LDM: " + loadDetailsSingleData.ldm + "<br/>";
            message2 += "  LDM: " + totalLDM + "<br/>";
        }

        let finalMessage = ""
        if (message1 != "" || message2 != "") {
            finalMessage =
                "<b>" + "Tutarsız Veri:" + "</b><br/></br>"
            + "Yük Detayları:" + "<br/>" + message1 + "<br/>"
            + "Ölçü Detayları:" + "<br/>" + message2 + "<br/>"
            + "Devam etmek istiyor musunuz?";
        }

        return finalMessage;


    }

    calculateVolumePerUnit =(xdim, ydim, height) => {
        return +(xdim * ydim * height);
    }

    calcualteLDMPerUnit =(xdim, ydim, height) => {
        return +(xdim * ydim * height);

    }

    rowAdd = (dimensionData) => {
        dimensionData.volume = +this.calculateVolumePerUnit(dimensionData.xdim, dimensionData.ydim, dimensionData.height);
        dimensionData.ldm = +this.calcualteLDMPerUnit(dimensionData.xdim, dimensionData.ydim, dimensionData.height);
        return true;
    }

    rowEdit = (dimensionData, oldDimensionData) => {
        dimensionData.volume = +this.calculateVolumePerUnit(dimensionData.xdim, dimensionData.ydim, dimensionData.height);
        dimensionData.ldm = +this.calcualteLDMPerUnit(dimensionData.xdim, dimensionData.ydim, dimensionData.height);
        return true;
    }

    rowDelete = (values) => {
        return true;
    }

    loadTableDetails = () => {


        let headers = [
            {
                name: "id",
                data: "id",
                hidden: true
            },
            {
                name: "Amount",
                data: "amount"
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

        this.setState({headers: headers});

        let insertion = {
            amount: [
                <TextInput required={true}/>
            ],
            ambalaj: [<TextInput required={true}/>],
            xdim: [<TextInput required={true}/>],
            ydim: [<TextInput required={true}/>],
            height: [<TextInput required={true}/>],
            grossweight: [<TextInput required={true}/>],
            neatweight: [<TextInput required={true}/>],
            istif: [<TextInput required={true}/>],
            articleno: [<TextInput required={true}/>],
            productnumber: [<TextInput required={true}/>]
        };

        this.setState({insertion: insertion});


        let actions = {
            rowEdit: {
                icon: "pencil-square",
                action: this.rowEdit,
                title: "edit"
            },
            rowDelete: {
                icon: "close",
                action: this.rowDelete,
                title: "remove",
                confirmation: "Are you sure you want to delete?"
            },
            rowAdd: this.rowAdd
        };

        this.setState({actions: actions});


    }

}