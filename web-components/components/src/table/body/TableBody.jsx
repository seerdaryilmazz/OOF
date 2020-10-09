import React from 'react';
import uuid from 'uuid';

import {TableRowBasic} from './TableRowBasic';
import {TableRowComposite} from './TableRowComposite';

/**
 * headers
 * data
 * insertion
 * actionButtons
 * rowEdit
 */
export class TableBody extends React.Component {
    constructor(props) {
        super(props);
        this.state = {rowEditIndex: -1, selectedRowIndex: -1};

    }


    render(){
        
        let self = this;
        let headers = this.props.headers;
        let insertion = this.props.insertion;
        let tableData = this.props.data;
        let icons = this.props.icons;
        let actionButtons = this.props.actionButtons;
        let rowClick = this.props.rowClick;
        let rowAdd = this.props.rowAdd;
        let rowEdit = this.props.rowEdit;
        let rowDelete = this.props.rowDelete;

        let rowEditIndex = self.state.rowEditIndex;


        if(!(tableData || insertion || predefinedChildren)) {
            return (
                <tbody>
                    <tr><td>No Data</td></tr>
                </tbody>
            );
        }


        let insertionElem = null;
        if(insertion && rowAdd) {
            insertionElem = <TableRowComposite key={uuid.v4()} headers={headers} insertion={insertion} values={{}} mode="add"
                                               onsave={(newData) => rowAdd(newData)} />
        }


        let tableContent = null;
        if(tableData) {
            let index = 0;

            tableContent = tableData.map(function (rowData) {
                if(rowData.deleted) return null;

                if(index == rowEditIndex) {
                    return (
                        <TableRowComposite key={index} headers={headers} insertion={insertion} values={rowData} mode="edit" index={index++}
                                           onsave={(newData) => self.tryFinishRowEdit(newData, rowEdit.action)} />
                    );
                }
                else {
                    return (
                        <TableRowBasic key={index} headers={headers} row={rowData} actionButtons={actionButtons}
                                       icons={icons} rowClick={(index) => self.handleRowClick(index, rowData, rowClick)} rowEdit={rowEdit} rowDelete={rowDelete}
                                       enableRowEditMode={(index) => self.enableRowEditMode(index, rowData)}
                                       deleteRow={() => rowDelete.action(rowData)}
                                       index={index} selected={(index++==self.state.selectedRowIndex)}/>
                    );
                }

            });
        }



        return (
            <tbody>
                {insertionElem}
                {tableContent}
            </tbody>
        );
    }

    tryFinishRowEdit = (data, action) => {

        let result = action(data, this.state.rowDataOld);

        if(result) {
            this.state.rowDataOld = null;
            this.setState({rowEditIndex: -1});
        }

        return result;
    }

    enableRowEditMode= (index, rowData) => {
        this.state.rowDataOld = JSON.parse(JSON.stringify(rowData));
        this.setState({rowEditIndex: index});
    }

    handleRowClick = (index, rowData, rowClick) => {
        if(rowClick) {
            rowClick(rowData);
            this.setState({selectedRowIndex: index});
        }
    }

}