import React from "react";
import { Helmet } from "react-helmet";
import { TranslatingComponent } from 'susam-components/abstract';
import { Grid, GridCell } from 'susam-components/layout';
import { Tasks } from 'susam-components/task';
import {
    AccountList,
    AccountStatistics,
    ActivityList,
    ActivityStatistics,
    OpportunityList, OpportunityStatistics,
    QuoteList
} from './homeComponents';
import { QuoteStatistics } from "./homeComponents/QuoteStatistics";
import PropTypes from "prop-types";



/**
 * TODO: Bu sayfaya menüden bir link ile erişmek istendiğinde link adresi olarak '/ui/crm/#/' verildiğinde,
 * bazen Tasks component'indeki sekmelerin içeriği boş geliyor. Link adresi olarak '/ui/crm/' verildiğinde
 * sorun yaşanmıyor. Ama henüz kökten bir çözüm bulamadık.
 */
export class HomeDesktop extends TranslatingComponent {

    constructor(props){
        super(props);
    }

    render() {
        return (
            <Grid>
                <Helmet>
                    <title>
                        {super.translate("Homepage") + " - Ekol OneOrder"}
                    </title>
                </Helmet>
                <GridCell width="1-5">
                    <AccountStatistics/>
                </GridCell>
                <GridCell width="1-5">
                    <OpportunityStatistics/>
                </GridCell>
                <GridCell width="1-5">
                    <QuoteStatistics quoteType="SPOT" backgroundColor="deepskyblue" />
                </GridCell>
                <GridCell width="1-5">
                    <QuoteStatistics quoteType="LONG_TERM" backgroundColor="orange" />
                </GridCell>
                <GridCell width="1-5">
                    <ActivityStatistics/>
                </GridCell>
                <GridCell width="1-1">
                    <Tasks/>
                </GridCell>
                <GridCell width="1-1">
                    <ActivityList/>
                </GridCell>
                <GridCell width="1-1">
                    <OpportunityList/>
                </GridCell>
                <GridCell width="1-1">
                    <QuoteList/>
                </GridCell>
                <GridCell width="1-1">
                    <AccountList/>
                </GridCell>
            </Grid>
        );
    }
}

HomeDesktop.contextTypes = {
    translator: PropTypes.object
};