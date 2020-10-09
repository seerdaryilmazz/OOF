import React from "react";
import { Grid, GridCell } from "susam-components/layout";
import uuid from "uuid";
import {
    AccountList,
    AccountStatistics,
    ActivityCalendar,
    ActivityStatistics,
    OpportunityList, OpportunityStatistics,
    QuoteList,
    QuoteStatistics
} from "./homeComponents";

export class HomeMobile extends React.Component {
    render() {
        return (<BottomTab labels={["Home", "Activities", "Opportunities", "Quotes", "Accounts"]} active="Home">
            <div>
                <Grid>
                    <GridCell width="1-5">
                        <AccountStatistics />
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
                        <ActivityStatistics />
                    </GridCell>
                </Grid>
            </div>
            <div>
                <ActivityCalendar />
            </div>
            <div>
                <OpportunityList />
            </div>
            <div>
                <QuoteList />
            </div>
            <div>
                <AccountList />
            </div>
        </BottomTab>);
    }
}

var onTabChange = null
export class BottomTab extends React.Component {
    constructor(props) {
        super(props);
        if (props.id) {
            this.state = { id: props.id };
        } else {
            this.state = { id: uuid.v4() };
        }
        onTabChange = (e, active, previous) => props.onTabChange && props.onTabChange(e, active, previous);
    }

    componentDidMount() {
        this.refresh();
        $('[data-uk-tab]').on('change.uk.tab', onTabChange);
    }

    componentDidUpdate() {
        this.refresh();
    }
    refresh() {
        UIkit.domObserve('#' + this.state.id, function (element) { });
    }

    render() {
        let children = this.props.children;
        let labels = this.props.labels;
        let active = this.props.active;

        let connectParam = this.state.id + "-connect";
        let paramDataUkTab = { connect: "#" + connectParam, animation: "slide-horizontal" };

        return (
            <div id={this.state.id} data-uk-observe>
                <ul id={connectParam} className="uk-switcher uk-margin">
                    {React.Children.map(children, (child, index) => <li key={index}>{child}</li>)}
                </ul>
                <nav className="uk-navbar" style={{ position: "fixed", right: "0", left: "0", bottom: "0", display: "flex", justifyContent:"space-between" }}>
                    <ul className="uk-navbar-nav" data-uk-tab={JSON.stringify(paramDataUkTab)}>
                        {labels.map((label) => <li key={label} className={active === label ? "uk-active" : ""}><a href="#">{label}</a></li>)}
                    </ul>
                </nav>
            </div>
        );
    }
}