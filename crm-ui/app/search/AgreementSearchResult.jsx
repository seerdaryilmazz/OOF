import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button, Notify } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";
import { AgreementService } from "../services";

export class AgreementSearchResult extends TranslatingComponent{
    constructor(props){
        super(props);
    }

    navigateToView(e, item){
        e.preventDefault();
        AgreementService.validateViewAgreementAuthorization(item.id)
        .then(response=>this.context.router.push(`/ui/crm/agreement/view/${item.id}`))
        .catch(error=>Notify.showError(error));
    }

    render(){
        let item = this.props.agreement;
        let list = [];
        item.serviceAreas.forEach(serviceArea =>{
            list.push(serviceArea.name);
        });
        let serviceAreasString = list.join(", ");
        return (
            <li key={"agreement-" + item.id} style={{margin: "0px", minHeight: "34px"}}>
                <Grid>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-avatar-wrapper">
                            <span className="md-card-list-item-avatar md-bg-red">AG</span>
                        </div>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{item.number}</span>
                        </div>
                    </GridCell>
                    <GridCell width="2-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{item.name}</span>
                        </div>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{item.startDate}</span>
                        </div>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{item.endDate}</span>
                        </div>
                    </GridCell>
                    <GridCell width="3-10" noMargin={true}>
                        <div className="md-card-list-item-subject-wrapper">
                            <span>{serviceAreasString}</span>
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

AgreementSearchResult.contextTypes = {
    translator: PropTypes.object,
    router: PropTypes.object.isRequired
};