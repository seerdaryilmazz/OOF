import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";

export class ContactSearchResult extends TranslatingComponent{

    constructor(props){
        super(props);
    }

    navigateToView(e, item){
        e.preventDefault();
        this.context.router.push(`/ui/crm/account/${item.account.id}/view`);
    }

    render(){
        let item = this.props.contact;
        return (

            <li key={"contact-" + item.id} style={{margin: "0px", minHeight: "34px"}}>
                <Grid>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-avatar-wrapper">
                            <span className="md-card-list-item-avatar md-bg-cyan">Co</span>
                        </div>
                    </GridCell>
                    <GridCell width="4-10" noMargin={true}>
                        <div className="md-card-list-item-subject">
                            <span>{item.firstName + ' ' + item.lastName }</span>
                        </div>
                    </GridCell>
                    <GridCell width="4-10" noMargin={true}>
                        <div className="md-card-list-item-subject">
                            <span>{item.account.name}</span>
                        </div>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="uk-align-right">
                            <Button name = {super.translate("View")} icon="eye"flat={true}
                                    size="small"  onclick = {(e) => this.navigateToView(e, item)} />
                        </div>

                    </GridCell>
                </Grid>
            </li>
        );
    }
}
ContactSearchResult.contextTypes = {
    router: PropTypes.object.isRequired
};
