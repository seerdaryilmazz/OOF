import React from 'react';

import {Grid, GridCell} from 'susam-components/layout'
import {handleTabPress, DefaultInactiveElement} from './OrderSteps';
import {OptionList} from './OptionList';

export class CustomsDepartureTRSelection extends React.Component {

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
                    <span className = "uk-text-truncate uk-text-bold">{option.customsOffice ? option.customsOffice.name : ""}</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate" style = {{opacity: .8}}>{option.customsAgent ? option.customsAgent.name : ""}</span>
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
        return <OptionList options = {options} value = {this.props.value} keyField="_key"
                           onRender = {(option) => this.renderBox(option)}/>;
    }
    renderActive(options){
        return <OptionList options = {options} value = {this.props.value}
                           keyField="_key" enableArrowKeys = {true}
                           onChange = {(value) => this.handleSelect(value) }
                           onRender = {(option) => this.renderBox(option)}/>;

    }

}