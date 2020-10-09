import * as axios from 'axios';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { DateRange } from 'susam-components/advanced';
import { Button, DropDown, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, Pagination } from 'susam-components/layout';

export class UserLoginSearch extends TranslatingComponent {
    state = {
        data: {}
    };
    constructor(props) {
        super(props);
        this.search();
        const params = { username: props.username };
        axios.get(`/user-service/users-login/lookup/client-id`, { params })
            .then(response => this.setState({ clients: response.data.map(i=>({id:i, name:i})) }));
    }

    search(page = 0){
        const params = _.pickBy({
            username: this.props.username,
            clientId: _.get(this.state.clientId,'id'),
            startDate: _.get(this.state.dateRange, 'startDate'),
            endDate: _.get(this.state.dateRange, 'endDate'),
            page: page,
        });
        axios.get(`/user-service/users-login`, { params })
            .then(response => this.setState({ data: response.data }))
            .catch(error=>Notify.showError(error));
    }

    render(){
        return (
            <Grid>
                <GridCell width="1-4">
                    <DropDown options="clients" value={this.state.clientId} 
                        options={this.state.clients} label="Client"
                        onchange={clientId=>this.setState({clientId})} />
                </GridCell>
                <GridCell width="2-4">
                    <DateRange value={this.state.dateRange} hideIcon={true} 
                        onchange={dateRange=>this.setState({dateRange})} 
                        startDateLabel="Start" endDateLabel="End" />
                </GridCell>
                <GridCell width="1-4">
                    <Button label="search" style="primary" onclick={()=>this.search()} />
                </GridCell>
                <GridCell>
                    <DataTable.Table data={this.state.data.content}>
                        <DataTable.Text field="clientId" header="Client" />
                        <DataTable.Text field="loginTime" header="Login Time" />
                    </DataTable.Table>
                    <Pagination totalElements={this.state.data.totalElements}
                        page={this.state.data.number+1}
                        totalPages={this.state.data.totalPages}
                        onPageChange={page => this.search(page-1)}
                        range={5}/>
                </GridCell>
            </Grid>
        );
    }
}