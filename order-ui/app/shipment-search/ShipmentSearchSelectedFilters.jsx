import React from "react";
import uuid from "uuid";

export class ShipmentSearchSelectedFilters extends React.Component {

    constructor(props) {
        super(props);
    }

    removeAggregationFilter(bucketName, value) {
        this.props.removeAggregationFilter(bucketName, value);
    }

    removeAllFilters() {
        this.props.removeAllFilters();
    }

    getBadge(isGreen, text, onClick) {
        let className = "searchBadge uk-badge " + (isGreen ? "uk-badge-success" : "uk-badge-danger");

        return (
            <div className={className} key={uuid.v4()}>
                <div className="searchBadgeText">
                    {text}
                </div>
                <div className="searchBadgeClose">
                    <a className="uk-badge-close uk-close" onClick={onClick} />
                </div>
            </div>
        );
    }

    addBadgeForRangeFilter(rangeFilter, filters, fn) {
        if (rangeFilter) {
            filters.push(this.getBadge(true, (rangeFilter.name + " : " + (rangeFilter.gte ? rangeFilter.gte : "?") + " - " + (rangeFilter.lte ? rangeFilter.lte : "?")), fn));
        }
    }

    removeRangeFilter(rangeFilter) {
        this.props.removeRangeFilter(rangeFilter.name);
    }

    addBadgeForMatchFilter(matchFilter, filters, fn) {
        if (matchFilter) {
            filters.push(this.getBadge(true, matchFilter.name + " : " + matchFilter.val, fn));
        }
    }

    removeMatchFilter(matchFilter) {
        this.props.removeMatchFilter(matchFilter.name);
    }

    render() {
        let selectedFilters = null;

        if (this.props.searchResults && this.props.searchResults.config) {

            selectedFilters = [];

            if (this.props.searchResults.config.aggregationFilters && this.props.searchResults.config.aggregationFilters.length > 0) {
                for (let i = 0; i < this.props.searchResults.config.aggregationFilters.length; i++) {
                    let aggregationFilter = this.props.searchResults.config.aggregationFilters[i];

                    selectedFilters.push(aggregationFilter.values.map(value => {
                        return this.getBadge(
                            true,
                            aggregationFilter.bucketName + ' : ' + value,
                            () => this.removeAggregationFilter(aggregationFilter.bucketName, value));
                    }));
                }
            }

            if (this.props.searchResults.config.rangeFilters) {
                this.props.searchResults.config.rangeFilters.forEach(rangeFilter => {
                    this.addBadgeForRangeFilter(rangeFilter, selectedFilters, () => this.removeRangeFilter(rangeFilter));
                });
            }

            if (this.props.searchResults.config.matchFilters) {
                this.props.searchResults.config.matchFilters.forEach(matchFilter => {
                    this.addBadgeForMatchFilter(matchFilter, selectedFilters, () => this.removeMatchFilter(matchFilter));
                });
            }

            if (selectedFilters.length > 0) {
                selectedFilters.push(this.getBadge(false, "Clear All", () => this.removeAllFilters()));
            }
        }

        return (
            <div className="uk-row-first" style={{minHeight: "30px"}}>
                {selectedFilters}
            </div>
        );
    }
}