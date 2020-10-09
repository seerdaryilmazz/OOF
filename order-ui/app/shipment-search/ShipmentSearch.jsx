import React from "react";
import {Grid, GridCell, PageHeader, Modal} from "susam-components/layout";
import {ShipmentFilter} from "./ShipmentFilter";
import {ShipmentSearchResults} from "./ShipmentSearchResults";
import {OrderService} from "../services/OrderService";
import {Notify} from "susam-components/basic";
import _ from "lodash";
import {ShipmentSearchSelectedFilters} from "./ShipmentSearchSelectedFilters";
import {SavedSearchService} from "../services";
import {OrderPagePreview} from "../preview/OrderPagePreview";
import {ShipmentPlanPreview} from '../preview/ShipmentPlanPreview';
import {ShipmentTransportHistoryModal} from "../planning/ShipmentTransportHistoryModal";
import {ShipmentBarcodeDetails} from "./ShipmentBarcodeDetails";

export class ShipmentSearch extends React.Component {

    constructor(props) {
        super(props);
        this.aggregationBucketSizeIncrement = 3; // # of bucket items to add at every see more click
        this.state = {
            config: this.getInitialConfig(),
            savedSearches: [],
            selectedSavedSearch: null,
            selectedShipmentDocument: null,
            selectedTransportOrder: null,
        };
        this.savedConfigProps = [
            'aggregationFilters',
            'rangeFilters',
            'sorts',
            'group',
            'matchFilters'];
        this.init();
        this.loadMySavedSearches();
        this.search();
    }

