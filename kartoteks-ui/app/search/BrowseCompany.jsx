import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button, Notify } from "susam-components/basic";
import { Grid, GridCell, Loader, PageHeader } from "susam-components/layout";
import { withAuthorization } from '../security';
import { CompanyService } from '../services/KartoteksService';



export class BrowseCompany extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {page: 1, size: 12};
    }

    findCountryAggregates(){
        this.setState({busy: true});
        CompanyService.countryAggregates().then(response => {
            this.setState({aggregates: response.data, busy: false});
        }).catch(error => {
            Notify.showError(error);
            this.setState({aggregates: [], busy: false});
        });
    }

    searchByCountry(){
        this.setState({busy: true});
        let params = {country: this.state.selectedCountry, page: this.state.page, size: this.state.size};
        CompanyService.searchByCountry(params).then(response => {
            this.setState({result: response.data, busy: false});
        }).catch(error => {
            Notify.showError(error);
            this.setState({busy: false});
        });

    }
    componentDidMount(){
        this.findCountryAggregates();
    }
    componentWillReceiveProps(){

    }
    navigateToEdit(e, item){
        e.preventDefault();
        this.context.router.push("/ui/kartoteks/company/" + item.id + "/edit");
    }
    navigateToMerge(e, item){
        e.preventDefault();
        this.context.router.push("/ui/kartoteks/company/" + item.id + "/merge");
    }
    navigateToView(e, item){
        e.preventDefault();
        this.context.router.push("/ui/kartoteks/company/" + item.id);
    }
    navigateToRefs(e, item){
        e.preventDefault();
        this.context.router.push("/ui/kartoteks/company/" + item.id + "/refs");
    }
    deleteCompany(e, item){
        e.preventDefault();
        CompanyService.deleteCompany(item.id).then(response => {
            Notify.showSuccess("Company deleted successfully");
        }).catch(error => {
            Notify.showError(error);
        })
    }
    forceDeleteCompany(e, item){
        e.preventDefault();
        UIkit.modal.confirm("This operation will delete all company data and potentially break integration with other software systems, Are you sure ?", () => {
            CompanyService.forceDeleteCompany(item.id).then(response => {
                Notify.showSuccess("Company deleted successfully");
            }).catch(error => {
                Notify.showError(error);
            })
        });
    }
    handleExportClick(e, item){
        e.preventDefault();
        CompanyService.exportCompany(item).then(response => {
            Notify.showSuccess("Company exported");
        }).catch(error => {
            Notify.showError(error);
        })
    }
    previousPage(){
        this.setState({page: --this.state.page});
        this.searchByCountry();
    }
    nextPage(){
        this.setState({page: ++this.state.page});
        this.searchByCountry();
    }

    selectCountryTag(e, country){
        e.preventDefault();
        this.setState({selectedCountry: country}, () => this.searchByCountry());
    }

    renderSearchResultItem(item){
        let deleteMenuItem = null;
        if(item.deletable){
            deleteMenuItem = <SecuredDeleteItem name = {super.translate("Delete")} icon="trash-o"
                                                onclick = {(e) => this.deleteCompany(e, item)} />;
        }else{
            deleteMenuItem = <SecuredForceDeleteItem name = {super.translate("Force Delete")} icon="trash"
                                                          onclick = {(e) => this.forceDeleteCompany(e, item)} />;
        }
        let defaultLocation = _.find(item.locations, {default:true});
        let defaultAddress = "";
        if(defaultLocation){
            defaultAddress = defaultLocation.formattedAddress;
        }
        let logoUrl = baseResourceUrl + "/assets/img/logo-placeholder.png";
        if(item.logoFilePath){
            logoUrl = baseResourceUrl + "/company-images/" + item.logoFilePath;
        }
        let absoluteWebsiteUrl = item.website;
        if(absoluteWebsiteUrl){
            if(absoluteWebsiteUrl.length > 4 && absoluteWebsiteUrl.substr(0,4) != "http"){
                absoluteWebsiteUrl = "http://" + item.website;
            }
        }
        return (
            <GridCell key = {item.id} width="1-3" widthSmall="1-1" widthLarge="1-4">
                <div className="md-card">
                    <div className="md-card-head head-background" style={{backgroundImage: 'url(' + logoUrl + ')', padding: "12px"}}>
                        <div className="md-card-head-menu" data-uk-dropdown="{pos:'bottom-right'}" aria-haspopup="true" aria-expanded="false">
                            <i className="md-icon material-icons md-icon-dark"></i>
                            <div className="uk-dropdown uk-dropdown-small uk-dropdown-bottom" style={{minWidth: "160px", top: "32px", left: "-128px"}}>
                                <ul className="uk-nav">
                                    <MenuItem name = {super.translate("View")} icon="eye" onclick = {(e) => this.navigateToView(e, item)} />
                                    <SecuredEditItem name = {super.translate("Edit")} icon="pencil" onclick = {(e) => this.navigateToEdit(e, item)} />
                                    <SecuredMergeItem name = {super.translate("Merge")} icon="compress" onclick = {(e) => this.navigateToMerge(e, item)} />
                                    <MenuItem name = {super.translate("References")} icon="key" onclick = {(e) => this.navigateToRefs(e, item)} />
                                    {deleteMenuItem}
                                    <SecuredExportItem name = {super.translate("Export")} icon="share" onclick = {(e) => this.handleExportClick(e, item)} />
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="md-card-content" style={{minHeight: "85px"}}>
                        <ul className="md-list">
                            <li>
                                <div className="md-list-content">
                                    <span className="md-list-heading">{item.name}</span>
                                    <span className="uk-text-small uk-text-muted">{defaultAddress}</span>
                                    <span className="uk-text-small uk-text-muted"><a target="_blank" href={absoluteWebsiteUrl}>{item.website}</a></span>
                                </div>
                            </li>

                        </ul>
                    </div>
                </div>

            </GridCell>
        );
    }

    render(){
        if(this.state.busy){
            return <Loader title="Searching"/>
        }
        if(!this.state.aggregates){
            return null;
        }
        let title = "Browse By Country";
        let countryTags = [];
        _.forEach(this.state.aggregates, (value, key) => {
            let className = "";
            if(key == this.state.selectedCountry){
                className = "uk-active";
            }
            countryTags.push(<li key={key} className={className} aria-expanded="true">
                <a href="#" onClick = {(e) => this.selectCountryTag(e, key)}>{_.capitalize(key) + " " + value}</a>
            </li>);
        });

        let nextPage = null;
        let prevPage = null;
        let resultItems = null;
        let summary = "";
        let pageInfo = "";
        if(this.state.result){
            if(!this.state.result.last){
                nextPage = <Button label="Next Page" style="primary" size="medium" waves = {true} onclick = {() => this.nextPage()}/>;
            }
            if(!this.state.result.first){
                prevPage = <Button label="Previous Page" style="primary" size="medium" waves = {true} onclick = {() => this.previousPage()}/>
            }
            pageInfo = (this.state.result.number + 1) + "/" + this.state.result.totalPages;
            resultItems = this.state.result.content.map(item => {
                return this.renderSearchResultItem(item);
            })
        }

        return (
            <div>
                <PageHeader title={title}/>
                <Grid>
                    <GridCell width="1-1">
                        <ul className="uk-subnav uk-subnav-pill">
                            {countryTags}
                        </ul>
                    </GridCell>
                    <GridCell width="1-1">
                        <Grid>
                            {resultItems}
                            <GridCell width="1-1">
                                <Grid>
                                    <GridCell width="1-4"/>
                                    <GridCell width="1-4" textCenter = {true}>
                                        {prevPage}
                                    </GridCell>
                                    <GridCell width="1-4" textCenter = {true}>
                                        {nextPage}
                                    </GridCell>
                                    <GridCell width="1-4">
                                        <div className="uk-align-right">
                                            <h3>{pageInfo}</h3>
                                        </div>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}
BrowseCompany.contextTypes = {
    router: PropTypes.object.isRequired
};

class MenuItem extends React.Component{
    render(){
        let styleClassName = this.props.style ? ("uk-text-" + this.props.style) : "";
        return(
            <li>
                <a href="#" onClick = {(e) => this.props.onclick(e)}>
                    <i className={"uk-icon-" + this.props.icon + " uk-icon-medsmall " + styleClassName}/>
                    <span className = {"uk-margin-left " + styleClassName}>{this.props.name}</span>
                </a>
            </li>
        );
    }
}

const SecuredDeleteItem = withAuthorization(MenuItem, "kartoteks.company.delete-company", {hideWhenNotAuthorized:true});
const SecuredForceDeleteItem = withAuthorization(MenuItem, "kartoteks.company.force-delete-company", {hideWhenNotAuthorized:true});
const SecuredEditItem = withAuthorization(MenuItem, "kartoteks.company.edit-company", {hideWhenNotAuthorized:true});
const SecuredMergeItem = withAuthorization(MenuItem, "kartoteks.company.merge-with-company", {hideWhenNotAuthorized:true});
const SecuredExportItem = withAuthorization(MenuItem, "kartoteks.company.export-company", {hideWhenNotAuthorized:true});