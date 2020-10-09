import _ from "lodash";
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Chip } from "susam-components/advanced";
import { Button, DropDown, Notify } from "susam-components/basic";
import { Card, Grid, GridCell, PageHeader, Loader } from "susam-components/layout";
import { SavedSearchService } from "../services";
import { OrderService } from "../services/OrderService";
import { ShipmentFilters } from "./ShipmentFilters";
import { ShipmentsSearchResults } from "./ShipmentsSearchResults";

export class ShipmentsSearch extends TranslatingComponent {

    pageSize = 100;

    constructor(props) {
        super(props);
        this.aggregationBucketSizeIncrement = 3
        this.state = {
            config: this.getInitialConfig(),
            savedSearches: [],
            selectedSavedSearch: null,
        };
        this.savedConfigProps = [
            'aggregationFilters',
            'rangeFilters',
            'sorts',
            'group',
            'matchFilters'];
        this.groupByLabelHolder = {
            "customerName": "Customer",
            "sender.companyName": "Sender",
            "consignee.companyName": "Consignee",
            "sender.handlingLocationCountryCode": "Loading Country",
            "consignee.handlingLocationCountryCode": "Unloading Country"
        }
        this.groupByOptions = [
            { id: "customerName", name: "Customer" },
            { id: "sender.companyName", name: "Sender" },
            { id: "consignee.companyName", name: "Consignee" },
            { id: "sender.handlingLocationCountryCode", name: "Loading Country" },
            { id: "consignee.handlingLocationCountryCode", name: "Unloading Country" }
        ];
        this.sortByByOptions = [
            { name: "Ready Date", label: "Ready Date (Asc)", direction: "asc" },
            { name: "Ready Date", label: "Ready Date (Desc)", direction: "desc" },
            { name: "Requested Delivery Date", label: "RDD (Asc)", direction: "asc" },
            { name: "Requested Delivery Date", label: "RDD (Desc)", direction: "desc" },
        ];

        this.loadMySavedSearches();
        this.search();
    }

