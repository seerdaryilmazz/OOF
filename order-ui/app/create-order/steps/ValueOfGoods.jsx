import React from "react";
import { NumericInputWithUnit } from 'susam-components/advanced';
import uuid from "uuid";
import { DefaultInactiveElement } from './OrderSteps';


export class ValueOfGoods extends React.Component{
    constructor(props){
        super(props);
        this.id = uuid.v4();
    }
    componentDidMount(){
        document.getElementById(this.id) && document.getElementById(this.id).focus();
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }

    handleKeyPress = (e) => {
        e.stopPropagation();
        if(e.key === "Tab"){
            if(document.activeElement == document.getElementById(this.id)){
                e.shiftKey ? this.props.onPrev() : null;
            } else if(!document.activeElement.id){
                e.shiftKey ? null : this.props.onNext();
            }
        }
    };

    handleChange(value){
        this.props.onChange && this.props.onChange(value.amount !== "" || value.amount !== "0"  ? value : null);
        if(value.amount && value.unit && value.unit.code){
            this.props.onNext && this.props.onNext();
        }
    }
    renderActive(){
        return (
            <NumericInputWithUnit id = {this.id} {...this.props} digits="2" digitsOptional = {true}
                                  onchange = {(value) => this.handleChange(value)}/>

        );
    }
    renderInactive(){
        let currency = _.get(this.props.value, "unit.code") || "";
        let formatter = new Intl.NumberFormat('tr-TR', {
            maximumFractionDigits: 2, minimumFractionDigits: 2
        });
        let value = this.props.value ? (formatter.format(this.props.value.amount) + " " + currency) : "Not entered yet";
        return <DefaultInactiveElement value = {value}/>;
    }
    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
}