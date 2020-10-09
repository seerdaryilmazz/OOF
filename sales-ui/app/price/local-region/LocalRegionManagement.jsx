import * as axios from 'axios';
import React from 'react';
import { Button, DropDown, Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, Modal, PageHeader } from 'susam-components/layout';
import { KartoteksService, LocationService, PricingService } from '../../services';
import { Region } from '../common-region';
import { Subsidiary } from '../Subsidiary';
import { LocalRegionWarehouse } from './LocalRegionWarehouse';

const PATH = 'local-region';
export class LocalRegionManagement extends React.Component {
    state = {
        crossdocks: [],
        tariffs: [],
        lookup: {
            operations: []
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
        if (!_.isEqual(prevState.subsidiary, this.state.subsidiary) || !_.isEqual(prevState.crossdock, this.state.crossdock)) {
            this.listRegions();
        }
    }

    addWarehouse() {
        this.setState(prevState => {
            let { tariffs, crossdock } = prevState;
            if (0 > _.findIndex(tariffs, i => i.warehouse.id == crossdock.id)) {
                tariffs.push({ warehouse: crossdock, regions: [] });
            }
            prevState.tariffs = tariffs;
            return prevState
        });
    }

    retrieveLookups() {
        axios.all([
            PricingService.listLookups('operation')
        ]).then(axios.spread((operation) => {
            this.setState({
                lookup: {
                    operations: operation.data
                }
            });
        })).catch(error => Notify.showError(error));
    }

    adjustTariff(tariffs) {
        let warehouseRegions = _.groupBy(tariffs, i => i.warehouse.id);
        let warehouses = _.uniqWith(tariffs.map(i => i.warehouse), (x, y) => x.id === y.id);
        return warehouses.map(warehouse => ({ warehouse: warehouse, regions: warehouseRegions[warehouse.id] }));
    }

    listRegions(subsidiariy = this.state.subsidiary, crossdock = this.state.crossdock) {
        if(subsidiariy && crossdock){
            PricingService.query(PATH, subsidiariy.id, {WAREHOUSE: crossdock.id}).then(response => {
                this.setState({
                    tariffs: this.adjustTariff(response.data),
                });
            }).catch(error => Notify.showError(error));
        }
    }

    handleSubsidiaryChange(value) {
        this.setState({ subsidiary: value, crossdocks: [] })
        if (value) {
            KartoteksService.getCompany(value.defaultInvoiceCompany.id).then(response => {
                let query = {
                    country: response.data.country,
                }
                return LocationService.retriveWarehouse(query);
            }).then(response => {
                this.setState({ crossdocks: response.data });
            }).catch(error => Notify.showError(error));
        }
    }

    handleWarehouseChange(value) {
        this.setState({
            crossdock: value,
            country: value && value.establishment.address.country,
        });
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
                        <DropDown label="Warehouse"
                            options={this.state.crossdocks}
                            value={this.state.crossdock}
                            onchange={value => this.handleWarehouseChange(value)} />
                    </GridCell>
                    <GridCell width="1-5">
                        <Button label="Add" style="success" onclick={() => this.addWarehouse()} disabled={!this.state.crossdock} />
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell small="1-1">
                        <div data-uk-observe>
                            {this.state.tariffs.map((tariff, index) =>
                                <LocalRegionWarehouse key={index}
                                    country={this.state.country}
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