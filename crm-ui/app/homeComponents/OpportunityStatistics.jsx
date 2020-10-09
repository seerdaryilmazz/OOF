import * as axios from 'axios';
import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Card, Loader } from "susam-components/layout";
import {CrmSearchService, LookupService} from "../services";
import { StringUtils } from "susam-components/utils/StringUtils";

export class OpportunityStatistics extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false
        };
        this.getData();
    }

    getData() {
        axios.all([
            LookupService.getServiceAreas(),
            CrmSearchService.searchOpportunityHomePageStatistics()
        ]).then(axios.spread((serviceArea, statistics)=>{
            let data = statistics.data;
            data.serviceAreaBasedCounts.forEach(i => i.serviceArea = _.find(serviceArea.data, { code: i.serviceArea }));
            data.serviceAreaBasedCounts = _.sortBy(data.serviceAreaBasedCounts, ["serviceArea.name"]);
            this.setState({ data: data, ready: true });
        })).catch(error => {
            Notify.showError(error);
        });
    }

    renderRow(title, value) {
        return (
            <tr key={title}>
                <td>{StringUtils.titleCase(super.translate(title))}</td>
                <td style={{ textAlign: "right" }}>{value}</td>
            </tr>
        );
    }

    renderHeaderRow(value){
        let title = "Total Open Opportunities";
        return (
            <tr key={title}>
                <td><u>{super.translate(title)}</u></td>
                <td style={{ textAlign: "right" }}>{value}</td>
            </tr>
        );
    }

    renderServiceAreaBasedCounts() {
        let cells = [];
        let serviceAreaBasedCounts = this.state.data.serviceAreaBasedCounts;
        if (!_.isEmpty(serviceAreaBasedCounts)) {
            serviceAreaBasedCounts.forEach((elem) => {
                cells.push(this.renderRow(_.get(elem.serviceArea, 'name', elem.serviceArea), elem.count));
            });
        }
        return cells;
    }

    render() {
        if (!this.state.ready) {
            return (
                <Loader size="L" />
            );
        } else {
            return (
                <Card style={{ backgroundColor: "#e56884", height: "100%" }}>
                    <table style={{ width: "100%", color: "white", fontWeight: "bold" }}>
                        <tbody>
                        {this.renderHeaderRow(this.state.data.totalCount)}
                        {this.renderServiceAreaBasedCounts()}
                        </tbody>
                    </table>
                </Card>
            );
        }
    }
}

OpportunityStatistics.contextTypes = {
    translator: React.PropTypes.object
};