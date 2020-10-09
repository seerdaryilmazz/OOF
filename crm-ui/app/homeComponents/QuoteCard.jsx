import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Span } from 'susam-components/basic';
import { Card, Grid, GridCell } from 'susam-components/layout';

export class QuoteCard extends TranslatingComponent {
    render() {
        let { quote } = this.props;
        return (<Card>
            <Grid collapse={true} removeTopMargin={true}>
                <GridCell width="1-1">
                    <div style={{float:"left", width:"90%"}}>
                        {quote.serviceArea.name}
                    </div>
                    <div style={{float:"left",  width:"10%", textAlign:"right"}}>
                        <a href="javascript:;" onClick={()=>window.open(`/ui/crm/quote/view/${quote.id}`, "_blank")}><i className="uk-icon-eye"></i></a>
                    </div>
                </GridCell>
                <GridCell width="1-1" style={{paddingBottom: "8px"}}>
                    <div style={{float:"left", width:"45%"}}>
                        {`${quote.number} ${quote.mappedIds.QUADRO ? (" - "  + quote.mappedIds.QUADRO): ''}`}
                    </div>
                    <div style={{float:"left", width:"35%"}}>
                        {this.renderType(quote)}
                    </div>
                    <div style={{float:"left", width:"20%", textAlign:"right"}}>
                        {this.renderStatus(quote)}
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <a style={{color:'black'}} href={`/ui/crm/account/${quote.account.id}/view`}><u>{quote.account.name}</u></a>
                </GridCell>
                <GridCell width="1-1">
                    {quote.name}
                </GridCell>
                <GridCell width="1-2">
                    <Span label="Created By" value={_.get(_.find(this.context.getAllUsers(), u => u.username == quote.createdBy), 'displayName')} />
                </GridCell>
                <GridCell width="1-2">
                    <Span label="Last Updated" value={quote.lastUpdated.substring(0,16)} />
                </GridCell>
            </Grid>
        </Card>)
    }

    renderStatus(quote) {
        if (quote.status.code == "WON") {
            return <span className="uk-badge md-bg-green-600">{super.translate(_.capitalize(quote.status.name))}</span>
        } else if (quote.status.code == "PARTIAL_WON") {
            return <span className="uk-badge md-bg-green-400">{super.translate(_.capitalize(quote.status.name))}</span>
        } else if (quote.status.code == "OPEN") {
            return <span className="uk-badge md-bg-blue-500">{super.translate(_.capitalize(quote.status.name))}</span>
        } else if (quote.status.code == "CANCELED") {
            return <span className="uk-badge uk-badge-muted">{super.translate(_.capitalize(quote.status.name))}</span>
        } else if (quote.status.code == "LOST") {
            return <span className="uk-badge md-bg-red-600">{super.translate(_.capitalize(quote.status.name))}</span>
        } else if (quote.status.code == "PDF_CREATED") {
            let statusName = super.translate(_.capitalize(quote.status.name));
            statusName = statusName.replace("Pdf", "PDF");
            return <span className="uk-badge md-bg-blue-700">{statusName}</span>
        }
        else {
            return null;
        }
    }

    renderType(quote) {
        let shipmentLoadingType = null;

        if ("SPOT" === quote.type.code && ("SEA" === quote.serviceArea.code || "ROAD" === quote.serviceArea.code)) {
            shipmentLoadingType = _.get(_.first(quote.products),'shipmentLoadingType.name');
        }

        return (<div>
                    {this.printType(quote)}
                    <sup className="uk-text-bold uk-text-italic" style={{padding: "4px"}}>{shipmentLoadingType}</sup>
                </div>)
    }

    printType(quote){
        if (quote.type.code == "SPOT") {
            return <span className="uk-badge uk-badge-primary">{super.translate(_.capitalize(quote.type.name))}</span>
       } else if (quote.type.code == "LONG_TERM") {
           return <span className="uk-badge uk-badge-warning">{super.translate(_.capitalize(quote.type.name))}</span>
       } else if (quote.type.code == "TENDER") {
           return <span className="uk-badge uk-badge-danger">{super.translate(_.capitalize(quote.type.name))}</span>
       } else if (quote.type.code == "CONTRACT") {
           return <span className="uk-badge md-bg-purple-350">{super.translate(_.capitalize(quote.type.name))}</span>
    } else {
           return null;
       }
    }
}

QuoteCard.contextTypes = {
    getUsers: PropTypes.func,
    getAllUsers: PropTypes.func,
    user: PropTypes.object,
    router: PropTypes.object,
    translator: PropTypes.object
};