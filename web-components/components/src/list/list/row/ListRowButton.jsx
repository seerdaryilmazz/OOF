import React from 'react';

export class ListRowButton extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let self = this;

        let className = "md-btn md-btn-flat md-btn-flat-primary md-btn-small uk-float-right";

        return(
            <button className={className} onClick={() => this.props.action(this.props.rowData)}>{this.props.label}</button>
        );

    }

}
