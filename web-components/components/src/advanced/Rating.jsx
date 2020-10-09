import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {Card, Grid, GridCell} from '../layout';
import {TranslatingComponent} from '../abstract';

export class Rating extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.setState({value: this.props.value});
    }

    componentWillReceiveProps(nextProps){
        this.setState({value: nextProps.value});
    }

    handleChange(e, value){
        e.preventDefault();
        this.setState({value: value});
        this.props.onchange && this.props.onchange(value);
    }

    render(){
        let value = this.state.value || 1;
        let count = this.props.count || 10;
        let stars = [];
        for(let i = 1; i <= count; i++){
            let icon = "star_border";
            if(i <= value){
                icon = "star";
            }
            stars.push(
                <a key = {i} href = "#" onClick = {(e) => this.handleChange(e, i)}>
                    <i className="material-icons md-36">{icon}</i>
                </a>
            );
        }
        return (
            <div className="md-input-wrapper md-input-filled">
                <label>{this.props.label}</label>
                {stars}
            </div>
        );
    }
}