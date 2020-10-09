import React from 'react';

import {Grid, GridCell} from 'susam-components/layout'
import {Span, TextInput, DropDown, Button, Notify} from 'susam-components/basic'
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {handleTabPress, DefaultInactiveElement} from './OrderSteps';
import {OptionList} from './OptionList';

export class OriginalCustomerSelection extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
    }
    componentDidUpdate(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        handleTabPress(e, () => this.props.onNext(), () => this.props.onPrev());
    };

    handleSelect(option){
        this.props.onChange && this.props.onChange(option);
        this.props.onNext && this.props.onNext();
    }
    renderBox(option){
        return(
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate uk-text-bold">{option ? option.name : ""}</span>
                </GridCell>
            </Grid>
        );
    }
    render(){
        return this.props.active ? this.renderActive(this.props.options) : this.renderInactive();
    }

    renderInactive(){
        if(!this.props.value){
            return <DefaultInactiveElement value="No selection" />;
        }
        let options = this.props.options && this.props.options.length > 0 ?  this.props.options : [this.props.value];
        return <OptionList options = {options} value = {this.props.value} keyField="id"
                           onRender = {(option) => this.renderBox(option)}/>;
    }
    renderActive(options){
        return <OptionList options = {options} value = {this.props.value}
                           keyField="id" enableArrowKeys = {true}
                           onChange = {(value) => this.handleSelect(value) }
                           onRender = {(option) => this.renderBox(option)}/>;

    }

}