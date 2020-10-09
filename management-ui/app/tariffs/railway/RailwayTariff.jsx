import React from "react";
import _ from "lodash";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, CardHeader} from "susam-components/layout";
import {Notify, DropDown, Form, Span, TextInput} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

import {RouteService} from "../../services/RouteService";

import {TariffHeader} from '../TariffHeader';

import {RouteLegList} from '../RouteLegList';
import {RailwayTariffList} from './RailwayTariffList';
import {RailwayTariffDetailsModal} from './RailwayTariffDetailsModal';

export class RailwayTariff extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {selectedItem: null, searchCriteria: {}, tariffs: []}
    }

    componentDidMount() {
        axios.all([
            RouteService.getRouteLegs(RouteService.RAILWAY)
        ]).then(axios.spread((routeLegResponse) => {
            let state = _.cloneDeep(this.state);
            state.routeLegList = routeLegResponse.data;
            this.setState(state);
        })).catch((error) => {
            Notify.showError(error);
        });    }

    componentWillReceiveProps(nextProps) {
    }

    handleSelectFromList(item) {
        this.setState({selectedItem: item, searchCriteria: {}}, () => {
            this.search();
        });
    }

    search() {
        let selectedItem = this.state.selectedItem;
        let searchCriteria = this.state.searchCriteria;
        if(!selectedItem) {
            return
        }

        RouteService.getRouteLegExpeditions(selectedItem.id, searchCriteria).then(response => {
            this.setState({tariffs: response.data});
        }).catch(e => {
            Notify.showError(e);
            this.setState({tariffs: []});
        })
    }

    detailsClicked(routeLeg, tariff) {
        this.detailsModal.openFor(routeLeg, tariff);
    }

    render() {
        let title = super.translate("Railway Tariff");
        let routeLegList = this.state.routeLegList;
        let selectedItem = this.state.selectedItem;
        let searchCriteria = this.state.searchCriteria;
        let tariffs = this.state.tariffs;

        let routeLegListBody = <RouteLegList data={routeLegList}
                                             selectedItem={selectedItem}
                                             onselect={(value) => {this.handleSelectFromList(value)}}/>;

        let tariffListBody = <RailwayTariffList ref={(c) => this.form = c} tariffs={tariffs} selectedItem={selectedItem}
                                                detailsClicked={(item) => {this.detailsClicked(selectedItem, item)}}/>;

        return (
            <Page title={title}>
                <Grid divider={true}>
                    <GridCell width="1-4" noMargin={true}>
                        {routeLegListBody}
                    </GridCell>
                    <GridCell width="3-4" noMargin={true}>
                        <Grid>
                            <GridCell>
                                <TariffHeader selectedItem={selectedItem} searchCriteria={searchCriteria}
                                              handleSearchCriteriaUpdate={(value) => {this.setState({searchCriteria: value})}}
                                              handleSearch={() => {this.search()}}
                                />
                            </GridCell>
                            <GridCell className="uk-margin-large-top">
                                {tariffListBody}
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
                <RailwayTariffDetailsModal ref={(c) => this.detailsModal = c}/>
            </Page>
        );
    }
}

RailwayTariff.contextTypes = {
    translator: React.PropTypes.object,
};