import React from 'react';
import uuid from 'uuid';

export class Password extends React.Component{
    constructor(props){
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else{
            this.state = {id:uuid.v4()};
        }
    };

    componentDidMount(){
        $(this._input).on('focus', function() {
            $(this).closest('.md-input-wrapper').addClass('md-input-focus');
        });
    }

    handleOnChange(event){
        if(this.props.onchange){
            this.props.onchange(event.target.value);
        }
    }

    render(){
        var hidden = this.props.hidden;
        var style = {};
        if(hidden){
            style.display= 'none';
        }
        var wrapperClassName = "md-input-wrapper";
        if(this.props.value || this.props.placeholder){
            wrapperClassName += " md-input-filled";
        }
        var inputClassName = "md-input";
        if(this.props.placeholder){
            inputClassName += " label-fixed";
        }
        var label = this.props.label;
        if(this.props.hideLabel){
            label = "";
        }
        var requiredForLabel = "";
        if(this.props.required && label){
            requiredForLabel = <span className="req">*</span>;
        }
        return(
            <div className={wrapperClassName}>
                <label>{label}{requiredForLabel}</label>
                <input ref={(c) => this._input = c}
                       id={this.state.id}
                       type="password" className={inputClassName}
                       onChange = {(e) => this.handleOnChange(e)}
                       placeholder={this.props.placeholder}
                       required={this.props.required}/>
                <span className="md-input-bar "/>
            </div>
        );
    };
}