import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import {Button, Notify} from "susam-components/basic";
import {Card, CardHeader, Grid, GridCell, Modal} from 'susam-components/layout';
import * as DataTable from 'susam-components/datatable';
import {PricingCustomsOffice} from "./PricingCustomsOffice";
import {SalesPriceService} from "../services";

export class PricingCustomsOfficeList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state= {};
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    componentDidMount(){
        this.getPricingCustomsOffices();
    }

    getPricingCustomsOffices(){
        SalesPriceService.listPricingCustomsOffices().then((response) => {
            this.setState({pricingCustomsOffices: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }

    addPricingCustomsOffice(){
        if(this.pricingCustomsOfficeForm.validate()){
            let pricingCustomsOffices = _.cloneDeep(this.state.pricingCustomsOffices);
            if(!pricingCustomsOffices){
                pricingCustomsOffices = [];
            }
            SalesPriceService.savePricingCustomsOffice(this.state.pricingCustomsOffice).then(response => {
                pricingCustomsOffices.push(response.data);
                this.setState({pricingCustomsOffices: pricingCustomsOffices, pricingCustomsOffice: undefined},
                    ()=>this.pricingCustomsOfficeModal.close());
                Notify.showSuccess("Pricing customs offices saved successfully");
            }).catch(error => {
                console.log(error);
                Notify.showError(error);
            })
        }
    }

    openPricingCustomsOfficeForm(pricingCustomsOffice){
        let state = _.cloneDeep(this.state);
        state.pricingCustomsOffice = pricingCustomsOffice;
        this.setState(state, () => {this.pricingCustomsOfficeModal.open()});

    }

    removePricingCustomsOffice(data){
        Notify.confirm("Are you sure?", () => {
            let pricingCustomsOffices = _.cloneDeep(this.state.pricingCustomsOffices);
            if(pricingCustomsOffices){
                const index = pricingCustomsOffices.findIndex(pricingCustomsOffice => pricingCustomsOffice.id === data.id);
                if (index !== -1) {
                    SalesPriceService.deletePricingCustomsOffice(data).then(response => {
                        pricingCustomsOffices.splice(index, 1);
                        this.setState({pricingCustomsOffices: pricingCustomsOffices, pricingCustomsOffice: undefined},
                            () => Notify.showSuccess("Pricing customs office removed successfully"));
                    }).catch(error => {
                        console.log(error);
                        Notify.showError(error);
                    })
                }
            }
        });
    }

    renderDataTable(){
        return (
            <GridCell width="1-2" margin="small">
                <DataTable.Table data={this.state.pricingCustomsOffices} sortable={true}>
                    <DataTable.Text field="customsOffice.name" header="Customs Office Name" width="100" sortable = {true}/>
                    <DataTable.ActionColumn>
                        <DataTable.ActionWrapper key="deletePricingCustomsOffice" track="onclick"
                                                 onaction = {(data) => this.removePricingCustomsOffice(data)}>
                            <Button label="DELETE" flat={true} style="danger" size="small"/>
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                </DataTable.Table>
            </GridCell>
        );
    }

    renderPricingCustomsOfficeForm(){
        return(
            <Modal ref={(c) => this.pricingCustomsOfficeModal = c}
                   closeOnBackgroundClicked={false}
                   small={true} actions={[{label: "SAVE", action: () => {this.addPricingCustomsOffice()}},
                {label: "CLOSE", action: () => this.pricingCustomsOfficeModal.close()}]}>
                {this.renderPricingCustomsOffice()}
            </Modal>
        );
    }

    renderPricingCustomsOffice(){
        let currentCustomsOffices = [];
        if(!_.isEmpty(this.state.pricingCustomsOffices)){
            currentCustomsOffices = this.state.pricingCustomsOffices.map(pricingCustomsOffice => pricingCustomsOffice.customsOffice);
        }
        return(
            <PricingCustomsOffice ref={(c) => this.pricingCustomsOfficeForm = c}
                                  pricingCustomsOffice = {this.state.pricingCustomsOffice || undefined}
                                  currentCustomsOffices = {currentCustomsOffices}
                                  onChange={(value) => this.updateState("pricingCustomsOffice", value)}/>
        );
    }

    renderNewPricingCustomsOfficeButton(){
        return(
            <GridCell width="1-6">
                <div className="uk-align-left">
                    <Button label="Add" style = "success" size="small"
                            onclick = {() => this.openPricingCustomsOfficeForm()}/>
                </div>
            </GridCell>
        );
    }

    render() {
        return (
            <Card>
                <CardHeader title="Calculator Enabled Customs Offices"/>
                <Grid>
                    {this.renderDataTable()}
                    {this.renderNewPricingCustomsOfficeButton()}

                </Grid >
                {this.renderPricingCustomsOfficeForm()}
            </Card>
        );
    }

}