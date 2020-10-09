import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {TranslatingComponent} from '../abstract/';
import {Button} from '../basic';
import {DataTableActionColumn} from './DataTableActionColumn';
import {DataTableRowEditColumn} from './DataTableRowEditColumn';

export class DataTableFilterRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {filter: _.fill(Array(this.props.columns.length), "")}
    }
    componentDidMount(){

    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(){

    }
    handleDataUpdate(index, value){
        let state = _.cloneDeep(this.state);
        state.filter[index] = value;
        this.setState(state);
        this.props.onfilter && this.props.onfilter(state.filter);
    }

    getFilter() {
        return this.state.filter;
    }

    render(){
        if(!this.props.columns){
            return <tr><td>no columns</td></tr>
        }
        let style = {borderBottom: "2px solid rgba(0, 0, 0, 0.12)"};
        if(!this.props.visible){
            style.display = "none";
        }
        return(
            <tr style = {style} className="even">
                {
                    this.props.columns.map((column, index) => {
                        if(column.type == DataTableActionColumn || column.type == DataTableRowEditColumn){
                            return <td key = {index} style = {{padding: "0px"}}/>;
                        }else{
                            return React.cloneElement(column, {
                                key: index,
                                isFilter: true,
                                filterData: this.state.filter[index],
                                onfilterupdate: (value) => this.handleDataUpdate(index, value)
                            });
                        }
                    })
                }
            </tr>
        );
    }
}