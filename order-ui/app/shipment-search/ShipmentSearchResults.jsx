import React from "react";
import {Card, Grid, GridCell, Pagination} from "susam-components/layout";
import {DropDown} from "susam-components/basic";
import uuid from "uuid";
import {ShipmentsTable} from "./ShipmentsTable";

export class ShipmentSearchResults extends React.Component {

    constructor(props) {
        super(props);
    }

    onPageChange(page) {
        this.props.onPageChange(page);
    }

    onSortChange(name, direction) {
        if (name && direction) {
            this.props.onSortChange(name, direction);
        }
    }

    onSortRemove(name) {
        this.props.onSortRemove(name);
    }

    onSortRemoveAll() {
        this.props.onSortRemoveAll();
    }

    getBadge(isGreen, text, onClick, onSortChange, direction) {
        let className = "searchBadge uk-badge " + (isGreen ? "uk-badge-success" : "uk-badge-danger");

        let sortChange = null;
        if (onSortChange) {
            let icon = direction == 'asc' ? "uk-icon-sort-alpha-desc" : "uk-icon-sort-alpha-asc";
            icon += " uk-icon-justify uk-icon-small searchSortIcon";

            sortChange = <a href="javascript:void(0)" className={icon} onClick={onSortChange}></a>;
        }

        return (
            <div className={className}
                 key={uuid.v4()}>
                <div className="searchBadgeText" key={uuid.v4()}>
                    {sortChange}
                    {text}
                </div>
                <div className="searchBadgeClose" key={uuid.v4()}>
                    <a href="javascript:void(0)" className="uk-badge-close uk-close"
                       onClick={onClick}></a>
                </div>
            </div>
        );
    }

    onGroupChange(name) {
        this.props.onGroupChange(name);
    }

    onPreviewShipment(shipmentDocument) {
        this.props.onPreviewShipment(shipmentDocument);
    }

    onEditShipment(shipmentDocument) {
        this.props.onEditShipment(shipmentDocument);
    }

    onOpenShipmentTransportHistoryModal(shipmentDocument){
        this.props.onOpenShipmentTransportHistoryModal(shipmentDocument);
    }

    onViewBarcodes(shipmentDocument){
        this.props.onViewBarcodes(shipmentDocument);
    }
    onPreviewPlan(shipmentDocument){
        this.props.onPreviewPlan(shipmentDocument);
    }

    render() {
        let results = null;

        if (this.props.searchResults && this.props.searchResults.shipments) {
            if (this.props.searchResults.shipments.length == 0 || this.props.searchResults.shipments[0].length == 0) {
                results = (
                    <div className="uk-alert uk-alert-danger">
                        No results found.
                    </div>
                );
            } else {
                let sorts = null;

                if (this.props.searchResults.config.sorts) {
                    sorts = this.props.searchResults.config.sorts.map(sort => {
                        return this.getBadge(true, sort.name, () => this.onSortRemove(sort.name), () => this.onSortChange(sort.name, sort.direction == 'desc' ? 'asc' : 'desc'), sort.direction);
                    });

                    if (sorts.length > 0) {
                        sorts.push(this.getBadge(false, "Clear All", () => this.onSortRemoveAll()));
                    }
                }

                let groupField = null;
                if (this.props.searchResults.config.group) {
                    let foundIndex = _.findIndex(this.props.searchResults.groupTypes, gt => {
                        return gt.name == this.props.searchResults.config.group;
                    });

                    if (foundIndex >= 0) {
                        groupField = this.props.searchResults.groupTypes[foundIndex].field;
                    }
                }

                let tables = this.props.searchResults.shipments.map(shipmentList => {
                    return (
                        <ShipmentsTable
                            key={uuid.v4()}
                            shipmentList={shipmentList}
                            onPageChange={page => this.onPageChange(page)}
                            groupField={groupField}
                            onPreviewShipment={(shipmentDocument) => this.onPreviewShipment(shipmentDocument)}
                            onEditShipment={(shipmentDocument) => this.onEditShipment(shipmentDocument)}
                            onViewBarcodes = {(shipmentDocument) => this.onViewBarcodes(shipmentDocument)}
                            onOpenShipmentTransportHistoryModal={(shipmentDocument) => this.onOpenShipmentTransportHistoryModal(shipmentDocument)}
                            onPreviewPlan = {(shipmentDocument) => this.onPreviewPlan(shipmentDocument)}/>
                    );
                });
                results = (
                    <div>
                        <Card>
                            <div className="searchFilters">
                                <Grid>
                                    <GridCell width="1-1" noMargin="true">
                                        <Grid>
                                            <GridCell width="1-5" noMargin="true">
                                                <DropDown label="Group"
                                                          onchange={(value) => this.onGroupChange(value.name)}
                                                          options={this.props.searchResults.groupTypes}
                                                          valueField="name"
                                                          labelField="name"
                                                          value={this.props.searchResults.config.group}/>
                                            </GridCell>
                                            <GridCell width="1-5" noMargin="true">
                                                <DropDown label="Sort"
                                                          onchange={(value) => this.onSortChange(value.name, "asc")}
                                                          options={this.props.searchResults.sortTypes} valueField="name"
                                                          labelField="name" value=""/>
                                            </GridCell>
                                            <GridCell width="3-5" noMargin="true">
                                                {sorts}
                                            </GridCell>
                                        </Grid>
                                    </GridCell>
                                </Grid>
                            </div>
                        </Card>
                        {tables}
                        <p/>
                        <Pagination
                            page={this.props.searchResults.config.page}
                            totalElements={this.props.searchResults.totalElements}
                            totalPages={this.props.searchResults.totalPages}
                            onPageChange={page => this.onPageChange(page)}/>
                    </div>
                );
            }
        }

        return results;
    }
}