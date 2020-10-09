import React from 'react';


export class CardListRowBodyElem extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        let cellData = this.props.cellData;
        let header = this.props.header;

        let spanClass = this.getSpanClassName(header);

        return (
            <td>
                <span className={spanClass}>
                    {cellData}
                </span>
            </td>
        );
    }


    getSpanClassName= (header) => {
       if(header.bold) {
           return "md-card-list-heading";
       } else if(header.muted) {
           return "uk-text-small uk-text-muted";
       } else {
           return "md-card-list-heading";
       }
    }
}