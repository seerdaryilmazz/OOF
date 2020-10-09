import * as axios from 'axios';
import React from 'react';
import { Button, DropDown, Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, Modal, PageHeader } from 'susam-components/layout';
import { CrmAccountService, KartoteksService, PricingService } from '../../services';
import { Region } from '../common-region';
import { Subsidiary } from '../Subsidiary';
import { ForeignRegionCountry } from './ForeignRegionCountry';

const PATH = 'foreign-region';
export class ForeignRegionManagement extends React.Component {
    state = {
        countries: [],
        tariffs: [],
        lookup: {
            operations: [],
            countries: []
        }
    };

    constructor(props) {
        super(props);
        this.retrieveLookups();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(prevState.subsidiary, this.state.subsidiary)) {
            UIkit.domObserve(`[data-uk-observe]`, function (element) { });
        }
        if (!_.isEqual(prevState.subsidiary, this.state.subsidiary) || !_.isEqual(prevState.country, this.state.country)) {
            this.listRegions();
        }
    }

    retrieveLookups() {
        axios.all([
            PricingService.listLookups('operation'),
            CrmAccountService.listCountries()
        ]).then(axios.spread((operation, countries) => {
            this.setState({
                lookup: {
                    operations: operation.data,
                    countries: countries.data
                }
            });
        })).catch(error => Notify.showError(error));
    }

    listRegions(subsidiariy = this.state.subsidiary, country = this.state.country) {
        if(subsidiariy && country){
            PricingService.query(PATH, subsidiariy.id, {COUNTRY: country.iso}).then(response => {
                this.setState({
                    tariffs: this.adjustTariff(response.data),
                });
            }).catch(error => Notify.showError(error));
        }
    }

    adjustTariff(tariffs) {
        let countryRegions = _.groupBy(tariffs, i => i.country.iso);
        let countries = _.uniqWith(tariffs.map(i => i.country), (x, y) => x.iso === y.iso);
        return countries.map(country => ({ country: country, regions: countryRegions[country.iso] }));
    }

    addCountry() {
        this.setState(prevState => {
            let { tariffs, country } = prevState;
            if (0 > _.findIndex(tariffs, i => i.country.iso == country.iso)) {
                tariffs.push({ country: country, regions: [] });
            }
            prevState.tariffs = tariffs;
            return prevState
        });
    }

    handleSubsidiaryChange(value) {
        this.setState({ subsidiary: value, tariffs: [] });
        if (value) {
            axios.all([
                KartoteksService.getCompany(value.defaultInvoiceCompany.id),
            ]).then(axios.spread((company) => {
                this.setState({
                    countries: _.reject(this.state.lookup.countries, i => i.iso === company.data.country.iso)
                });
            })).catch(error => Notify.showError(error));
        }
    }

    handleSaveRegion(region) {
        let saveCalls = null;
        if (_.isArray(region.operation)) {
            saveCalls = region.operation.map(operation => {
                let reg = _.cloneDeep(region);
                reg.operation = operation;
                return reg
            }).map(region => PricingService.save(PATH, region));
        } else {
            saveCalls = [PricingService.save(PATH, region)];
        }
        axios.all(saveCalls).then(axios.spread(() => {
            this.listRegions();
            this.regionModal.close()
            Notify.showSuccess("saved");
        })).catch(error => Notify.showError(error));
    }

    handleDeleteRegion(region) {
        PricingService.delete(PATH, region.id).then(response => {
            this.listRegions();
            Notify.showSuccess("deleted");
        }).catch(error => Notify.showError(error));
    }

    openRegionModal(region) {
        this.setState({ region: region }, () => this.regionModal.open());
    }

    render() {
        let { lookup } = this.state;
        return (<div>
            <PageHeader title="Region Management" />
            <Card>
                <Grid>
                    <GridCell width="2-5">
                        <Subsidiary label="Subsidiary" value={this.state.subsidiary} onchange={value => this.handleSubsidiaryChange(value)} />
                    </GridCell>
                    <GridCell width="2-5">
                        <DropDown label="Country"
                            options={this.state.countries}
                            value={this.state.country}
                            onchange={value => this.setState({ country: value })} />
                    </GridCell>
                    <GridCell width="1-5">
                        <Button label="Add" style="success" onclick={() => this.addCountry()} disabled={!this.state.country} />
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell small="1-1">
                        <div data-uk-observe>
                            {this.state.tariffs.map((tariff, index) =>
                                <ForeignRegionCountry key={index}
                                    subsidiary={this.state.subsidiary}
                                    tariff={tariff} lookup={lookup}
                                    onDeleteClick={region => this.handleDeleteRegion(region)}
                                    onClick={region => this.openRegionModal(region)} />)}
                        </div>
                    </GridCell>
                </Grid>
            </Card>
            <Modal ref={c => this.regionModal = c}
                closeOnBackgroundClicked={false}
                onclose={() => this.setState({ region: null })}>
                {this.state.region &&
                    <Region subsidiary={this.state.subsidiary}
                        region={this.state.region}
                        lookup={this.state.lookup}
                        onCancelClick={() => this.regionModal.close()}
                        onSaveClick={region => this.handleSaveRegion(region)} />}
            </Modal>
        </div>);
    }
}