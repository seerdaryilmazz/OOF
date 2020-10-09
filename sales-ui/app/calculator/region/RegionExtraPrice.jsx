import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import uuid from 'uuid';
import PropTypes from 'prop-types';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Span, Form} from "susam-components/basic";
import {NumericInput} from 'susam-components/advanced';
import * as DataTable from 'susam-components/datatable';

import {SalesPriceService} from "../../services";
import {PriceTable} from "../price/PriceTable";

export class RegionExtraPrice extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {extraPrice: {}};
    }

    componentDidMount(){
        if(this.props.region){
            this.listExtraPrices(this.props.region.regionId);
            this.listExtraApplicationTypes();
        }
    }
    componentWillReceiveProps(nextProps){

        if(nextProps.region && this.props.region && nextProps.region.regionId !== this.props.region.regionId){
            this.listExtraPrices(nextProps.region.regionId);
            this.setState({extraPrice: {}});
        }
    }

    listExtraApplicationTypes(){
        SalesPriceService.getExtraApplicationTypes().then(response => {
            this.setState({extraApplicationTypes: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }

    listExtraPrices(regionId){
        SalesPriceService.getExtraPricesForRegion(regionId).then(response => {
            this.setState({extraPrices: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }

    handleSave(){
        if(!this.form.validate()){
            return;
        }
        SalesPriceService.saveExtraPriceForRegion(this.props.region.regionId, this.state.extraPrice).then(response => {
            Notify.showSuccess("Extra price saved");
            this.listExtraPrices(this.props.region.regionId);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleDeleteClick(item){
        UIkit.modal.confirm("Are you sure ?", () => this.handleDelete(item));
    }
    handleDelete(item){
        SalesPriceService.deleteRegionExtraPrice(this.props.region.regionId, item.id).then(response => {
            Notify.showSuccess("Extra price deleted");
            this.listExtraPrices(this.props.region.regionId);
        }).catch(error => {
            Notify.showError(error);
        })
    }

    updateExtraPrice(key, value){
        let extraPrice = _.cloneDeep(this.state.extraPrice);
        extraPrice[key] = value;
        this.setState({extraPrice: extraPrice});
    }


    render(){
        if(!this.props.region){
            return null;
        }
        let postalCodes = this.props.region.separatedPostalCodes.split(",")
            .map(postalCode => {
                return {
                    id: postalCode.trim(),
                    name: postalCode
                }
            });
        return (
            <Grid>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-4">
                                <DropDown label="Applied At" options = {this.state.extraApplicationTypes} required = {true}
                                           value = {this.state.extraPrice.appliedAt} translate = {true}
                                           onchange = {(value) => this.updateExtraPrice("appliedAt", value ? value.id : null)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown label="Postal Code" options = {postalCodes} required = {true}
                                          value = {this.state.extraPrice.postalCode}
                                          onchange = {(value) => this.updateExtraPrice("postalCode", value ? value.id : null)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <NumericInput digits="2" digitsOptional={true} size="mini-small" required = {true}
                                              value = {this.state.extraPrice.price}
                                              onchange = {(value) => this.updateExtraPrice("price", value)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <div className="uk-margin-top">
                                    <Button label="add price" style="success" size="small" onclick = {() => this.handleSave()} />
                                </div>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>

                <GridCell width="1-1">
                    <DataTable.Table data={this.state.extraPrices}>
                        <DataTable.Text header="Applied At" width="20" reader = {new TranslatingReader(this.context.translator)}/>
                        <DataTable.Text field="postalCode" header="Postal Code" width="20"/>
                        <DataTable.Text field="price" header="Price" width="20"/>
                        <DataTable.ActionColumn >
                            <DataTable.ActionWrapper track="onclick"
                                                     onaction={(item) => {this.handleDeleteClick(item)}}>
                                <Button label="delete" flat={true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }

}
RegionExtraPrice.contextTypes = {
    translator: PropTypes.object
};
class TranslatingReader{
    constructor(translator){
        this.translator = translator;
    }
    readCellValue(row) {
        return this.translator.translate(row.appliedAt);
    }
    readSortValue(row) {
        return this.readCellValue(row);
    }
}
