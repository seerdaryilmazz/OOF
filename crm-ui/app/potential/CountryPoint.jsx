import React from 'react';
import { Chip } from 'susam-components/advanced';
import { Checkbox, DropDown, Span } from 'susam-components/basic';
import { withReadOnly } from "../utils";

export class CountryPoint extends React.Component {

    handleOnChange(value){
        if(!this.props.onchange){
            return;
        }
        let result = value;
        if(this.props.multiple && value && !_.isArray(value)){
            result = value ? [value]: [];
        }
        this.props.onchange(result);
    }

    render(){
        let component = this.props.multiple ? ExtendedChip : ReadOnlyDropDown; 
        
        let props = _.cloneDeep(this.props);
        if(this.props.multiple && !_.isNil(this.props.value) && !_.isArray(this.props.value)){
            props.value = [this.props.value];
        } 
        if(!this.props.multiple && _.isArray(this.props.value)){
            props.value = _.first(this.props.value);
        }
        props.onchange = (value) => this.handleOnChange(value);
        return React.createElement(component, props);
    }
}

class ExtendedChip extends React.Component{
    
    constructor(props) {
        super(props);
        this.state = {
            all: false
        }
    }

    componentDidMount(){
        this.setState({all: _.isArray(this.props.value) && _.isEmpty(this.props.value)});
    }

    componentDidUpdate(prevProps, prevState){
        if(!_.isEmpty(prevProps.options) && !_.isEqual(prevProps.options, this.props.options) && prevState.all){
            this.setState({all: false});
        }
    }

    handleChange(value) {
        this.setState({all:value});
        if(value){
            this.props.onchange && this.props.onchange([]);
        } else {
            this.props.onchange && this.props.onchange(null);
        }
    }

    handleChipChange(value){
        let result = value;
        if(_.isEmpty(value)){
            result = this.state.all ? [] : null;
        }
        this.props.onchange && this.props.onchange(result);
    }

    render(){
        return(<div>
            <div style={{position:"relative", top:"-14px", left: "100px"}}> 
                <Checkbox label="All" value={this.state.all} disabled={this.props.readOnly} onchange={value=>this.handleChange(value)} />
            </div>
            <div style={{position:"relative", top: "-21px"}}> 
                {this.state.all ? 
                    <Span {...this.props} value="All" />: 
                    <ReadOnlyChip {...this.props} hideSelectAll={true} onchange={value=>this.handleChipChange(value)} /> }
            </div>
        </div>);
    }
}

const ReadOnlyChip = withReadOnly(Chip);
const ReadOnlyDropDown = withReadOnly(DropDown);