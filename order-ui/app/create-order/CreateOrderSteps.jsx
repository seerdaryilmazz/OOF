import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from 'susam-components/basic';
import { Alert } from 'susam-components/layout';
import uuid from 'uuid';

export class CreateOrderSteps extends React.Component {

    constructor(props){
        super(props);
        this.state = {keys: []};
    }
    componentDidMount(){

    }
    handleNext(){
       setTimeout(() => this.props.onNext(), 200);
    }
    handlePrev(){
        setTimeout(() => this.props.onPrev(), 200);
    }
    handleChange(step, key, value){
        step.onChange ? step.onChange(key, value) : this.props.onChange(key, value);
    }
    handleClickSave(){
        this.props.onSave();
    }
    render(){
        if(!this.props.steps){
            return null;
        }
        let valid = true;
        let components = this.props.steps.map((step, index) => {
            let active = index === this.props.index;
            let key = step.id + (active ? "-active" : "-inactive");
            let value = _.get(this.props.order, step.id);
            let validationResult = step.validate ? step.validate(value) : null;
            let showValidation = index < this.props.index;
            if(validationResult != null && validationResult.hasError()){
                valid = false;
            }
            return <CreateOrderStep key = {key} id = {step.id} active = {active}
                                    component = {step.component()}
                                    title = {step.title}
                                    index = {index} currentIndex = {this.props.index}
                                    validationResult = {showValidation ? validationResult : null}
                                    value = {value}
                                    onChange = {(id, value) => this.handleChange(step, id, value)}
                                    onNext = {() => this.handleNext()}
                                    onPrev = {() => this.handlePrev()}
                                    onStep = {(index) => this.props.onStep(index)}/>
        });
        return(
            <div className = "create-order-steps" style={{height: `${window.innerHeight - 292}px`}}>
                {components}
                <Button label="save" style = "primary" size = "large" disabled = {!valid} onclick = {() => this.handleClickSave()}/>
            </div>
        );
    }
}

export class CreateOrderStep extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
    }
    componentDidMount(){
        if(this.props.active){
            this.div.scrollIntoView({block: "center", behavior: "smooth", inline: "start"});
        }
    }

    renderValidation(){
        if(this.props.validationResult && this.props.validationResult.hasError()){
            return this.props.validationResult.messages.map(message => <Alert key = {uuid.v4()} type="danger" message = {message} translate={true}/> );
        }
        return null;
    }

    render(){
        let {active, value, id, title, index, currentIndex, validationResult} = this.props;
        let classNames = ["step"];
        classNames.push(active ? "active" : "inactive");
        let component = null;
        if(active){
            component = React.cloneElement(this.props.component, {
                value: value,
                onNext: () => this.props.onNext(), onPrev: () => this.props.onPrev(),
                onChange: (value) => this.props.onChange(id, value),
                currentIndex: currentIndex, index: index,
                validationResult: validationResult, active: true
            });
        }else{
            component = React.cloneElement(this.props.component, {
                value: value, active: false, validationResult: validationResult
            });
        }
        let titleClassNames = ["title"];
        if(validationResult && validationResult.hasError()){
            titleClassNames.push("uk-text-danger");
        }
        return(
            <div className={classNames.join(" ")} ref = {c => this.div = c}>
                <h2 className={titleClassNames.join(" ")} onClick = {() => this.props.onStep(index)} style = {{cursor: "pointer"}}>
                    {super.translate(title)}
                </h2>
                {this.renderValidation()}
                {component}
            </div>
        );
    }
}

CreateOrderStep.contextTypes = {
    translator: PropTypes.object
};