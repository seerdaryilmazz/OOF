import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";
import PropTypes from "prop-types";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Loader} from "susam-components/layout";
import {Notify} from 'susam-components/basic';
import { StringUtils } from "susam-components/utils/StringUtils";
import {CrmActivityService} from '../services';

export class ActivityStatistics extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false
        };
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        CrmActivityService.getHomePageStatistics().then(response => {
            let data = response.data;
            data.activityScopeBasedCounts = _.sortBy(data.activityScopeBasedCounts, ["activityScope.name"]);
            this.setState({data: data, ready: true});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    renderRow(title, value) {
        return (
            <tr key={uuid.v4()}>
                <td>{StringUtils.titleCase(super.translate(title))}</td>
                <td style={{textAlign: "right"}}>{value}</td>
            </tr>
        );
    }

    renderHeaderRow(value){
        let title = "Total Activities";
        return (
            <tr key={title}>
                <td><u>{super.translate(title)}</u></td>
                <td style={{textAlign: "right"}}>{value}</td>
            </tr>
        );
    }

    renderActivityScopeBasedCounts() {
        let cells = [];
        let activityScopeBasedCounts = this.state.data.activityScopeBasedCounts;
        if (!_.isEmpty(activityScopeBasedCounts)) {
            activityScopeBasedCounts.forEach((elem) => {
                cells.push(this.renderRow(elem.activityScope.name, elem.count, false));
            });
        }
        return cells;
    }

    render() {
        if (!this.state.ready) {
            return (
                <Loader size="L"/>
            );
        } else {
            return (
                <Card style={{backgroundColor: "yellowgreen", height: "100%"}}>
                    <table style={{width: "100%", color: "white", fontWeight: "bold"}}>
                        <tbody>
                        {this.renderHeaderRow(this.state.data.totalCount)}
                        {this.renderActivityScopeBasedCounts()}
                        </tbody>
                    </table>
                </Card>
            );
        }
    }
}
ActivityStatistics.contextTypes = {
    translator: PropTypes.object
};

