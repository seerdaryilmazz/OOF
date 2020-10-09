import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";
import { withAuthorization } from './security';



export class CompanySearchResults extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {};
    }

    navigateToEdit(item){
        this.context.router.push(`/ui/kartoteks/company/${item.id}/edit`);
    }
    navigateToView(item){
        this.context.router.push(`/ui/kartoteks/company/${item.id}`);
    }
    previousPage(){
        this.props.onPreviousPage();
    }
    nextPage(){
        this.props.onNextPage();
    }

    renderSearchResultItem(item){

        let defaultLocation = _.find(item.locations, {default:true});
        let defaultAddress = "";
        if(defaultLocation){
            defaultAddress = defaultLocation.formattedAddress;
        }

        return (
            <li key = {item.id}>
                <Grid>
                    <GridCell width = "4-5">
                        <span className="md-list-heading">{item.name}</span>
                        <span className="uk-text-small uk-text-muted" style = {{display: "block"}}>{defaultAddress}</span>
                    </GridCell>
                    <GridCell width = "1-5">

                            <SecuredEditButton label="edit" flat = {true} size = "small" style = "primary"
                                               onclick = {() => this.navigateToEdit(item)} />
                            <Button label="view" flat = {true} size = "small" style = "primary"
                                    onclick = {() => this.navigateToView(item)} />

                    </GridCell>
                </Grid>

            </li>
        );
    }

    render(){
        if(!this.props.results){
            return null;
        }
        let nextPage = null;
        let prevPage = null;
        if(!this.props.results.last){
            nextPage = <Button label="Next Page" style="primary" size="small" onclick = {() => this.nextPage()}/>;
        }
        if(!this.props.results.first){
            prevPage = <Button label="Previous Page" style="primary" size="small" onclick = {() => this.previousPage()}/>
        }
        let summary = null;
        let pageInfo = null;
        if(this.props.results.totalElements > 0){
            summary = this.props.results.totalElements + " results, " + this.props.results.totalPages + " pages";
            pageInfo = (this.props.results.number + 1) + "/" + this.props.results.totalPages;
            summary = summary + ", showing " + pageInfo;
        }else{
            summary = "No results";
        }
        let results = [];
        if(this.props.results.content){
            results = this.props.results.content.map(item => {
                return this.renderSearchResultItem(item);
            })
        }
        return (

                    <Grid>
                        <GridCell width = "1-4">
                            {summary}
                        </GridCell>
                        <GridCell width = "3-4"/>
                        <GridCell width="1-1">
                            <ul className = "md-list">
                                {results}
                            </ul>
                        </GridCell>
                        <GridCell width="1-4"/>
                        <GridCell width="1-4" textCenter = {true}>
                            {prevPage}
                        </GridCell>
                        <GridCell width="1-4" textCenter = {true}>
                            {nextPage}
                        </GridCell>
                        <GridCell width="1-4"/>
                    </Grid>

        );
    }
}
CompanySearchResults.contextTypes = {
    router: PropTypes.object.isRequired
};

const SecuredEditButton = withAuthorization(Button, "kartoteks.company.edit-company", {hideWhenNotAuthorized:true});