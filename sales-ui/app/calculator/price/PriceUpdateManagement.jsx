import _ from "lodash";
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Modal, CardHeader, PageHeader, LoaderWrapper, Loader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Checkbox} from "susam-components/basic";
import {FileInput} from 'susam-components/advanced';

import {SalesPriceService} from '../../services';
import {PriceTableForm} from './PriceTableForm';
import {PriceTable} from './PriceTable';

export class PriceUpdateManagement extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        SalesPriceService.getCountries().then(response => {
            this.setState({countries: _.sortBy(response.data, ["name"])});
        }).catch(error => {
            Notify.showError(error);
        });
        // SalesPriceService.getDiscountTypes().then(response => {
        //     this.setState({discountTypes: response.data})
        // }).catch(error => {
        //     Notify.showError(error);
        // })
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
        if(key=="fromCountry"){
            this.getFromCountryRegions();
        }
        if(key=="toCountry"){
            this.getToCountryRegions();
        }
    }

    downloadPriceTable(filename){
        SalesPriceService.downloadPriceTableTemplate(filename).then(response=>{
            const link = document.createElement("a");
            link.href = `/sales-price-service/price-table/downloadPriceTableTemplate?filename=${filename}`;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            this.setState({excelCreationInProgress: false})
        }).catch(error=>{
            if(error.response.status === 404){
                setTimeout(()=>this.downloadPriceTable(filename), 5000);
            } else {
                this.setState({excelCreationInProgress: false});
                Notify.showError(error);
            }

        })
    }

    downloadTemplate(priceTable){
        SalesPriceService.generatePriceTableTemplate(priceTable).then(response => {
            setTimeout(()=>this.downloadPriceTable(response.data), 2000);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleDownload(){
        this.setState({excelCreationInProgress:true});
        let params={};
        let state=this.state;

        if(state.fromCountry){
            params.fromCountryId=state.fromCountry.id
        }
        if(state.toCountry){
            params.toCountryId=state.toCountry.id
        }
        if(state.fromRegion){
            params.fromRegionId=state.fromRegion.id;
        }
        if(state.toRegion){
            params.toRegionId=state.toRegion.id;
        }
        SalesPriceService.findPriceTablesForExcel(params).then(response=>{
            if(_.isEmpty(response.data)){
                Notify.showError("There is no price table found according to the criteria");
                this.setState({excelCreationInProgress:false});
                return false;
            }
            this.downloadTemplate(response.data);
        }).catch(error => {
            Notify.showError(error);
            this.setState({excelCreationInProgress:false});
        });
    }

    openExcelUploadModal() {
        this.excelUploadModal.open();
    }

    closeExcelUploadModal(){
        this.excelUploadModal.close();
    }

    renderLoader(){
        let title;
        if(this.state.excelUploadInProgress){
            title="Processing file...Please wait.";
            return(
                <Loader size="L" title={title} />
            )
        }else if(this.state.excelCreationInProgress){
            title="Creating file...Please wait.";
            return(
                <Loader size="L" title={title} />
            )
        }
        else return null;
    }

    renderExcelUploadModal() {

        let content;

        if (this.state.excelUploadInProgress) {
            content = this.renderLoader();
        } else {
            content = (
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <PageHeader title="Upload An Excel File"/>
                    </GridCell>
                    <GridCell width="1-1">
                        <FileInput onchange={(input) => this.handleExcelFileSelect(input[0])}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="Cancel" waves={true} onclick={() => this.closeExcelUploadModal()}/>
                        </div>
                    </GridCell>
                </Grid>
            );
        }

        return (
            <Modal ref={(c) => this.excelUploadModal = c}
                   large={false}>
                {content}
            </Modal>
        );
    }

    handleExcelFileSelect(file) {
        if (file) {
            this.setState({excelUploadInProgress: true}, () => {
                let data = new FormData();
                data.append("file", file);

                SalesPriceService.uploadPriceTableTemplate(data).then(response=>{
                    this.setState({excelUploadInProgress: false});
                    this.closeExcelUploadModal();
                    Notify.showSuccess("Price Tables successfully updated");
                }).catch(error => {
                    this.setState({excelUploadInProgress: false});
                    Notify.showError(error);
                });

            });
        }
    }

    getToCountryRegions(){
        if(this.state.toCountry){
            SalesPriceService.getRegionsOfCountry(this.state.toCountry.id).then(response=>{
                if(response.data.length == 0){
                    Notify.showError("Selected to country does not have a region");
                    return;
                }
                this.setState({toCountryRegions:response.data});
            }).catch((error) => {
                Notify.showError(error);
                console.log(error);
            });
        }else{
            this.setState({toCountryRegions:undefined, toRegion:undefined});
        }
    }

    getFromCountryRegions(){
        if(this.state.fromCountry){
            SalesPriceService.getRegionsOfCountry(this.state.fromCountry.id).then(response=>{
                if(response.data.length == 0){
                    Notify.showError("Selected from country does not have a region");
                    return;
                }
                this.setState({fromCountryRegions:response.data});
            }).catch((error) => {
                Notify.showError(error);
                console.log(error);
            });
        }else{
            this.setState({fromCountryRegions:undefined, fromRegion:undefined});
        }
    }

    render(){
        return(
            <div>
                <PageHeader title="Price Update Management" />
                <Card>
                    <Grid>
                        <GridCell width="1-4">
                            <DropDown label="From Country" options = {this.state.countries}
                                      value = {this.state.fromCountry}
                                      translate={true}
                                      postTranslationCaseConverter={1}
                                      onchange = {(item) => this.updateState("fromCountry", item)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <DropDown label="From Region" options = {this.state.fromCountryRegions}
                                      value = {this.state.fromRegion}
                                      translate={true}
                                      onchange = {(item) => this.updateState("fromRegion", item)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <DropDown label="To Country" options = {this.state.countries}
                                      value = {this.state.toCountry}
                                      translate={true}
                                      postTranslationCaseConverter={1}
                                      onchange = {(item) => this.updateState("toCountry", item)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <DropDown label="To Region" options = {this.state.toCountryRegions}
                                      value = {this.state.toRegion}
                                      translate={true}
                                      onchange = {(item) => this.updateState("toRegion", item)}/>
                        </GridCell>
                        <GridCell width="8-10">
                        </GridCell>
                        <GridCell width="2-10">
                            <Grid collapse={true}>
                                <GridCell width="1-2">
                                    <div className="uk-margin-top">
                                        <Button label="Download" size="small" style="success" onclick = {() => {this.handleDownload()}} />
                                    </div>
                                </GridCell>
                                <GridCell width="1-2">
                                    <div className="uk-margin-top">
                                        <Button label="Upload" size="small" style="primary" onclick = {() => {this.openExcelUploadModal()}} />
                                    </div>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
                {this.renderLoader()}
                <Grid>
                    {this.renderExcelUploadModal()}
                </Grid>
            </div>
        )
    }

}