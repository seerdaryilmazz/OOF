import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import {TranslatingComponent} from '../abstract/'

export class RadioButton extends TranslatingComponent{
    constructor(props){
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else{
            this.state = {id:uuid.v4()};
        }
    };
    componentDidMount(){
        $(this._input).iCheck({
            radioClass: 'iradio_md',
            increaseArea: '20%'
        });
        $(this._input).on('ifChanged', (e) => this.ifChanged(e));
    };
    componentDidUpdate(prevProps, prevState){
        $(this._input).iCheck('update');
    }
    ifChanged(event){
        if(this.props.required){
            $(this._input).parsley().validate();
        }

        if(this.props.onchange){
            this.props.onchange(event.target.checked);
        }
    };
    render(){
        var input = <input ref={(c) => this._input = c} key={this.props.value}
                           type="radio" id={this.state.id} name={this.props.name} required={this.props.required}
                           data-md-icheck checked={this.props.checked} value={this.props.value} disabled={this.props.disabled} />;
        var label = <label htmlFor={this.state.id} className="inline-label">{super.translate(this.props.label)}</label>;
        if(this.props.inline){
            let className = "icheck-inline";
            if (this.props.noMargin === true) {
                className += " uk-margin-remove";
            }
            return(
                <span className={className} key={this.props.value}>
                    {input}
                    {label}
                </span>
            );
        }else{
            return(
                <p>
                    {input}
                    {label}
                </p>
            );
        }
    }
}
RadioButton.contextTypes = {
    translator: PropTypes.object
};
