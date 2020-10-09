import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Card } from "susam-components/layout";
import uuid from "uuid";
import { Buckets } from "./Buckets";
import { MatchFilters } from "./MatchFilters";
import { RangeFilters } from "./RangeFilters";
import { StoredSearches } from "./StoredSearches";

export class ShipmentFilters extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ bucketHeight: nextProps.height })
    }

    addAggregationFilter(bucketName, value) {
        this.props.addAggregationFilter(bucketName, value);
    }

    removeAggregationFilter(bucketName, value) {
        this.props.removeAggregationFilter(bucketName, value);
    }

    onSeeMore(bucketName) {
        this.props.onSeeMore(bucketName);
    }

    changeRangeFilter(rangeFilter) {
        this.props.changeRangeFilter(rangeFilter);
    }

    removeRangeFilter(rangeFilter) {
        this.props.removeRangeFilter(rangeFilter);
    }

    changeMatchFilter(matchFilter) {
        this.props.changeMatchFilter(matchFilter);
    }

    removeMatchFilter(matchFilter) {
        this.props.removeMatchFilter(matchFilter);
    }

    render() {
        let buckets = null;
        let rangeFilters = null;
        let matchFilters = null;
        let bucketsAndFilters = null;

        let style = {
            overflowY: "auto",
            overflowX: "hidden", 
            margin: "0px -13px 0px 0px", 
            height: this.state.bucketHeight
        }

        if (this.props.filter) {

            if (this.props.filter.buckets) {
                buckets = this.props.filter.buckets.map(bucket => {
                    return (
                        <Buckets
                            key={uuid.v4()}
                            bucket={bucket}
                            addAggregationFilter={(bucketName, value) => this.addAggregationFilter(bucketName, value)}
                            removeAggregationFilter={(bucketName, value) => this.removeAggregationFilter(bucketName, value)}
                            onSeeMore={(bucketName) => this.onSeeMore(bucketName)}
                        />
                    );
                });
            }

            rangeFilters = this.props.filter.rangeTypes.map(rangeType => {
                let rangeFilterIndex = _.findIndex(this.props.config.rangeFilters, rf => {
                    return rf.name == rangeType.name
                });
                let rangeFilter = this.props.config.rangeFilters[rangeFilterIndex];

                return (
                    <RangeFilters
                        key={uuid.v4()}
                        rangeType={rangeType}
                        rangeFilter={rangeFilter}
                        presets={rangeType.presets}
                        changeRangeFilter={(rangeFilter) => this.changeRangeFilter(rangeFilter)}
                        removeRangeFilter={(rangeFilter) => this.removeRangeFilter(rangeFilter)} />
                );
            });
            matchFilters = this.props.filter.matchTypes.map(matchType => {
                let matchFilterIndex = _.findIndex(this.props.matchFilters, mf => {
                    return mf.name == matchType.name
                });
                let matchFilter = this.props.config.matchFilters[matchFilterIndex];
                return (
                    <MatchFilters
                        key={matchType.name}
                        matchType={matchType}
                        matchFilter={matchFilter}
                        changeMatchFilter={(matchFilter) => this.changeMatchFilter(matchFilter)}
                        removeMatchFilter={(matchFilter => this.removeMatchFilter(matchFilter))} />
                );
            });

            bucketsAndFilters =
                <Card>
                    <StoredSearches
                        onSavedSearchChange={(savedSearch) => this.props.onSavedSearchChange(savedSearch)}
                        savedSearches={this.props.savedSearches}
                        selectedSavedSearch={this.props.selectedSavedSearch}
                        updateSelectedSavedSearch={() => this.props.updateSelectedSavedSearch()}
                        addSavedSearch={(name) => this.props.addSavedSearch(name)}
                        deleteSelectedSavedSearch={() => this.props.deleteSelectedSavedSearch()} />
                    {matchFilters}
                    <div style={style}>
                        {buckets}
                        {rangeFilters}
                    </div>
                </Card>
        }

        return bucketsAndFilters;
    }
}

ShipmentFilters.contextTypes = {
    translator: PropTypes.object
};