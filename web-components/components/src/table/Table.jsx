import React from "react";
import uuid from "uuid";
import {TableHeader} from "./header/TableHeader";
import {TableBody} from "./body/TableBody";
import {TableFooter} from "./footer/TableFooter";

export class Table extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let headers = this.props.headers;
        let tableData = (this.props.data) ? this.props.data : [];
        let footers = this.props.footers;
        let actions = this.props.actions;
        let insertion = this.props.insertion;
        let icons = this.props.icons;
        let actionButtons = this.getActionButtons(actions);
        let rowClick = this.getRowClick(actions);
        let rowAdd = this.getRowAdd(actions);
        let rowEdit = this.getRowEdit(actions);
        let rowDelete = this.getRowDelete(actions);

        let self = this;

        let tableClassName = this.getTableClassName(this.props.hover);


        return (

            <table className={tableClassName}>
                <TableHeader headers={headers} actions={actions} insertion={insertion}
                             sortData={(sortBy, sortOrder, headerSortObj) => self.sortData(self, sortBy, sortOrder, headerSortObj)}/>
                <TableBody headers={headers} data={tableData} actionButtons={actionButtons} insertion={insertion}
                           icons={icons} rowClick={rowClick} rowAdd={rowAdd} rowEdit={rowEdit} rowDelete={rowDelete}/>
                {self.formatPredefinedChildrenForTable((this.props.children))}
                <TableFooter headers={headers} footers={footers} icons={icons}/>
            </table>

        );
    }

    getActionButtons = (actions) => {
        if (actions) {
            return actions.actionButtons;
        } else {
            return null;
        }
    }

    getRowClick = (actions) => {
        if (actions) {
            return actions.rowClick;
        } else {
            return null;
        }
    }

    getRowAdd = (actions) => {
        if (actions) {
            return actions.rowAdd;
        } else {
            return null;
        }
    }

    getRowEdit = (actions) => {
        if (actions) {
            return actions.rowEdit;
        } else {
            return null;
        }
    }

    getRowDelete = (actions) => {
        if (actions) {
            return actions.rowDelete;
        } else {
            return null;
        }
    }

    getTableClassName = (hover) => {
        let className = "uk-table uk-table-nowrap";
        if (this.props.hover) {
            className += " uk-table-hover";
        }

        return className;
    }

    sortData = (self, sortBy, sortOrder, headerSortObj) => {
        if (this.props.sortFunction) {
            this.props.sortFunction(self, sortBy, sortOrder, headerSortObj);
        } else {
            self.sortInternally(self, sortBy, sortOrder, headerSortObj);
        }
    }

    sortInternally = (self, sortBy, sortOrder, headerSortObj) => {

        let data = this.state.data;
        let sortedData = [];

        let i = 0;
        let currIndex = 0;
        let temp;


        while (data.length > 0) {

            currIndex = 0;
            temp = data[0];
            for (i = 1; i < data.length; i++) {

                if (sortOrder == "asc" && self.compare(self, data[i][sortBy], temp[sortBy], headerSortObj) < 0) {
                    temp = data[i];
                    currIndex = i;
                }
                else if (sortOrder == "desc" && self.compare(self, data[i][sortBy], temp[sortBy], headerSortObj) > 0) {
                    temp = data[i];
                    currIndex = i;
                }

            }
            ;

            data.splice(currIndex, 1);
            sortedData.push(temp);
        }

        headerSortObj.sorted = {};
        headerSortObj.sorted.order = sortOrder;
        headerSortObj.sorted.by = sortBy;

        self.state.headers.map(function (header) {
            if (header.sort && header.sort.sorted && header.data != sortBy) {
                delete header.sort["sorted"];
            }
        });

        this.setState({data: sortedData});

    }

    compare = (self, param1, param2, headerSortObj) => {

        if (headerSortObj.type) {
            if (headerSortObj.type == "text") {
                return self.compareString(param1, param2)
            } else if (headerSortObj.type == "numeric") {
                return self.compareNumeric(param1, param2)
            } else if (headerSortObj.type == "date") {
                return self.compareDate(param1, param2, headerSortObj)
            }
        }

        return self.compareNumeric(param1, param2);

    }

    compareString = (param1, param2) => {

        let str1 = param1 ? param1.toLowerCase() : "";
        let str2 = param2 ? param2.toLowerCase() : "";

        if (str1 > str2) {
            return 1;
        } else if (str1 < str2) {
            return -1;
        }
        return 0;
        orderinfo
    }

    compareNumeric = (param1, param2) => {

        if (param1 > param2) {
            return 1;
        } else if (param1 < param2) {
            return -1;
        }
        return 0;

    }

    compareDate = (param1, param2, headerSortObj) => {

        let date1 = moment(param1, headerSortObj.format);
        let date2 = moment(param2, headerSortObj.format);

        if (date1 > date2) {
            return 1;
        } else if (date1 < date2) {
            return -1;
        }
        return 0;

    }

    formatPredefinedChildrenForTable = (children) => {
        if (!children) return null;

        return (<tbody>
        {
            React.Children.map(children, function (child) {
                return (
                    <tr key={uuid.v4()}>
                        <td colSpan="100%">
                            {child}
                        </td>
                    </tr>
                );
            })
        }

        </tbody>);
    }
}