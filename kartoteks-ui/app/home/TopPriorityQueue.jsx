import PropTypes from 'prop-types';
import React from "react";
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, LoaderWrapper } from 'susam-components/layout';
import { withAuthorization } from '../security';
import { ImportQueueService } from '../services/KartoteksService';


const SecuredImportButton = withAuthorization(Button, "kartoteks.import-queue.import-company",{hideWhenNotAuthorized: true});

export class TopPriorityQueue extends React.Component {

    constructor(props){
        super(props);
        this.state = {busy: true};
    }

    componentDidMount(){
        this.topPriorityQueue();
    }

    topPriorityQueue(){
        ImportQueueService.topPriorityQueue().then(response => {
            this.setState({data: response.data, busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleImportClick(queue){
        if(queue.companyId){
            this.context.router.push('/ui/kartoteks/company/' + queue.companyId + '/merge-with-queue/' + queue.id);
        }else{
            this.context.router.push('/ui/kartoteks/import-queue/' + queue.id);
        }
    }

    render(){

        return (
            <LoaderWrapper title="Fetching queue" busy = {this.state.busy}>
                <Card title="Top Priority Import Queue">
                    <DataTable.Table data={this.state.data}
                                     editable = {false} insertable = {false} filterable = {false} sortable = {true}>
                        <DataTable.DateTime header="Created At" width="10" sortable = {true} reader = {new SimpleDateReader()}/>
                        <DataTable.Badge header="Operation" width="10" sortable = {true} reader = {new QueueOpReader()}/>
                        <DataTable.Text field="companyName" header="Company Name" width="50" sortable = {true} />
                        <DataTable.ActionColumn width="10">
                            <DataTable.ActionWrapper track="onclick" onaction = {(data) => this.handleImportClick(data)}>
                                <SecuredImportButton label="import" flat = {true} style="primary" size="small" />
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </Card>
            </LoaderWrapper>
        );
    }
}

TopPriorityQueue.contextTypes = {
    router: PropTypes.object.isRequired
};


class SimpleDateReader{
    readCellValue(row) {
        return row.createDate ? row.createDate.split(" ")[0] : "";
    };
    readSortValue(row) {
        return this.readCellValue(row);
    };
}
class QueueOpReader{
    readCellValue(row) {
        return row.companyId ? {style: "success", text: "Update"} : {style: "success", text: "New"};
    };
    readSortValue(row) {
        return row.companyId ? "UPDATE" : "NEW";
    };
}