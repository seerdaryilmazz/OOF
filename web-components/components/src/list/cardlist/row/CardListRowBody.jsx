import React from 'react';
import {CardListRowBodyElem} from './CardListRowBodyElem';

import uuid from 'uuid';

export class CardListRowBody extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        let rowData = this.props.rowData;
        let headers = this.props.headers;

        let self = this;

        return (
            <div className="md-card-list-item-sender">

                <table>
                    <tbody>
                    <tr>
                        {
                            headers.headerList.map(function(header) {

                                let cellData = self.getRowData(header, rowData);

                                return(
                                    <CardListRowBodyElem key={uuid.v4()} header={header} cellData={cellData}>

                                    </CardListRowBodyElem>
                                );
                            })
                        }
                    </tr>
                    </tbody>
                </table>

            </div>
            );
    }

    getRowData= (header, rowData) => {
        return rowData[header.field];
    }
}