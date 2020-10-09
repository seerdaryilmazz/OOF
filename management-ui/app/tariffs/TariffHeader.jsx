import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, CardHeader, ListHeading, PageHeader} from "susam-components/layout";
import {Notify, DropDown, Form, Span, TextInput, Checkbox, Button} from "susam-components/basic";
import {DateTimeRange} from "susam-components/advanced";

export class TariffHeader extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {selectedItem: null}
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps) {
            this.setState({selectedItem: nextProps.selectedItem});
        }
    }

    updateHistorySelection(value) {
        let searchCriteria = _.cloneDeep(this.props.searchCriteria);
        searchCriteria.includeHistory = value;
        this.props.handleSearchCriteriaUpdate(searchCriteria);
    }

    updateDateSelection(value) {
        let searchCriteria = _.cloneDeep(this.props.searchCriteria);
        searchCriteria.departureDateFrom = value ? value.startDateTime : null;
        searchCriteria.departureDateTo = value ? value.endDateTime : null;
        this.props.handleSearchCriteriaUpdate(searchCriteria);
    }


    routeLegDescription(route) {
        if (!route) {
            return "";
        }
        let routeInfo = [route.from.name];
        routeInfo.push(route.to.name);
        return routeInfo.join(" - ");
    }


    render() {
        let selectedItem = this.state.selectedItem;
        let searchCriteria = this.props.searchCriteria;

        if (!selectedItem) {
            return null;
        }
        if (!searchCriteria) {
            searchCriteria = {};
        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <PageHeader title={this.routeLegDescription(selectedItem)}/>
                </GridCell>
                <GridCell width="1-5">
                    <Checkbox label="Show History" value={searchCriteria.includeHistory}
                              onchange={(value) => {
                                  this.updateHistorySelection(value)
                              }}/>
                </GridCell>
                <GridCell width="4-5">
                </GridCell>
                <GridCell width="4-5">
                    <DateTimeRange id="searchcriteriadatepicker"
                                   startDateLabel="Departure Date From" endDateLabel="Departure Date To" hideIcon="true"
                                   hideTimezone="true"
                                   value={{
                                       startDateTime: searchCriteria.departureDateFrom,
                                       endDateTime: searchCriteria.departureDateTo
                                   }}
                                   onchange={(value) => {
                                       this.updateDateSelection(value)
                                   }}/>
                </GridCell>
                <GridCell width="1-5">
                    <Button label="Search" onclick={() => {
                        this.props.handleSearch()
                    }}/>
                </GridCell>
            </Grid>
        )
    }
}

TariffHeader.contextTypes = {
    translator: React.PropTypes.object,
};