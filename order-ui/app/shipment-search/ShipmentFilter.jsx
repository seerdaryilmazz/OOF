import React from "react";
import {Bucket} from "./Bucket";
import {RangeFilter} from "./RangeFilter";
import {MatchFilter} from "./MatchFilter";
import {SavedSearches} from "./SavedSearches";
import uuid from "uuid";
import {Card} from "susam-components/layout";

export class ShipmentFilter extends React.Component {

    constructor(props) {
        super(props);
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

    changeMatchFilter(matchFilter) {
        this.props.changeMatchFilter(matchFilter);
    }

    render() {
        let buckets = null;
        let rangeFilters = null;
        let matchFilters = null;
        let bucketsAndFilters = null;

        if (this.props.searchResults) {

            if (this.props.searchResults.buckets) {
                buckets = this.props.searchResults.buckets.map(bucket => {
                    return (
                        <Bucket
                            key={uuid.v4()}
                            bucket={bucket}
                            addAggregationFilter={(bucketName, value) => this.addAggregationFilter(bucketName, value)}
                            removeAggregationFilter={(bucketName, value) => this.removeAggregationFilter(bucketName, value)}
                            onSeeMore={(bucketName) => this.onSeeMore(bucketName)}
                        />
                    );
                });
            }

            rangeFilters = this.props.searchResults.rangeTypes.map(rangeType => {
                let rangeFilterIndex = _.findIndex(this.props.rangeFilters, rf => {
                    return rf.name == rangeType.name
                });
                let rangeFilter = this.props.rangeFilters[rangeFilterIndex];

                return (
                    <RangeFilter
                        key={uuid.v4()}
                        rangeType={rangeType}
                        rangeFilter={rangeFilter}
                        changeRangeFilter={(rangeFilter) => this.changeRangeFilter(rangeFilter)}/>
                );
            });
            matchFilters = this.props.searchResults.matchTypes.map(matchType => {
                let matchFilterIndex = _.findIndex(this.props.matchFilters, mf => {
                    return mf.name == matchType.name
                });
                let matchFilter = this.props.matchFilters[matchFilterIndex];
                return (
                    <MatchFilter
                        key={matchType.name}
                        matchType={matchType}
                        matchFilter={matchFilter}
                        changeMatchFilter={(matchFilter) => this.changeMatchFilter(matchFilter)}/>
                );
            });

            bucketsAndFilters = (
                <Card>
                    <SavedSearches
                        onSavedSearchChange={(savedSearch) => this.props.onSavedSearchChange(savedSearch)}
                        savedSearches={this.props.savedSearches}
                        selectedSavedSearch={this.props.selectedSavedSearch}
                        updateSelectedSavedSearch={() => this.props.updateSelectedSavedSearch()}
                        addSavedSearch={(name) => this.props.addSavedSearch(name)}
                        deleteSelectedSavedSearch={() => this.props.deleteSelectedSavedSearch()}/>
                    {matchFilters}
                    {buckets}
                    {rangeFilters}
                </Card>
            );
        }

        return (
            <div className="shipmentFilters">
                {bucketsAndFilters}
            </div>
        );
    }
}