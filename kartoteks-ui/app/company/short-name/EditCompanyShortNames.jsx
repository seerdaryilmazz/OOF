import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button, Checkbox, Notify, Span, TextInput } from "susam-components/basic";
import { Card, CardHeader, Grid, GridCell, Loader, PageHeader } from "susam-components/layout";
import { CompanyService } from '../../services/KartoteksService';



export class EditCompanyShortNames extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {companies: {}, query: "", shortNameChecked: false, page: 1, size: 10};
    }

    newSearch(){
        this.setState({page: 1}, () => this.search(this.props.query));
    }

    search(){
        this.setState({busy: true});
        let params = {q: this.state.query, shortNameChecked: this.state.shortNameChecked, page: this.state.page, size: this.state.size};
        CompanyService.searchPrefix(params).then(response => {
            this.setState({result: response.data, busy: false});
        }).catch(error => {
            Notify.showError(error);
            this.setState({result: {}, busy: false});
        });
    }
    componentDidMount(){
        this.search();
    }
    componentWillReceiveProps(nextProps){

    }
    navigateToView(item){
        this.context.router.push(`/ui/kartoteks/company/${item.id}`);
    }
    navigateToEdit(item){
        this.context.router.push(`/ui/kartoteks/company/${item.id}/edit`);
    }

    previousPage(){
        this.setState({page: --this.state.page}, () => this.search(this.props.query));
    }
    nextPage(){
        this.setState({page: ++this.state.page}, () => this.search(this.props.query));
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }
    handleCompanySave(company){
        let result = _.cloneDeep(this.state.result);
        let foundCompany = _.find(result.content, {id: company.id});
        let request = {companyId: foundCompany.id, shortName: foundCompany.shortName, locationShortNames: {}};
        foundCompany.locations.forEach(location => {
            request.locationShortNames["" + location.id] = location.name;
        });
        CompanyService.updateShortNames(foundCompany.id, request).then(response => {
            foundCompany.shortNameChecked = true;
            foundCompany.locations.forEach(location => location.shortNameChecked = true);
            this.setState({result: result});
            Notify.showSuccess("Company saved");
        }).catch(error => {
            Notify.showError(error);
        });

    }
    updateCompanyState(company, key, value){
        let result = _.cloneDeep(this.state.result);
        let foundCompany = _.find(result.content, {id: company.id});
        if(foundCompany){
            foundCompany[key] = value;
        }
        this.setState({result: result});
    }
    updateLocationState(company, location, key, value){
        let result = _.cloneDeep(this.state.result);
        let foundCompany = _.find(result.content, {id: company.id});
        if(foundCompany){
            let foundLocation = _.find(foundCompany.locations, {id: location.id});
            if(foundLocation){
                foundLocation[key] = value;
            }
        }
        this.setState({result: result});
    }

    renderLocation(company, location){
        return(
            <GridCell width = "1-1" noMargin = {true} key = {location.id}>
                <Grid>
                    <GridCell width = "1-4">
                        <TextInput label="Location Name" value = {location.name} uppercase = {true}
                                   onchange = {(value) => this.updateLocationState(company, location, "name", value)}/>
                    </GridCell>
                    <GridCell width = "3-4">
                        <Span label="Address" value = {location.formattedAddress} />
                    </GridCell>
                </Grid>
            </GridCell>
        );
    }

    renderCompany(company){
        let icon = company.shortNameChecked ? <i className = "uk-icon-check uk-icon-medium md-color-light-green-600" /> : null;
        return (
            <GridCell width = "1-1" key = {company.id}>
                <CardHeader title = {company.name} />
                <Grid>
                    <GridCell width = "1-4" noMargin = {true}>
                        <TextInput label="Company Short Name" value = {company.shortName} uppercase = {true}
                                   onchange = {(value) => this.updateCompanyState(company, "shortName", value)}/>
                    </GridCell>
                    {company.locations.map(location => this.renderLocation(company, location))}
                    <GridCell width = "1-4" noMargin = {true}>
                        <div className = "uk-margin-top">
                            <Button label = "Save" style = "primary" size = "small"
                                    onclick = {() => this.handleCompanySave(company)} />
                            <Button label = "Edit" style = "success" size = "small" flat = {true}
                                    onclick = {() => this.navigateToEdit(company)} />
                            <Button label = "View" style = "success" size = "small" flat = {true}
                                    onclick = {() => this.navigateToView(company)} />
                            <span className = "uk-margin-left">{icon}</span>
                        </div>
                    </GridCell>
                </Grid>
            </GridCell>
        );
    }

    renderResults(){
        if(this.state.busy){
            return <Loader title="Searching"/>
        }
        if(!this.state.result){
            return null;
        }
        let nextPage = null;
        let prevPage = null;
        if(!this.state.result.last){
            nextPage = <Button label="Next Page" style="primary" size="medium" waves = {true} onclick = {() => this.nextPage()}/>;
        }
        if(!this.state.result.first){
            prevPage = <Button label="Previous Page" style="primary" size="medium" waves = {true} onclick = {() => this.previousPage()}/>
        }
        let summary = this.state.result.totalElements + " results, " + this.state.result.totalPages + " pages";
        let pageInfo = (this.state.result.number + 1) + ". page";
        let results = [];
        if(this.state.result.content){
            results = this.state.result.content.map(item => {
                return this.renderCompany(item);
            })
        }

        return (
            <Grid>

                <GridCell width="1-4">
                    <h3 className = "heading_c_thin">{summary}, {pageInfo}</h3>
                </GridCell>
                <GridCell width="3-4" />
                <GridCell width = "1-1">
                    <Grid>
                        {results}
                    </Grid>
                </GridCell>
                <GridCell width = "1-1">
                    <Grid>
                        <GridCell width="1-4"/>
                        <GridCell width="1-4">
                            {prevPage}
                        </GridCell>
                        <GridCell width="1-4">
                            {nextPage}
                        </GridCell>
                        <GridCell width="1-4" />
                    </Grid>
                </GridCell>
            </Grid>
        );
    }

    render(){

        let title = "Update Company Short Names";

        return (
            <div>
                <PageHeader title = {title} />
                <Card>
                    <Grid>
                        <GridCell width="1-2">
                            <TextInput label="Search Query" value = {this.state.query}
                                       onchange = {(value) => this.updateState("query", value)} />
                        </GridCell>
                        <GridCell width="1-4">
                            <div className="uk-margin-top">
                                <Checkbox label="Only checked companies" value = {this.state.shortNameChecked}
                                          onchange = {(value) => this.updateState("shortNameChecked", value)} />
                            </div>
                        </GridCell>
                        <GridCell width="1-4">
                            <div className="uk-margin-top">
                                <Button label="search" style = "primary" size = "small" onclick = {() => this.newSearch()} />
                            </div>
                        </GridCell>
                        <GridCell width = "1-1">
                            {this.renderResults()}
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}

EditCompanyShortNames.contextTypes = {
    router: PropTypes.object.isRequired
};