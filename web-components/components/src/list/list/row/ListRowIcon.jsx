import React from 'react';


export class ListRowIcon extends React.Component {
    constructor(props) {
        super(props);
    }

    
    render() {

        let icon = this.props.icon;

        let className = "uk-icon-refresh uk-icon-medium uk-icon-" + icon;


        return (
            <div className="md-list-addon-element">
                <i className={className}></i>
            </div>
        );
    }

}