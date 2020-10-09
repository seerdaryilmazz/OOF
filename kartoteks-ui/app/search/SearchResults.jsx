import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button, Notify } from "susam-components/basic";
import { Grid, GridCell, Loader } from "susam-components/layout";
import { withAuthorization } from '../security';
import { CompanyService } from '../services/KartoteksService';



export class SearchResults extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {page: 1, size: 10};
    }

    search(query){
        this.setState({busy: true});
        if(query && query.trim().length > 0){
            let params = {q: query, page: this.state.page, size: this.state.size};
            CompanyService.searchPrefix(params).then(response => {
                this.setState({result: response.data, busy: false});
            }).catch(error => {
                Notify.showError(error);
                this.setState({result: {}, busy: false});
            });
        }
    }
    componentDidMount(){
        this.search(this.props.query);
    }
    componentWillReceiveProps(nextProps){
        if(!_.isEqual(this.props.query, nextProps.query)){
            this.search(nextProps.query);
        }
    }
    navigateToEdit(e, item){
        e.preventDefault();
        this.context.router.push(`/ui/kartoteks/company/${item.id}/edit`);
    }
    navigateToMerge(e, item){
        e.preventDefault();
        // Seçilen şirket, diğer şirket ile birleştirilip silineceği için birleştirme adımına geçmeden önce kullanıcıyı uyaralım dedik.
        CompanyService.ensureCompanyCanBeDeleted(item.id, false).then(response => {
            this.context.router.push(`/ui/kartoteks/company/${item.id}/merge`);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    navigateToView(e, item){
        e.preventDefault();
        this.context.router.push(`/ui/kartoteks/company/${item.id}`);
    }
    navigateToRefs(e, item){
        e.preventDefault();
        this.context.router.push(`/ui/kartoteks/company/${item.id}/refs`);
    }
    handleExportClick(e, item){
        e.preventDefault();
        CompanyService.exportCompany(item).then(response => {
            Notify.showSuccess("Company exported");
        }).catch(error => {
            Notify.showError(error);
        })
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
    previousPage(){
        this.setState({page: --this.state.page});
        this.search(this.props.query);
    }
    nextPage(){
        this.setState({page: ++this.state.page});
        this.search(this.props.query);
    }

    renderSearchResultItem(item){
        let deleteMenuItem = null;
        if(item.deletable){
            deleteMenuItem = <SecuredDeleteItem name = {super.translate("Delete")} icon = "trash-o" onclick = {(e) => this.deleteCompany(e, item)} />;
        }else{
            deleteMenuItem = <SecuredForceDeleteItem name = {super.translate("Force Delete")} icon = "trash"
                                                     onclick = {(e) => this.forceDeleteCompany(e, item)} />;
        }
        let defaultLocation = _.find(item.locations, {default:true});
        let defaultAddress = "";
        if(defaultLocation){
            defaultAddress = defaultLocation.formattedAddress;
        }

        return (
            <li key = {item.id} style={{margin: "0px", minHeight: "34px"}} className="">
                <div className="md-card-list-item-menu" data-uk-dropdown="{mode:'click',pos:'bottom-right'}" aria-haspopup="true" aria-expanded="false">
                    <a href="#" className="md-icon material-icons"></a>
                    <div className="uk-dropdown uk-dropdown-small">
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
                <div className="md-card-list-item-avatar-wrapper">
                    <span className="md-card-list-item-avatar md-bg-grey">Co</span>
                </div>
                <div className="md-card-list-item-sender">
                    <span>{item.name}</span>
                </div>
                <div className="md-card-list-item-subject">
                    <span>{defaultAddress}</span>
                </div>
                <div className="md-card-list-item-content-wrapper" style={{display: "none", opacity: "0"}}>

                </div>
            </li>
        );
    }

    render(){
        if(this.state.busy){
            return <Loader title="Searching"/>
        }
        if(!this.state.result){
            return null;
        }
        let title = "Search";
        if(this.props.query){
            title += (": " + this.props.query);
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
        let pageInfo = (this.state.result.number + 1) + "/" + this.state.result.totalPages;
        let results = [];
        if(this.state.result.content){
            results = this.state.result.content.map(item => {
                return this.renderSearchResultItem(item);
            })
        }
        return (

            <div className="md-card-list-wrapper" id="mailbox">
                <div className="uk-width-large-8-10 uk-container-center">
                    <div className="md-card-list">
                        <div className="md-card-list-header heading_list"> {summary}</div>
                        <ul>
                            {results}
                        </ul>
                    </div>
                    <Grid>
                        <GridCell width="1-4"/>
                        <GridCell width="1-4">
                            {prevPage}
                        </GridCell>
                        <GridCell width="1-4">
                            {nextPage}
                        </GridCell>
                        <GridCell width="1-4">
                            <div className="uk-align-right">
                                <h3>{pageInfo}</h3>
                            </div>
                        </GridCell>
                    </Grid>
                </div>
            </div>
        );
    }
}
SearchResults.contextTypes = {
    router: PropTypes.object.isRequired
};

class MenuItem extends React.Component{
    render(){
        return (
            <li>
                <a href="#" onClick = {(e) => this.props.onclick(e)}>
                    <i className={"uk-icon-" + this.props.icon + " uk-icon-medsmall"}/> {this.props.name}
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