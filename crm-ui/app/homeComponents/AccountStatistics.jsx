import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Card, Loader } from "susam-components/layout";
import uuid from 'uuid';
import { CrmSearchService } from '../services';
import { StringUtils } from "susam-components/utils/StringUtils";


export class AccountStatistics extends TranslatingComponent {

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
        CrmSearchService.searchAccountHomePageStatistics().then(response => {
            let data = response.data;
            data.accountTypeBasedCounts = _.sortBy(data.accountTypeBasedCounts, ["accountType"]);
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
        let title = "Total Accounts";
        return (
            <tr key={title}>
                <td><u>{super.translate(title)}</u></td>
                <td style={{textAlign: "right"}}>{value}</td>
            </tr>
        );
    }

    renderAccountTypeBasedCounts() {
        let cells = [];
        let accountTypeBasedCounts = this.state.data.accountTypeBasedCounts;
        if (!_.isEmpty(accountTypeBasedCounts)) {
            accountTypeBasedCounts.forEach((elem) => {
                cells.push(this.renderRow(elem.accountType, elem.count, false));
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
                <Card style={{backgroundColor: "orchid", height: "100%"}}>
                    <table style={{width: "100%", color: "white", fontWeight: "bold"}}>
                        <tbody>
                        {this.renderHeaderRow(this.state.data.totalCount)}
                        {this.renderAccountTypeBasedCounts()}
                        </tbody>
                    </table>
                </Card>
            );
        }
    }
}
AccountStatistics.contextTypes = {
    translator: PropTypes.object
};


