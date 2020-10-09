import React from 'react';

export class OverflowContainer extends React.Component{
    constructor(props){
        super(props);
        this.state = {};
    };

    componentDidMount(){

    };

    render() {

        return (
            <div className="uk-overflow-container" style={{maxHeight: this.props.height + "px"}}>
                {this.props.children}
            </div>
        );
    };

}