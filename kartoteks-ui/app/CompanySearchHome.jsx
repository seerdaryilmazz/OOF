import React from "react";
import _ from "lodash";

import {Card, Grid, GridCell, Loader, PageHeader} from "susam-components/layout";
import {TranslatingComponent} from "susam-components/abstract";
import {TextInput, Button, Notify} from "susam-components/basic";

import {CompanySearchResults} from './CompanySearchResults';

import {CompanyService} from './services/KartoteksService';

export class CompanySearchHome extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.state = {page: 1, size: 10};
    }

    handleSearch(){
        this.setState({busy: true});
        if(this.state.searchText){
            let params = {q: this.state.searchText, page: this.state.page, size: this.state.size};
            CompanyService.search(params).then(response => {
                this.setState({results: response.data, busy: false});
            }).catch(error => {
                Notify.showError(error);
                this.setState({results: {}, busy: false});
            });
        }
    }
    previousPage(){
        this.setState({page: --this.state.page}, () => this.handleSearch());
    }
    nextPage(){
        this.setState({page: ++this.state.page}, () => this.handleSearch());
    }
    renderResults(){
        if(this.state.busy){
            return <Loader title="Searching"/>
        }
        return <CompanySearchResults results = {this.state.results}
                                     onPreviousPage = {() => this.previousPage()}
                                     onNextPage = {() => this.nextPage()}/>
    }
    render(){
        return (
            <div>
                <PageHeader title="Company Search"/>
                <Grid>
                    <GridCell width = "3-4" center = {true}>
                        <Card>
                            <Grid>
                                <GridCell width="1-2">
                                    <TextInput value = {this.state.searchText} placeholder = "search a company..."
                                               onchange = {(value) => this.setState({searchText: value})} />
                                </GridCell>
                                <GridCell width="1-2">
                                    <div className = "uk-margin-top">
                                        <Button label="Search" style = "success" size = "small"
                                                onclick = {() => this.handleSearch()} />
                                    </div>
                                </GridCell>
                                <GridCell width="1-1">
                                    {this.renderResults()}
                                </GridCell>
                            </Grid>
                        </Card>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}