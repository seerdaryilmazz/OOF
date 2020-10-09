import React from "react";
import PropTypes from 'prop-types';
import {Grid, GridCell} from "susam-components/layout";
import {TranslatingComponent} from "susam-components/abstract";
import {Button} from "susam-components/basic";

export class OpportunitySearchResult extends TranslatingComponent {
    constructor(props){
        super(props);
    }

    navigateToView(e, item){
        console.log(e, item);
        e.preventDefault();
        this.context.router.push(`/ui/crm/opportunity/view/${item.id}`);
    }

    render(){
        let item = this.props.opportunity;
        return (
            <li key={"opportunity-" + item.id} style={{margin: "0px", minHeight: "34px"}}>
                <Grid>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-avatar-wrapper">
                            <span className="md-card-list-item-avatar md-bg-purple">OP</span>
                        </div>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{item.number}</span>
                        </div>
                    </GridCell>
                    <GridCell width="3-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{item.name}</span>
                        </div>
                    </GridCell>
                    <GridCell width="2-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{item.serviceArea.name}</span>
                        </div>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{item.status.name}</span>
                        </div>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{item.opportunityOwner}</span>
                        </div>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="uk-align-right">
                            <Button name = {super.translate("View")} icon="eye" flat={true}
                                    size="small"  onclick = {(e) => this.navigateToView(e, item)} />
                        </div>
                    </GridCell>
                </Grid>
            </li>
        );
    }
}

OpportunitySearchResult.contextTypes = {
    translator: PropTypes.object,
    router: PropTypes.object.isRequired
};