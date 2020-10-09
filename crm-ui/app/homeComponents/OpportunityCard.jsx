import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Span } from 'susam-components/basic';
import { Card, Grid, GridCell } from 'susam-components/layout';
import _ from "lodash";

export class OpportunityCard extends TranslatingComponent {
    render() {
        let { opportunity } = this.props;
        return (
            <Card>
                <Grid collapse={true} removeTopMargin={true}>
                    <GridCell width="1-1">
                        <div style={{float: "left", width: "45%"}}>
                            {super.translate(opportunity.serviceArea.name)}
                        </div>
                        <div style={{float: "left", width: "45%"}}>
                            {this.renderStatus(opportunity)}
                        </div>
                        <div style={{float: "left", width: "10%", textAlign: "right"}}>
                            <a href="javascript:;"
                               onClick={() => window.open(`/ui/crm/opportunity/view/${opportunity.id}`, "_blank")}>
                                <i className="uk-icon-eye"></i>
                            </a>
                        </div>
                    </GridCell>
                    <GridCell width="1-1" style={{paddingBottom: "8px"}}>
                        <div style={{float: "left"}}>
                            {`${opportunity.name} - ${opportunity.number}`}
                        </div>
                    </GridCell>
                    <GridCell width="1-1">
                        <a style={{color: 'black'}}
                           href={`/ui/crm/account/${opportunity.account.id}/view`}><u>{opportunity.account.name}</u></a>
                    </GridCell>
                    <GridCell width="1-2">
                        <Span label="Created By"
                              value={_.get(_.find(this.context.getAllUsers(), u => u.username == opportunity.createdBy), 'displayName')}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Span label="Last Updated" value={opportunity.lastUpdated.substring(0, 16)}/>
                    </GridCell>
                </Grid>
            </Card>
        )
    }
    renderStatus(opportunity) {
        if ("QUOTED" == opportunity.status.code) {
            return <span className="uk-badge md-bg-green-600">{super.translate(_.capitalize(opportunity.status.name))}</span>
        } else if ("PROSPECTING" == opportunity.status.code) {
            return <span className="uk-badge md-bg-blue-500">{super.translate(_.capitalize(opportunity.status.name))}</span>
        } else if ("VALUE_PROPOSITION" == opportunity.status.code) {
            return <span className="uk-badge md-bg-blue-700">{super.translate(_.capitalize(opportunity.status.name))}</span>
        } else if ("CANCELED" == opportunity.status.code) {
            return <span className="uk-badge uk-badge-muted">{super.translate(_.capitalize(opportunity.status.name))}</span>
        } else if (["REJECTED", "WITHDRAWN"].includes(opportunity.status.code)) {
            return <span className="uk-badge md-bg-red-600">{super.translate(_.capitalize(opportunity.status.name))}</span>
        } else if ("CLOSED" == opportunity.status.code) {
            return <span className="uk-badge uk-badge-warning">{super.translate(_.capitalize(opportunity.status.name))}</span>
        } else {
            return null;
        }
    }
}

OpportunityCard.contextTypes = {
    getUsers: PropTypes.func,
    getAllUsers: PropTypes.func,
    user: PropTypes.object,
    router: PropTypes.object,
    translator: PropTypes.object
};


