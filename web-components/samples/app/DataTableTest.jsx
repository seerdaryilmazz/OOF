import React from 'react';
import _ from 'lodash';

import * as DataTable from '../../components/src/datatable/';
import {Card, Grid, GridCell} from '../../components/src/layout/';
import {Button} from '../../components/src/basic/';
import {Translator} from '../../components/src/translator';

import {TextInput, DropDown} from '../../components/src/basic';
import {DateTime, Date, NumericInput} from '../../components/src/advanced';

export default class DataTableTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {data : [
            {id: 787, name:"Eray", status: "done", length: 23.55, price:{amount: 234.56, unit:"TRY"}, purchaseDateTime: "23/10/2016 14:56 Europe/Berlin", deliveredDate: "24/10/2016", isCustomerHappy: true, isOnTime: false},
            {id: 1787, name:"Eray", status: "new", length: 23.55, price:{amount: 234.56, unit:"TRY"}, purchaseDateTime: "23/10/2016 14:56 Europe/Berlin", deliveredDate: "24/10/2016", isCustomerHappy: true, isOnTime: false},
            {id: 788, name:"Burak", status: "new", length: 18.44, price:{amount: 109.99, unit:"TRY"}, purchaseDateTime: "12/11/2016 13:22 Europe/Istanbul", deliveredDate: "14/11/2016", isCustomerHappy: true, isOnTime: true},
            {id: 789, name:"Alper", status: "failed", length: 31.90, price:{amount: 78.48, unit:"TRY"}, purchaseDateTime: "09/11/2016 18:39 Europe/Paris", deliveredDate: "13/11/2016", isCustomerHappy: false, isOnTime: true}
        ]};
    };

    handleRowUpdate(data){
        let state = _.cloneDeep(this.state);
        let index =  _.findIndex(state.data, { id: data.id});
        state.data[index] = data;
        this.setState(state);

    }
    handleRowCreate(data){
        let state = _.cloneDeep(this.state);
        state.data.push(data);
        this.setState(state);
    }
    handleAction1(data){
        console.log(data.name);
    }
    handleAction2(data){
        console.log(data.purchaseDate);
    }

    render() {
        return (
            <Card>
                <Grid>
                    <GridCell width="1-1">
                        <DataTable.Table data={this.state.data}
                                         editable = {true} insertable = {true} filterable = {true} sortable = {true}
                                         showInsertRow = {false} showFilterRow = {false}
                                         groupBy = {["name","status", "isOnTime"]}
                                         onupdate = {(data) => this.handleRowUpdate(data)}
                                         oncreate = {(data) => this.handleRowCreate(data)}>
                            <DataTable.Text field="name" header="Name" width="10"
                                            sortable = {true} filterable = {true}>

                            </DataTable.Text>
                            <DataTable.Numeric field="length" header="Length" width="10"
                                               sortable = {true} filterable = {true}>
                            </DataTable.Numeric>
                            <DataTable.Badge header="Type" width="15"
                                             sortable = {true} filterable = {true}
                                             reader = {new HappinessReader()}>
                                <DataTable.EditWrapper>
                                    <DropDown options = {[{id:"sad", name:"SAD"},{id:"angry",name:"ANGRY"},{id:"happy", name:"HAPPY"}]} />
                                </DataTable.EditWrapper>
                                <DataTable.FilterWrapper target="id">
                                    <DropDown options = {[{id:"sad", name:"SAD"},{id:"angry",name:"ANGRY"},{id:"happy", name:"HAPPY"}]} />
                                </DataTable.FilterWrapper>

                            </DataTable.Badge>
                            <DataTable.DateTime field="purchaseDateTime" header="Purchased At" width="25"
                                                sortable = {true} filterable = {true}>
                            </DataTable.DateTime>
                            <DataTable.Date field="deliveredDate" header="Delivered At" width="12"
                                            sortable = {true} filterable = {true}>
                            </DataTable.Date>
                            <DataTable.NumericWithUnit field="price" header="Price" width="10" units={[{id:"EUR",name:"EUR"},{id:"USD",name:"USD"},{id:"TRY",name:"TRY"}]}
                                                sortable = {true} filterable = {true}>
                            </DataTable.NumericWithUnit>
                        </DataTable.Table>

                    </GridCell>
                </Grid>
            </Card>

        );
    }
}
class HappinessReader{
    readCellValue(row) {
        if(row.isCustomerHappy && row.isOnTime){
            return {style: "success", text: "Happy"};
        }else if(!row.isCustomerHappy && !row.isOnTime){
            return {style: "danger", text: "Angry"};
        }else {
            return {style: "warning", text: "Sad"};
        }
    };

    readSortValue(row) {
        if(row.isCustomerHappy && row.isOnTime){
            return "Happy";
        }else if(!row.isCustomerHappy && !row.isOnTime){
            return "Angry";
        }else {
            return "Sad";
        }
    };
}
