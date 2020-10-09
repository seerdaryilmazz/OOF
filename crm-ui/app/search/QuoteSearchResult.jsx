import React from "react";
import PropTypes from 'prop-types';
import {Grid, GridCell} from "susam-components/layout";
import {TranslatingComponent} from "susam-components/abstract";
import {Button} from "susam-components/basic";

export class QuoteSearchResult extends TranslatingComponent{

    constructor(props){
        super(props);
    }

    navigateToView(e, item){
        e.preventDefault();
        this.context.router.push(`/ui/crm/quote/view/${item.id}`);
    }

    render(){
        let item = this.props.quote;
        let name=item.name.substring(item.name.indexOf('From')); //Deletes everything before 'From'

        return (
            <li key={"quote-" + item.id} style={{margin: "0px", minHeight: "34px"}}>
                <Grid>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-avatar-wrapper">
                            <span className="md-card-list-item-avatar md-bg-light-green">QU</span>
                        </div>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{item.number}</span>
                        </div>
                    </GridCell>
                    <GridCell width="3-10" noMargin={true}>
                        <Grid collapse={true}>
                            <GridCell width="1-3" noMargin={true}>
                                <div className="md-card-list-item-subject-wrapper">
                                    <span>{!_.isEmpty(item.mappedIds)? item.mappedIds.QUADRO : null}</span>
                                </div>
                            </GridCell>
                            <GridCell width="2-3" noMargin={true}>
                                <div className="md-card-list-item-subject-wrapper">
                                    <span>{name}</span>
                                </div>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{item.type.name}</span>
                        </div>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
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
                            <span>{item.createdBy}</span>
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
QuoteSearchResult.contextTypes = {
    router: PropTypes.object.isRequired
};
