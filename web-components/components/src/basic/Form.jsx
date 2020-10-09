import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import Validation from './Validation';

export class Form extends React.Component{
    constructor(props){
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else{
            this.state = {id:uuid.v4()};
        }
        this.validation = new Validation(this.state.id);
    };

    componentDidMount(){
        this.mountValidation();
    };
    componentWillUnmount(){
        this.validation && this.validation.destroy();
    };
    mountValidation(){
        this.validation.mount();
    }

    validate(){
        return this.validation && this.validation.validate();
    }
    validateGroup(groupName){
        return this.validation && this.validation.validateGroup(groupName);
    }
    isValid(){
        return this.validation && this.validation.isValid();
    }
    reset(){
        return this.validation && this.validation.reset();
    }

    componentWillReceiveProps(nextProps){
    };

    render() {
        return (
            <form id={this.state.id} >
                {this.props.children}
            </form>
        );
    };

    getChildContext() {
        return {validation: this.validation};
    }

}
Form.childContextTypes = {
    validation: PropTypes.object
};
