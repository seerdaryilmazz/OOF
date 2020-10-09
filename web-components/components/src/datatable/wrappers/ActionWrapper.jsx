import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class ActionWrapper extends React.Component {
    constructor(props) {
        super(props);
    };

    componentDidMount(){

    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(){

    }
    handleTrackingAction(value){
        this.props.onaction && this.props.onaction(this.props.data, value);
    }

    render(){
        if(this.props.shouldRender && !this.props.shouldRender(this.props.data)){
            return null;
        }
        let children = React.Children.map(this.props.children, child => {
            let props = this.props.childProps ? this.props.childProps(this.props.data) : {}
            props[this.props.track] = (value) => this.handleTrackingAction(value);
            props.disabled = this.props.shouldDisable && this.props.shouldDisable(this.props.data);
            return React.cloneElement(child, props);

        });
        if(children.length == 1){
            return children[0];
        }else{
            return <div>{children}</div>;
        }

    }

}