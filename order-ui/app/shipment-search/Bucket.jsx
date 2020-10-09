import React from "react";
import uuid from "uuid";
import {Card} from "susam-components/layout";
import {Checkbox, Notify} from "susam-components/basic";
import {CompanySearchAutoComplete} from "susam-components/oneorder";
import {AutoComplete} from "susam-components/advanced";
import * as axios from "axios";
import _ from "lodash";

import {KartoteksService} from '../services/KartoteksService';

export class Bucket extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showSearch: false
        };
        this.focusElementId = null;
    }

    onChangeBucketItem(bucketName, value, checked) {
        if (checked) {
            this.props.addAggregationFilter(bucketName, value);
        } else {
            this.props.removeAggregationFilter(bucketName, value);
        }
    }

    onSeeMore(bucketName) {
        this.props.onSeeMore(bucketName);
    }

    onSearchClick(bucketName) {
        this.setState({showSearch: !this.state.showSearch});
        this.focusElementId = this.getSearchElementId(bucketName);
    }

    onSearch(bucketName, value) {
        this.props.addAggregationFilter(bucketName, value);
        this.setState({showSearch: false});
    }

    countryAutocompleteCallback = (release, val) => {
        KartoteksService.searchCountry(val).then((response) => {
            release(
                response.data.map(function (item) {
                    return {value: item.iso}
                })
            );
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    getSearchElementId(bucketName) {
        return _.snakeCase(_.deburr(bucketName + "_search"));
    }

    componentDidUpdate() {
        if (this.focusElementId) {
            $("#" + this.focusElementId).focus();
        }
    }

    render() {
        let items = null;
        let more = null;
        let search = null;
        let aggregationFilterType = this.props.bucket.aggregationFilterType;

        if (this.props.bucket && this.props.bucket.items) {
            items = this.props.bucket.items.map(item => {
                return (
                    <li key={uuid.v4()} className="bucketItem">
                        <div className="md-list-content" key={uuid.v4()}>
                            <div className="bucketItemCheckbox" key={uuid.v4()}>
                                <Checkbox key={uuid.v4()}
                                          label={item.key}
                                          checked={item.selected}
                                          onchange={(value) => this.onChangeBucketItem(this.props.bucket.name, item.key, value)}/>
                            </div>
                            <div className="bucketItemCount" key={uuid.v4()}>
                                ({item.count})
                            </div>
                        </div>
                    </li>
                );
            });

            if (this.props.bucket.more) {
                more = (
                    <div className="seeMore">
                        <a key={uuid.v4()} href="javascript:void(0)"
                           onClick={() => this.onSeeMore(this.props.bucket.name)}>
                            <i className="uk-icon-plus"></i> see more
                        </a>
                    </div>
                );
            }

            if (this.state.showSearch) {
                let searchComponent = null;
                if (aggregationFilterType == 'COMPANY') {
                    searchComponent = (
                        <CompanySearchAutoComplete
                            id={this.getSearchElementId(this.props.bucket.name)}
                            onchange={(selectedItem) => this.onSearch(this.props.bucket.name, selectedItem.value)}/>
                    );
                } else if (aggregationFilterType == 'COUNTRY') {
                    searchComponent = (
                        <AutoComplete
                            id={this.getSearchElementId(this.props.bucket.name)}
                            valueField="value" labelField="value"
                            callback={this.countryAutocompleteCallback}
                            onchange={(selectedItem) => this.onSearch(this.props.bucket.name, selectedItem.value)}
                            hideLabel={true}
                            placeholder="Search for Country"
                            minLength="0"/>
                    );
                }
                search = (
                    <div className="searchComponent">
                        {searchComponent}
                    </div>
                );
            }
        }

        let bucket = null;

        if (this.props.bucket) {
            let searchIcon = null;
            if (aggregationFilterType == 'COMPANY' || aggregationFilterType == 'COUNTRY') {
                searchIcon = (
                    <a href="javascript:void(0)" onClick={(e) => this.onSearchClick(this.props.bucket.name)}
                       className="bucketSearchIcon">
                        <i className="md-icon uk-icon uk-icon-search"/>
                    </a>
                );
            }

            bucket = (
                <div className="bucket">
                    <div className="bucketName">
                        <b>{this.props.bucket.name}</b>
                    </div>

                    {search}
                    {searchIcon}

                    <ul className="md-list" key={uuid.v4()}>
                        {items}
                    </ul>

                    {more}
                </div>
            )
        }

        return bucket;
    }
}