    onPreviewShipment(shipmentDocument) {
        OrderService.getTransportOrder(shipmentDocument.transportOrderId).then(response => {
            this.setState({selectedShipmentDocument: shipmentDocument, selectedTransportOrder: response.data});
            this.orderPagePreview.openPreviewModal();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    onPreviewPlan(shipmentDocument) {
        this.setState({selectedShipmentDocument: shipmentDocument}, () => {
            this.planPreviewModal.openPreviewModal();
        });
    }

    onEditShipment(shipmentDocument) {
        window.open("/ui/order/order-page?orderId=" + shipmentDocument.transportOrderId);
    }
    onViewBarcodes(shipmentDocument){
        this.setState({selectedShipmentDocument: shipmentDocument});
        setTimeout(() => this.barcodeDetailsModal.open(), 500);
    }

    onOpenShipmentTransportHistoryModal(shipmentDocument) {
        if (shipmentDocument.planningStatus == "Not Planned") {
            Notify.showError("This shipment is not planned yet!");
        } else {
            this.shipmentTransportHistoryModal.openShipmentTransportHistoryModal(shipmentDocument.id);
        }
    }

    getInitialConfig() {
        return {
            page: 1, // Current page to display
            size: 100, // # of items to display at each page (if grouping enabled, # of groups)
            aggregationFilters: [{bucketName: "Status", values: ["CONFIRMED", "CREATED", "PLANNED", "COLLECTED"]}], // Multi select aggregation filters
            bucketSizes: {}, // Buckets sizes, i.e. incremented by aggregationBucketSizeIncrement at each see more click
            rangeFilters: [], // Range filters
            sorts: [], // Sorts
            aggregationBucketSize: 3, // Bucket size for multi select aggregation filters
            groupBucketSize: 10, // # of items to display at each group, if grouping enabled,
            group: null,
            matchFilters: [] //Match filters
        }
    }

    loadMySavedSearches(selectedSavedSearch, clearSelected) {
        SavedSearchService.getMySavedSearches().then(response => {
            if (selectedSavedSearch) {
                this.setState({savedSearches: response.data, selectedSavedSearch: selectedSavedSearch});
            } else if (clearSelected) {
                this.setState({savedSearches: response.data, selectedSavedSearch: null});
            } else {
                this.setState({savedSearches: response.data});
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updateSelectedSavedSearch() {
        let data = {
            id: this.state.selectedSavedSearch.id,
            name: this.state.selectedSavedSearch.name,
            filter: JSON.stringify(_.pick(this.state.config, this.savedConfigProps))
        };

        SavedSearchService.updateMySavedSearch(this.state.selectedSavedSearch.id, data).then(response => {
            this.loadMySavedSearches(data);
            Notify.showSuccess("Search updated");
        }).catch(error => {
            Notify.showError(error);
        });
    }

    addSavedSearch(name) {
        let data = {
            name: name,
            filter: JSON.stringify(_.pick(this.state.config, this.savedConfigProps))
        };

        SavedSearchService.addMySavedSearch(data).then(response => {
            this.loadMySavedSearches(response.data);
            Notify.showSuccess("Search added");
        }).catch(error => {
            Notify.showError(error);
        });
    }

    deleteSelectedSavedSearch() {
        SavedSearchService.deleteMySavedSearch(this.state.selectedSavedSearch.id).then(response => {
            this.loadMySavedSearches(null, true);
            this.refresh(this.getInitialConfig(), 1, true);
            Notify.showSuccess("Filter deleted");
        }).catch(error => {
            Notify.showError(error);
        });
    }

    onSavedSearchChange(savedSearch) {
        let filterToApply = savedSearch ? JSON.parse(savedSearch.filter) : this.getInitialConfig();
        let config = _.cloneDeep(this.state.config);
        _.assign(config, filterToApply);
        this.refresh(config, 1, true, savedSearch ? savedSearch : {});
    }

    search(config, scrollToTop) {
        let searchConfig = config ? config : this.state.config;
        OrderService.shipmentSearch(searchConfig).then(response => {
            this.setState({searchResults: response.data, config: searchConfig});
            if (scrollToTop) {
                window.scrollTo(0, 0);
            }
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    changePage(page) {
        let config = _.cloneDeep(this.state.config);
        this.refresh(config, page, true);
    }

    addAggregationFilter(bucketName, value) {
        let config = _.cloneDeep(this.state.config);

        let found = false;
        for (let i = 0; i < config.aggregationFilters.length; i++) {
            if (config.aggregationFilters[i].bucketName == bucketName) {
                config.aggregationFilters[i].values.push(value);
                found = true;
            }
        }

        if (!found) {
            let values = [];
            values.push(value);
            config.aggregationFilters.push({bucketName: bucketName, values: values});
        }

        config.page = 1;
        this.search(config, false);
    }

    removeAggregationFilter(bucketName, value) {
        let config = _.cloneDeep(this.state.config);

        for (let i = 0; i < config.aggregationFilters.length; i++) {
            if (config.aggregationFilters[i].bucketName == bucketName) {
                _.remove(config.aggregationFilters[i].values, v => {
                    return v == value;
                });

                if (config.aggregationFilters[i].values.length == 0) {
                    config.aggregationFilters.splice(i, 1);
                }
            }
        }

        config.page = 1;
        this.search(config, false);
    }

    removeAllFilters() {
        let config = _.cloneDeep(this.state.config);

        config.aggregationFilters = [];
        config.rangeFilters = [];
        config.matchFilters = [];

        config.page = 1;
        this.search(config, false);
    }

    onSeeMore(bucketName) {
        let config = _.cloneDeep(this.state.config);
        if (config.bucketSizes[bucketName]) {
            config.bucketSizes[bucketName] += this.aggregationBucketSizeIncrement;
        } else {
            let currentBucketSize = null;
            for (let i = 0; i < this.state.searchResults.buckets.length; i++) {
                if (this.state.searchResults.buckets[i].name == bucketName) {
                    currentBucketSize = this.state.searchResults.buckets[i].items.length;
                }
            }

            if (currentBucketSize) {
                config.bucketSizes[bucketName] = currentBucketSize + this.aggregationBucketSizeIncrement;
            }
        }

        this.refresh(config, config.page, false);
    }

    changeRangeFilter(rangeFilter) {
        if (!rangeFilter.gte && !rangeFilter.lte) {
            this.removeRangeFilter(rangeFilter.name);
            return;
        }

        let config = _.cloneDeep(this.state.config);

        let foundIndex = _.findIndex(config.rangeFilters, rf => {
            return rf.name == rangeFilter.name
        });

        if (foundIndex >= 0) {
            config.rangeFilters[foundIndex] = rangeFilter;
        } else {
            config.rangeFilters.push(rangeFilter);
        }

        config.page = 1;
        this.search(config, false);
    }

    removeRangeFilter(name) {
        let config = _.cloneDeep(this.state.config);

        _.remove(config.rangeFilters, rf => {
            return rf.name == name;
        });

        config.page = 1;
        this.search(config, false);
    }

    changeMatchFilter(matchFilter) {
        if (!matchFilter.val) {
            this.removeMatchFilter(matchFilter.name);
            return;
        }

        let config = _.cloneDeep(this.state.config);

        let foundIndex = _.findIndex(config.matchFilters, mf => {
            return mf.name == matchFilter.name
        });

        if (foundIndex >= 0) {
            config.matchFilters[foundIndex] = matchFilter;
        } else {
            config.matchFilters.push(matchFilter);
        }

        config.page = 1;
        this.search(config, false);
    }

    removeMatchFilter(name) {
        let config = _.cloneDeep(this.state.config);

        _.remove(config.matchFilters, mf => {
            return mf.name == name;
        });
        config.page = 1;
        this.search(config, false);
    }

    onSortChange(name, direction) {
        let config = _.cloneDeep(this.state.config);

        let foundIndex = _.findIndex(config.sorts, s => {
            return s.name == name
        });

        if (foundIndex >= 0) {
            config.sorts[foundIndex].direction = direction;
        } else {
            config.sorts.push({name: name, direction: direction})
        }

        config.page = 1;
        this.search(config, false);
    }

    onSortRemove(name) {
        let config = _.cloneDeep(this.state.config);

        _.remove(config.sorts, s => {
            return s.name == name;
        });

        config.page = 1;
        this.search(config, false);
    }

    onSortRemoveAll() {
        let config = _.cloneDeep(this.state.config);
        config.sorts = [];
        config.page = 1;
        this.search(config, false);
    }

    refresh(config, page, scrollToTop, selectedSavedSearch) {
        config.page = page;
        if (selectedSavedSearch) {
            this.setState({
                config: config,
                selectedSavedSearch: _.isEmpty(selectedSavedSearch) ? null : selectedSavedSearch
            });
        } else {
            this.setState({config: config});
        }
        this.search(config, scrollToTop);
    }

    onGroupChange(group) {
        let config = _.cloneDeep(this.state.config);
        config.group = group;
        config.page = 1;
        this.search(config, false);
    }

    toggleShipmentFilter(e) {
        $('#style_switcher').toggleClass('switcher_active');
    }

    isMouseIn(elem) {
        let bounds = elem.getBoundingClientRect();
        let x = window.event.clientX;
        let y = window.event.clientY;
        return x > bounds.left && x < bounds.right && y > bounds.top && y < bounds.bottom;
    }

    init() {
        $document.on('click', e => {
            let switcher = $('#style_switcher');
            let switcherToggle = $('#style_switcher_toggle');
            if (switcher.hasClass('switcher_active')) {
                if (!this.isMouseIn(switcher.get(0)) && !this.isMouseIn(switcherToggle.get(0))) {
                    switcher.removeClass('switcher_active');
                }
            }
        });
    }

    render() {
        return (
            <div>
                <PageHeader title="Shipment Search"  translate={true}/>
                <Grid>
                    <GridCell width="1-1" noMargin="true">
                        <ShipmentSearchSelectedFilters
                            searchResults={this.state.searchResults}
                            removeAggregationFilter={(bucketName, value) => this.removeAggregationFilter(bucketName, value)}
                            removeAllFilters={() => this.removeAllFilters()}
                            removeRangeFilter={(name) => this.removeRangeFilter(name)}
                            removeMatchFilter={(name) => this.removeMatchFilter(name)}
                        />
                    </GridCell>
                    <GridCell width="1-1" noMargin="true">
                        <ShipmentSearchResults
                            searchResults={this.state.searchResults}
                            onPageChange={(page)=>this.changePage(page)}
                            onSortChange={(name, direction) => this.onSortChange(name, direction)}
                            onSortRemove={(name) => this.onSortRemove(name)}
                            onSortRemoveAll={() => this.onSortRemoveAll()}
                            onGroupChange={(name) => this.onGroupChange(name)}
                            onPreviewShipment={(shipmentDocument) => this.onPreviewShipment(shipmentDocument)}
                            onEditShipment={(shipmentDocument) => this.onEditShipment(shipmentDocument)}
                            onViewBarcodes={(shipmentDocument) => this.onViewBarcodes(shipmentDocument)}
                            onOpenShipmentTransportHistoryModal={(shipmentDocument) => this.onOpenShipmentTransportHistoryModal(shipmentDocument)}
                            onPreviewPlan = {(shipmentDocument) => this.onPreviewPlan(shipmentDocument)}/>
                    </GridCell>
                    <GridCell width="1-1" noMargin="true">
                        <Modal ref = {(c) => this.barcodeDetailsModal = c} closeOtherOpenModals = {false} large = {true} title="Barcode Details"
                               actions = {[{label:"close", action:() => this.barcodeDetailsModal.close()}]}>
                            <ShipmentBarcodeDetails shipmentId = {this.state.selectedShipmentDocument ? this.state.selectedShipmentDocument.id : ""} />
                        </Modal>
                    </GridCell>
                </Grid>
                <div id="style_switcher">
                    <div id="style_switcher_toggle" onClick={(e) => this.toggleShipmentFilter(e)}><i
                        className="material-icons">search</i></div>
                    <div className="uk-margin-medium-bottom">
                        <div className="shipmentFilter">
                            <ShipmentFilter
                                searchResults={this.state.searchResults}
                                addAggregationFilter={(bucketName, value) => this.addAggregationFilter(bucketName, value)}
                                removeAggregationFilter={(bucketName, value) => this.removeAggregationFilter(bucketName, value)}
                                onSeeMore={(bucketName) => this.onSeeMore(bucketName)}
                                changeRangeFilter={(rangeFilter) => this.changeRangeFilter(rangeFilter)}
                                rangeFilters={this.state.config.rangeFilters}
                                onSavedSearchChange={(savedSearch) => this.onSavedSearchChange(savedSearch)}
                                savedSearches={this.state.savedSearches}
                                selectedSavedSearch={this.state.selectedSavedSearch}
                                updateSelectedSavedSearch={() => this.updateSelectedSavedSearch()}
                                addSavedSearch={(name) => this.addSavedSearch(name)}
                                deleteSelectedSavedSearch={() => this.deleteSelectedSavedSearch()}
                                changeMatchFilter={(matchFilter) => this.changeMatchFilter(matchFilter)}
                                matchFilters={this.state.config.matchFilters}/>
                        </div>
                    </div>
                </div>
                <OrderPagePreview
                    ref={(c) => this.orderPagePreview = c}
                    hideButton={true} order={this.state.selectedTransportOrder}/>
                <ShipmentTransportHistoryModal ref={(c) => this.shipmentTransportHistoryModal = c}/>
                <ShipmentPlanPreview shipment = {this.state.selectedShipmentDocument} ref = {(c) => this.planPreviewModal = c}  />
            </div>
        );
    }
}