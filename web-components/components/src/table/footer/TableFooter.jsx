import React from 'react';
import uuid from 'uuid';
import {TableFooterRow} from './TableFooterRow';

/**
 * headers
 * data
 * insertion
 * actionButtons
 * rowEdit
 */
export class TableFooter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {rowEditIndex: -1};

    }


    render() {

        let headers = this.props.headers;
        let footers = this.props.footers;
        let icons = this.props.icons;

        if (!footers ) {
            return (
               null
            );
        }

        return (
            <tfoot>

            {footers.map(function (footer) {

                return (
                    <TableFooterRow key={uuid.v4()} headers={headers} footer={footer} icons={icons}/>
                );

            })}

            </tfoot>
        );
    }


}