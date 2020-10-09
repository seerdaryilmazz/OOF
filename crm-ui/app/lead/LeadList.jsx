import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, Pagination } from "susam-components/layout";
import { CrmLeadService } from "../services";
import { ActionHeader } from '../utils/ActionHeader';

export class LeadList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            leads:{},
            searchParams:{}
        };
    }


    componentDidMount() {
        this.initialize();
    }

    initialize() {
        this.setState({busy: true});
        this.search();
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.serviceArea !== this.props.serviceArea){

        }
    }


    handleView(data){
        this.context.router.push(`/ui/crm/lead/view/${data.id}`);
    }



    showOrHideSearchPanel() {
        $(this.searchPanel).slideToggle('slow');
    }

    getActionHeaderTools(){
        let actionHeaderTools = [];
        actionHeaderTools.push({icon: "search", flat: true, items: [{label: "", onclick: () => this.showOrHideSearchPanel()}]});
        return actionHeaderTools;
    }

    search(pageNumber) {
        CrmLeadService.getLeads({page: pageNumber}).then(response => {
            let leads = response.data;
            this.setState({leads: leads, readOnly: false, busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }


    updateSearchParams(propertyKey, propertyValue) {
        let searchParams = _.cloneDeep(this.state.searchParams);
        _.set(searchParams, propertyKey, propertyValue);
        this.setState({searchParams: searchParams});
    }




    renderDataTable(){

        let content;
        let title = "LEADS";

        if (_.isEmpty(this.state.leads)){
            return (
                <Grid divider = {true}>
                    <GridCell width = "1-1" margin="small">
                        {super.translate("No lead")}
                    </GridCell>
                </Grid>
            )
        }else {
            content = (

                <DataTable.Table data={this.state.leads.content}>
                    <DataTable.Text header="Number" field="number"  />
                    <DataTable.Text header="Status" translator={this} field="status" printer={new StatusPrinter(this.context.translator)}/>
                    <DataTable.Text header="Service Area" translator={this} field="serviceArea.name"  />
                    <DataTable.Text header="Sector" translator={this} field="sector.name"  />
                    <DataTable.Text header="Name" translator={this} field="name"  width="10"/>
                    <DataTable.Text header="Surname" translator={this} field="surname" width="20"/>
                    <DataTable.Text header="Company Name" translator={this} field="companyName" width="20"/>
                    <DataTable.Text header="Responsible" field="responsibleUser.displayName" width="20"/>
                    <DataTable.Text header="Create Date" field="createdAt" width="20" printer={new DatePrinter()}/>

                    <DataTable.ActionColumn>
                        <DataTable.ActionWrapper key="viewLead" track="onclick" onaction = {(data) => this.handleView(data)}>
                            <Button icon="eye" size="small"/>
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                </DataTable.Table>

            );
        }

        return (
            <GridCell width="1-1">
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <ActionHeader title={title} />
                        </GridCell>
                        <GridCell width="1-1">
                            {content}
                        </GridCell>
                        <GridCell width="1-1">
                            <Pagination totalElements={this.state.leads.totalElements}
                                        page={this.state.leads.number+1}
                                        totalPages={this.state.leads.totalPages}
                                        onPageChange={(pageNumber) => this.search(pageNumber-1)}
                                        range={10}/>
                        </GridCell>
                    </Grid>
                </Card>
            </GridCell>
        );
    }


    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <Grid>
                        {this.renderDataTable()}
                    </Grid>
                </GridCell>
            </Grid>
        )

    }
}

LeadList.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    router: PropTypes.object.isRequired,
    translator: PropTypes.object,
    user: PropTypes.object
};


class DatePrinter {
    constructor(){
    }
    print(data){
        if(data){
            data=data.substring(0,16);
            return data;
        }
    }
}

class StatusPrinter {

    constructor(translator){
        this.translator = translator;
    }

    translate(value){
        return this.translator ? this.translator.translate(value) : value;
    }

    statusStyles = {
        COMPLETED: "success",
        OPEN: "primary",
        CANCELLED: "muted",
        CANCELED: "muted"
    }

    print(data){
        let code = _.get(data, 'code');
        let name = _.get(data, 'name');
        return <span className={`uk-badge uk-badge-${this.statusStyles[code]}`}>{this.translate(name)}</span>
    }
}
