import React from 'react';


export class CardListRowIcon extends React.Component {
    constructor(props) {
        super(props);
    }

    
    render() {
        let color = this.props.color;
        let label = this.props.label;

        let className = "md-card-list-item-avatar-wrapper";
        let spanName = this.getSpanName(color);

        return (
            <div className={className}>
                <span className={spanName}>
                    {label}
                </span>
            </div>
        );
    }

    getSpanName = (color) => {
        let spanName = "md-card-list-item-avatar md-bg-";
        spanName += color;
        return spanName;
    }





}