import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {TranslatingComponent} from '../abstract/'
import {DataTableActionColumn} from './DataTableActionColumn'
import {DataTableInsertRow} from './DataTableInsertRow'

export class DataTableHeaderRow extends React.Component {

    constructor(props) {
        super(props);
        this.id = uuid.v4();
    }
    componentDidMount(){

    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(){

    }

    render(){
        let counter = 0;
        return (
                <tr>
                    {
                        this.props.columns.map(column => {
                            return React.cloneElement(column, {
                                key: this.id + ":" + counter++,
                                isHeader: true,
                                tableFilterable: this.props.tableFilterable,
                                tableSortable: this.props.tableSortable
                            });
                        })
                    }
                </tr>
        );
    }
}