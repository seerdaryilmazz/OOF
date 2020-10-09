import React from 'react';
import {Card, Grid, GridCell, Pagination} from 'susam-components/layout';
import PropTypes from 'prop-types';
import { Button, Notify} from 'susam-components/basic';
import {ActionHeader} from "../utils";
import * as DataTable from 'susam-components/datatable';
import { CrmSearchService } from '../services';
import { QuoteTypePrinter, QuoteStatusPrinter } from '../common';
import { TranslatingComponent } from 'susam-components/abstract/TranslatingComponent';

export class QuoteSummaryInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state={
        };
    }

    render(){
        let content;
        content= 
        <GridCell width = "1-1">
          <DataTable.Table data={this.props.searchResult}>
          <DataTable.Text header="Merge Status" field="mergeStatus" printer ={new MergeStatusPrinter(this)} />
          <DataTable.Text header="Number" field="number" />
          <DataTable.Text header="Quadro Number" field="mappedIds.QUADRO" />
          <DataTable.Text header="Name" field="name"  printer={new QuoteNamePrinter()}/>
          <DataTable.Badge header="Type" field="type.name"  printer={new QuoteTypePrinter(this)}/>
          <DataTable.Text header="Status" field="status.name" translator={this} printer={new QuoteStatusPrinter(this)}/>
          <DataTable.Text header="Pay Weight" field="payWeight"/>
          <DataTable.Text header="Created By" field="createdBy" reRender={true} printer={new UserPrinter(this.context.getAllUsers())}/>
     </DataTable.Table>
    </GridCell>
    
        return(
            <Grid>
             {content}
       </Grid>
         
        );      
    }

}

class QuoteNamePrinter {
    constructor(){
    }
    print(data){
        data=data.substring(data.indexOf('From')); //Deletes everything before 'From'
        if(data.length>35){
            data = data.substring(0, 32) + "...";
        }
        return data;
    }
}

class UserPrinter{
    constructor(userList){
        this.userList=userList;
    }
    print(data){
        return _.get(_.find(this.userList, u=>u.username == data),'displayName');
    }  
}

class MergeStatusPrinter{
    constructor(translator){
        this.translator=translator;
    }

    translate(text){
        return this.translator ? this.translator.translate(text) : text;
    }

    printUsingRow(row){
        if(row.mergeStatus == "OWN"){
            return <span className="uk-badge uk-badge-muted">{this.translate(_.capitalize(row.mergeStatus))}</span>
        }
        else if(row.mergeStatus == "ADDED") {
            return <span className="uk-badge md-bg-light-green-600">{this.translate(_.capitalize(row.mergeStatus))}</span>
        }
        else{
            return null;
        }
    }
}



QuoteSummaryInfo.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    user: React.PropTypes.object,
    router: PropTypes.object.isRequired,
    translator: PropTypes.object
};