    componentDidMount() {
        window.addEventListener('resize', this.onWindowResize);
        this.onWindowResize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize);
    }

    onWindowResize = () => {
        let contentHeight = window.innerHeight - $("#header_main").height();
        this.calculateHeights(contentHeight);
    }

    handleScroll() {
        if (this.state.totalElements > this.state.shipments.length) {
            let config = _.cloneDeep(this.state.config);
            config.size += this.pageSize;
            this.search(config, false);
        } else if (!this.state.showAllLoadedNotify) {
            this.setState({ showAllLoadedNotify: true });
            Notify.showInformation("no more result");
        }
    }

    loadMySavedSearches(selectedSavedSearch, clearSelected) {
        SavedSearchService.getMySavedSearches().then(response => {
            if (selectedSavedSearch) {
                this.setState({ savedSearches: response.data, selectedSavedSearch: selectedSavedSearch });
            } else if (clearSelected) {
                this.setState({ savedSearches: response.data, selectedSavedSearch: null });
            } else {
                this.setState({ savedSearches: response.data });
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
        if (!this.state.searchIsBusy) {
            this.setState({ searchIsBusy: true });
            OrderService.shipmentsSearch(searchConfig).then(response => {
                this.setState({
                    shipments: response.data.shipments,
                    totalElements: response.data.totalElements,
                    totalPages: response.data.totalPages,
                    filter: response.data.filter,
                    config: searchConfig,
                    searchIsBusy: false,
                    showAllLoadedNotify: false
                });
                if (scrollToTop) {
                    window.scrollTo(0, 0);
                }
            }).catch(error => {
                console.log(error);
                Notify.showError(error);
            });

        }
    }

    getInitialConfig() {
        return {
            page: 1, // Current page to display
            size: this.pageSize, // # of items to display at each page (if grouping enabled, # of groups)
            // aggregationFilters: [], // Multi select aggregation filters
            aggregationFilters: [{ bucketName: "Status", values: ["CREATED"] }], // Multi select aggregation filters
            bucketSizes: { "Special": 8, "Service Type": 6 }, // Buckets sizes, i.e. incremented by aggregationBucketSizeIncrement at each see more click
            rangeFilters: [], // Range filters
            sorts: [], // Sorts
            groupSorts: [], // GroupSorts
            aggregationBucketSize: 3, // Bucket size for multi select aggregation filters
            groupBucketSize: 10, // # of items to display at each group, if grouping enabled,
            group: null,
            matchFilters: [] //Match filters
        }
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
            config.aggregationFilters.push({ bucketName: bucketName, values: values });
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

    onSeeMore(bucketName) {
        let config = _.cloneDeep(this.state.config);
        if (config.bucketSizes[bucketName]) {
            config.bucketSizes[bucketName] += this.aggregationBucketSizeIncrement;
        } else {
            let currentBucketSize = null;
            for (let i = 0; i < this.state.filter.buckets.length; i++) {
                if (this.state.filter.buckets[i].name == bucketName) {
                    currentBucketSize = this.state.filter.buckets[i].items.length;
                }
            }

            if (currentBucketSize) {
                config.bucketSizes[bucketName] = currentBucketSize + this.aggregationBucketSizeIncrement;
            }
        }

        this.refresh(config, config.page, false);
    }

    refresh(config, page, scrollToTop, selectedSavedSearch) {
        config.page = page;
        if (selectedSavedSearch) {
            this.setState({
                config: config,
                selectedSavedSearch: _.isEmpty(selectedSavedSearch) ? null : selectedSavedSearch
            });
        } else {
            this.setState({ config: config });
        }
        this.search(config, scrollToTop);
    }

    removeRangeFilter(name) {
        let config = _.cloneDeep(this.state.config);

        _.remove(config.rangeFilters, rf => {
            return rf.name == name;
        });

        config.page = 1;
        this.search(config, false);
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

    removeMatchFilter(name) {
        let config = _.cloneDeep(this.state.config);

        _.remove(config.matchFilters, mf => {
            return mf.name == name;
        });
        config.page = 1;
        this.search(config, false);
    }

    changeMatchFilter(matchFilter) {
        if (_.isNil(matchFilter.val)) {
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

    onGroupChange(value) {
        let config = _.cloneDeep(this.state.config);
        config.groupSorts = [];
        if (!_.isNil(value)) {
            value.forEach(item => config.groupSorts.push({ name: item.name, direction: "asc" }));
        }

        config.page = 1;
        this.search(config, false);
        this.setState({ groupBy: value });
    }

    onSortChange(value) {
        let config = _.cloneDeep(this.state.config);
        config.sorts = [];
        if (!_.isNil(value)) {
            let foundIndex = _.findIndex(config.sorts, s => {
                return s.name == value.name
            });

            if (foundIndex >= 0) {
                config.sorts[foundIndex].direction = direction;
            } else {
                config.sorts.push({
                    name: value.name,
                    direction: value.direction
                });
            }
        }

        config.page = 1;
        this.search(config, false);
        this.setState({ sortBy: value });
    }

    setDefaultFilters() {
        let config = _.cloneDeep(this.getInitialConfig());

        config.page = 1;
        this.search(config, false);
    }

    showDefaultFiltersButton() {
        let initFilter = this.getInitialConfig();
        return !_.isEqual(this.state.config.aggregationFilters, initFilter.aggregationFilters)
            || !_.isEqual(this.state.config.rangeFilters, initFilter.rangeFilters)
            || !_.isEqual(this.state.config.matchFilters, initFilter.matchFilters);
    }

    calculateHeights(contentHeight) {
        this.setState({
            filterHeight: contentHeight - 384,
            resultHeight: contentHeight - 212 -38
        });
    }

    render() {
        const filterHeight = this.state.filterHeight + "px";
        const resultHeight = this.state.resultHeight + "px";

        let groups = this.state.groupBy ? this.state.groupBy.map(item => item.groupBy ? item.groupBy : item.id) : null;

        let preloader = this.state.searchIsBusy && false ? <Loader size="S" /> : null;

        let defaultFiltersButton = this.showDefaultFiltersButton() ?
            <Button style="danger" label="Clear Filters" onclick={() => this.setDefaultFilters()} /> : null;

        return (
            <div>
                <div>
                    <Grid collapse={true}>
                        <GridCell width="1-1" style={{ position: "absolute", padding: "20px" }}>
                            <PageHeader title="Shipment Search"  translate={true} />
                        </GridCell>
                        <GridCell width="1-5" style={{ position: "absolute", top: "110px" }}>
                            <ShipmentFilters
                                height={filterHeight}
                                addAggregationFilter={(bucketName, value) => this.addAggregationFilter(bucketName, value)}
                                removeAggregationFilter={(bucketName, value) => this.removeAggregationFilter(bucketName, value)}
                                changeRangeFilter={(rangeFilter) => this.changeRangeFilter(rangeFilter)}
                                removeRangeFilter={(rangeFilter) => this.removeRangeFilter(rangeFilter.name)}
                                changeMatchFilter={(matchFilter) => this.changeMatchFilter(matchFilter)}
                                removeMatchFilter={(matchFilter) => this.removeMatchFilter(matchFilter.name)}
                                onSeeMore={(bucketName) => this.onSeeMore(bucketName)}
                                config={this.state.config}
                                filter={this.state.filter}
                                onSavedSearchChange={(savedSearch) => this.onSavedSearchChange(savedSearch)}
                                savedSearches={this.state.savedSearches}
                                selectedSavedSearch={this.state.selectedSavedSearch}
                                updateSelectedSavedSearch={() => this.updateSelectedSavedSearch()}
                                addSavedSearch={(name) => this.addSavedSearch(name)}
                                deleteSelectedSavedSearch={() => this.deleteSelectedSavedSearch()}
                            />
                        </GridCell>
                        <GridCell width="4-5" style={{ position: "absolute", left: "20%", top: "110px" }}>
                            <Card>
                                <Grid >
                                    <GridCell width="1-4">
                                        <Chip label="Group By" options={this.groupByOptions}
                                            valueField="name" labelField="name"
                                            onchange={(value) => this.onGroupChange(value)}
                                            value={this.state.groupBy} translate={true}
                                            hideSelectAll={true} />
                                    </GridCell>
                                    <GridCell width="1-4">
                                        <DropDown label="Sort By"
                                            translate={true}
                                            onchange={(value) => this.onSortChange(value)}
                                            value={this.state.sortBy}
                                            valueField="label"
                                            labelField="label"
                                            options={this.sortByByOptions} />
                                    </GridCell>
                                    <GridCell width="1-4">
                                    </GridCell>
                                    <GridCell width="1-4" style={{ textAlign: "right" }}>
                                        {defaultFiltersButton}
                                    </GridCell>
                                </Grid>
                            </Card>
                        </GridCell>
                        <GridCell width="4-5" style={{ position: "absolute", left: "20%", top: "220px" }}>
                            <ShipmentsSearchResults ref={(c) => this.searchResult = c}
                                height={resultHeight}
                                data={this.state.shipments}
                                groupBy={groups}
                                shipmentNo={this.props.params.shipmentNo}
                                groupByLabelHolder={this.groupByLabelHolder}
                                onScrollEnd={() => this.handleScroll()} />
                            {preloader}
                        </GridCell>
                    </Grid>
                </div>
            </div>
        );
    }
}