import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { AutoComplete, Chip } from "susam-components/advanced";
import { Checkbox, Notify } from "susam-components/basic";
import { CompanySearchAutoComplete } from "susam-components/oneorder";
import uuid from "uuid";
import { KartoteksService } from '../services/KartoteksService';

export class Buckets extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            showSearch: false
        };
        this.focusElementId = null;

        this.icons = [
            { key: "adr", className: "mdi-alert-octagon", tooltip: "Dangerous (ADR)" },
            { key: "certificated", className: "mdi-certificate", tooltip: "Certificated" },
            { key: "temperature", className: "mdi-thermometer", tooltip: "Temperature Controlled" },
            { key: "hangingLoad", className: "mdi-hanger", tooltip: "Hanging Load" },
            { key: "longLoad", className: "mdi-arrow-expand", tooltip: "Long Load" },
            { key: "oversizeLoad", className: "mdi-star-circle", tooltip: "Oversized Load" },
            { key: "heavyLoad", className: "mdi-weight-kilogram", tooltip: "Heavy Load" },
            { key: "valuableLoad", className: "mdi-currency-usd", tooltip: "Valuable Load" },
        ];
    }

    onChangeBucketItem(bucketName, value, checked) {
        if (checked) {
            this.props.addAggregationFilter(bucketName, value);
        } else {
            this.props.removeAggregationFilter(bucketName, value);
        }
    }

    onChangeBucketDropdownList(bucketName, values) {
        let prev = new Set(this.props.bucket.items.filter(i => i.selected));
        let current = new Set(values);
        let isItemAded = false;
        let difference = null;

        if (prev.size < current.size) {
            difference = new Set([...current].filter(x => !prev.has(x)));
            isItemAded = true;
        } else {
            difference = new Set([...prev].filter(x => !current.has(x)));
        }
        let item = _.first([...difference]);
        this.onChangeBucketItem(bucketName, _.get(item, "key"), isItemAded);
    }

    onSeeMore(bucketName) {
        this.props.onSeeMore(bucketName);
    }

    onSearchClick(bucketName) {
        this.setState({ showSearch: !this.state.showSearch });
        this.focusElementId = this.getSearchElementId(bucketName);
    }

    onSearch(bucketName, value) {
        this.props.addAggregationFilter(bucketName, value);
        this.setState({ showSearch: false });
    }

    countryAutocompleteCallback = (release, val) => {
        KartoteksService.searchCountry(val).then((response) => {
            release(
                response.data.map(function (item) {
                    return { value: item.iso }
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
        let aggregationRenderType = this.props.bucket.aggregationRenderType;

        let bucket = null;

        if (_.isEqual("CHECKBOX", aggregationRenderType)) {
            if (this.props.bucket && this.props.bucket.items) {
                items = this.props.bucket.items.map(item => {
                    return (
                        <li key={uuid.v4()} className="bucketItem">
                            <div className="md-list-content" key={uuid.v4()}>
                                <div className="bucketItemCheckbox" key={uuid.v4()}>
                                    <Checkbox key={uuid.v4()}
                                        label={item.key}
                                        checked={item.selected}
                                        onchange={(value) => this.onChangeBucketItem(this.props.bucket.name, item.key, value)} />
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
                            <a key={uuid.v4()} href="javascript:;"
                                onClick={() => this.onSeeMore(this.props.bucket.name)}>
                                <i className="uk-icon-plus"></i>{super.translate("see more")}
                            </a>
                        </div>
                    );
                }

                if (this.state.showSearch) {
                    let searchComponent = null;
                    if (aggregationFilterType == 'COMPANY') {
                        searchComponent = (
                            <CompanySearchAutoComplete
                                showShortName={true}
                                id={this.getSearchElementId(this.props.bucket.name)}
                                onchange={(selectedItem) => this.onSearch(this.props.bucket.name, selectedItem.value)} />
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
                                minLength="0" />
                        );
                    }
                    search = (
                        <div className="searchComponent" style={{ width: "calc(100% - 2em)", marginTop: "-8px", maxHeight: "48px", height: "48px", position: "relative" }}>
                            {searchComponent}
                        </div>
                    );
                }
            }

            if (this.props.bucket) {
                let searchIcon = null;
                if (aggregationFilterType == 'COMPANY' || aggregationFilterType == 'COUNTRY') {
                    searchIcon = (
                        <a href="javascript:;" onClick={(e) => this.onSearchClick(this.props.bucket.name)}
                            className="bucketSearchIcon">
                            <i className="md-icon uk-icon uk-icon-search" />
                        </a>
                    );
                }

                let bucketName = (<div className="bucketName">
                    <b>{super.translate(this.props.bucket.name)}</b>
                </div>);

                bucket = (
                    <div className="bucket">
                        {this.state.showSearch ? search : bucketName}
                        {searchIcon}
                        <ul className="md-list" key={uuid.v4()}>
                            {items}
                        </ul>

                        {more}
                    </div>
                )
            }
        } else if (_.isEqual("DROPDOWNLIST", aggregationRenderType)) {
            bucket =
                <div className="bucket">
                    <div className="bucketName" style={{ marginBottom: "-8px" }}>
                        <b>{super.translate(this.props.bucket.name)}</b>
                    </div>
                    <Chip options={this.props.bucket.items}
                        valueField="key" labelField="key"
                        onchange={(value) => this.onChangeBucketDropdownList(this.props.bucket.name, value)}
                        value={this.props.bucket.items.filter(i => i.selected)}
                        hideSelectAll={true} />
                </div>
        } else if (_.isEqual("TOGGLEBUTTON", aggregationRenderType)) {
            let buttons = this.icons.map(icon =>
                <li key={uuid.v4()} style={{ float: "left" }}>
                    <ToggleIcon
                        key={uuid.v4()}
                        icon={icon.className}
                        checked={_.get(_.find(this.props.bucket.items, { key: icon.key }), "selected")}
                        onchange={(value) => this.onChangeBucketItem(this.props.bucket.name, icon.key, value)}
                        tooltip={icon.tooltip} />
                </li>
            );

            bucket =
                <div className="bucket">
                    <div className="bucketName">
                        <b>{super.translate(this.props.bucket.name)}</b>
                    </div>
                    <ul style={{ listStyleType: "none", margin: "0", padding: "0", overflow: "hidden" }}>
                        {buttons}
                    </ul>
                </div>
        }
        return bucket;
    }
}

export class ToggleIcon extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            checked: props.checked
        }
    }

    click() {
        this.props.onchange(!this.state.checked);
        this.setState(prevState => ({
            checked: !prevState.checked
        }));
    }

    render() {
        let className = "page-toolbar-icon mdi md-icon " + this.props.icon;
        let style = { margin: "0 3px" };
        if (this.state.checked) {
            className += " mdi-light";
            style.backgroundColor = "#64b5f6";
        }
        return (
            <i style={style}
                className={className}
                onClick={() => this.click()}
                data-uk-tooltip="{pos:'bottom'}" title={super.translate(this.props.tooltip)} />
        )
    }
}

Buckets.contextTypes = {
    translator: PropTypes.object
};
ToggleIcon.contextTypes = {
    translator: PropTypes.object
};