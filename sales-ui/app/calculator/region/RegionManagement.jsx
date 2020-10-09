import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Checkbox} from "susam-components/basic";

import {SalesPriceService, KartoteksService} from '../../services';
import {RegionList} from './RegionList';
import {RegionForm} from './RegionForm';
import {RegionExtraPrice} from './RegionExtraPrice';

export class RegionManagement extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        KartoteksService.getCountries().then(response => {
            this.setState({allCountries: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
        this.listRegionsAndPostalCode();
    }

    listRegionsAndPostalCode(){
        axios.all([
            SalesPriceService.getPostalCodes(),
            SalesPriceService.getRegions(),
            SalesPriceService.getCountries()
        ]).then(axios.spread((postalCodes, regions, countries) => {
            let regionAndPostalCodes = [];

            countries.data.forEach(country => {
                let filteredRegions = _.filter(regions.data, item => item.country.id == country.id);
                if(filteredRegions.length > 0){
                    filteredRegions.forEach(region => {
                        let filteredPostalCodes = _.filter(postalCodes.data, item => item.region.id == region.id);
                        regionAndPostalCodes.push({
                            _key: uuid.v4(),
                            country: country,
                            regionId: region.id,
                            regionName: region.name,
                            regionMessage: region.message,
                            separatedPostalCodes: filteredPostalCodes.map(item => item.postalCode).join(",")
                        })
                    })
                }
            });

            this.setState({regions: regionAndPostalCodes, countries: _.sortBy(countries.data, ["name"])});
            
        })).catch((error) => {
            Notify.showError(error);
        });
    }
    updateRegion(value){
        this.setState({region: value});
    }
    updateCountry(item){
        this.setState({selectedCountry: item})
    }
    handleCountryAddClick(){
        if(!this.state.selectedCountry){
            Notify.showError("Please select a country from list");
            return;
        }
        let country = {
            id: this.state.selectedCountry.id,
            code: this.state.selectedCountry.iso,
            name: this.state.selectedCountry.countryName
        };
        SalesPriceService.addCountry(country).then(response => {
            Notify.showSuccess("Country added");
            this.listRegionsAndPostalCode();
        }).catch(error => {
            Notify.showError(error);
        })
    }
    handleCreateNewRegion(country){
        this.setState({region: {country: country}});
    }
    handleEditClick(item) {
        this.setState({region: item});
    }
    handleDeleteClick(item){
        UIkit.modal.confirm("All postal codes bound to this region will be deleted, Are you sure?",
            () => this.deleteRegion(item)
        );

    }
    deleteRegion(item){
        SalesPriceService.deleteRegion(item.regionId).then(response => {
            Notify.showSuccess("Region deleted");
            this.listRegionsAndPostalCode();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleSaveRegionClick(){
        SalesPriceService.saveRegion(this.state.region).then(response => {
            Notify.showSuccess("Region saved");
            let region = _.cloneDeep(this.state.region);
            region.regionId = response.data.id;
            this.setState({region: region});
            this.listRegionsAndPostalCode();
        }).catch(error => {
            Notify.showError(error);
        });
    }


    render(){

        return(
            <div>
                <PageHeader title="Region Management" />
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-2" noMargin = {true}>
                            <Grid>
                                <GridCell width="4-5">
                                    <DropDown label="Country" options = {this.state.allCountries}
                                              value = {this.state.selectedCountry} labelField="countryName" valueField="id"
                                              onchange = {(item) => this.updateCountry(item)} />
                                </GridCell>
                                <GridCell width="1-5">
                                    <div className="uk-margin-top">
                                        <Button label="add" size="small" style="success" onclick = {() => {this.handleCountryAddClick()}} />
                                    </div>
                                </GridCell>
                                <GridCell width="1-1">
                                    <RegionList countries = {this.state.countries}
                                                regions = {this.state.regions}
                                                selectedRegion = {this.state.region}
                                                onCreate = {(country) => this.handleCreateNewRegion(country)}
                                                onEdit = {(region) => this.handleEditClick(region)}
                                                onDelete = {(region) => this.handleDeleteClick(region)}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2" noMargin = {true}>
                            <Grid>
                                <GridCell width = "1-1">
                                    <RegionForm region = {this.state.region}
                                              onChange = {(value) => this.updateRegion(value)}
                                              onSave = {() => this.handleSaveRegionClick()}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }

}