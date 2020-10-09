import React from 'react';
import PropTypes from 'prop-types';
import {TranslatingComponent} from '../abstract/'

export class DropDownButton extends TranslatingComponent{
    constructor(props){
        super(props);
    };
    componentDidMount(){

    }
    handleClick(e, item){
        e.preventDefault();
        if(item.onclick){
            item.onclick();
        }else{
            this.props.onclick && this.props.onclick(item);
        }
    }
    render(){
        var className = "md-btn";
        if(this.props.flat){
            className += " md-btn-flat"
        }
        if(this.props.style){
            className += (this.props.flat ? (" md-btn-flat-" + this.props.style) : (" md-btn-" + this.props.style));
        }
        if(this.props.size){
            className += (" md-btn-" + this.props.size);
        }
        if(this.props.waves){
            className += " md-btn-wave waves-effect waves-button";
        }
        if(this.props.disabled){
            className += " disabled";
        }
        let options = [];
        if(this.props.options){
            options = this.props.options.map(item => {
                return <li key = {item.label}><a href="#" onClick = {(e) => this.handleClick(e, item)}>{super.translate(item.label)} </a></li>
            });
        }
        let minWidth = "400px";
        if(this.props.minWidth){
            minWidth = this.props.minWidth;
        }
        let data_uk_dropdown="";
        if (this.props.data_uk_dropdown){
            data_uk_dropdown=this.props.data_uk_dropdown;
        }

        return(
            <div className="uk-button-dropdown" data-uk-dropdown={data_uk_dropdown} aria-haspopup="true" aria-expanded="false">
                <button ref={(c) => this._input = c} className={className} type="button" >
                    {super.translate(this.props.label)}
                    <i className="material-icons"></i>
                </button>
                <div className="uk-dropdown uk-dropdown-small uk-dropdown-bottom" style={{minWidth: minWidth, top: "35px", left: "0px"}}>
                    <ul className="uk-nav uk-nav-dropdown">
                        {options}
                    </ul>
                </div>
            </div>
        );
    }
}
DropDownButton.contextTypes = {
    translator: PropTypes.object
};