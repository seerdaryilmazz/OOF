import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';



export class UsersTable extends TranslatingComponent {

    constructor(props) {
        super(props);
    }

    handleEditClick(item) {
        this.props.onEdit && this.props.onEdit(item);
    }
    handleActivateClick(item) {
        this.props.onActivate && this.props.onActivate(item);
    }
    handleDeactivateClick(item){
        this.props.onDeactivate && this.props.onDeactivate(item);
    }

    render(){
        return(
            <DataTable.Table data={this.props.users} sortable = {true} selectedRows={[this.props.selectedUser]}>
                <DataTable.Text field="displayName" header="Name" width="20" sortable = {true} printer={new LinkPrinter(item=>this.handleEditClick(item))}/>
                <DataTable.Text field="username" header="Username" width="30" sortable = {true}/>
                <DataTable.Badge field="status.name" header="Status" width="20" sortable = {true} printer = {new StatusPrinter()}/>
                <DataTable.Badge field="authenticationType.name" header="Type" width="20" sortable = {true} printer = {new TypePrinter()}/>
                <DataTable.ActionColumn >
                    <DataTable.ActionWrapper track="onclick" shouldRender = {(data) => data.status.code == "DISABLED"}
                                             onaction={(item) => {this.handleActivateClick(item)}}>
                        <Button label="Activate" flat={true} style="primary" size="small"/>
                    </DataTable.ActionWrapper>
                    <DataTable.ActionWrapper track="onclick" shouldRender = {(data) => data.status.code == "ACTIVE"}
                                             onaction={(item) => {this.handleDeactivateClick(item)}}>
                        <Button label="Deactivate" flat={true} style="danger" size="small"/>
                    </DataTable.ActionWrapper>
                </DataTable.ActionColumn>
            </DataTable.Table>
        );
    }

}

class LinkPrinter {
    constructor(onclick){
        this.onclickEvent = onclick;
    }

    printUsingRow(row) {
        return <a className='uk-text-primary' 
            onClick={()=>this.onclickEvent && this.onclickEvent(row)} 
            href='javascript:;'>{row.displayName}</a>
    }
}
class TypePrinter{
    print(data){
        return <span className="uk-badge uk-badge-outline">{_.capitalize(data)}</span>
    }
}
class StatusPrinter{
    print(data){
        if(data == "ACTIVE"){
            return <span className="uk-badge uk-badge-success">{_.capitalize(data)}</span>
        }else if(data == "DISABLED"){
            return <span className="uk-badge uk-badge-danger">{_.capitalize(data)}</span>
        }

    }
}