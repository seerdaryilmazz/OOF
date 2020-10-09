import React from 'react';


export class ListRowBody extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        let rowData = this.props.rowData;
        let headers = this.props.headers;

        return (
            <div className="md-list-content">
                <span className="md-card-list-heading">
                    {rowData[headers.header]}
                </span>
                <span className="uk-text-small uk-text-muted">
                    {rowData[headers.details]}
                </span>
                {this.props.button}
            </div>
            );
    }
}