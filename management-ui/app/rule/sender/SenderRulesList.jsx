import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Loader, CardSubHeader, ListHeading} from "susam-components/layout";
import {Notify, TextInput, Button, Span, TruncateText} from 'susam-components/basic';


export class SenderRulesList extends TranslatingComponent{
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){

    }

    handleSelection(e, item){
        e.preventDefault();
        this.props.onselect && this.props.onselect(item);
    }

    listLocations(item) {

        if(!item.loadingPlaces) {
            return null;
        }
        
        return (
            item.loadingPlaces.map(i => {
                let key =  (i.company ? i.company.id : "company") + (i.location ? i.location.id : "location");
                let locationName = i.location ? i.location.name : "";
                let companyName = i.company ? i.company.name : "";
                return (
                    <span key={key}
                          className="uk-text-small uk-text-muted uk-margin-small-top"
                          data-uk-tooltip="{cls:'long-text'}"
                          title={companyName}>
                        {locationName}
                    </span>
                )
            })
        );
    }

    handleDeleteButtonClick(item){
        this.props.ondelete && this.props.ondelete(item);
    }

    render(){
        if(!this.props.data || this.props.data.length == 0){
            return <div>{super.translate("There are no sender rules")}</div>;
        }else{
            return(
                <div style = {{width: "100%"}}>
                    <ul className="md-list md-list-centered">
                        {this.props.data.map(item => {
                            let className = this.props.selectedItem && this.props.selectedItem.id == item.id ? "active-list-element" : "";
                            return (
                                <li key = {item.id} onClick = {(e) => this.handleSelection(e, item)}
                                    className={className}>
                                    <div className = "md-list-content">
                                        <Grid>
                                            <GridCell>
                                                <ListHeading title = {item.sender.name}
                                                             value = {item.sender.name} />
                                                {this.listLocations(item)}
                                            </GridCell>
                                        </Grid>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        }
    }
}