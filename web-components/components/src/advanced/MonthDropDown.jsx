import React from "react";

import {TranslatingComponent} from '../abstract';
import {DropDown} from '../basic';

export class MonthDropDown extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            options: []
        };
    }

    componentDidMount() {
        // super.translate metodunu constructor içinde çağırdığımızda hata oluştuğundan listeyi burada dolduruyoruz.
        this.setState({
            ready: true,
            options: [
                {
                    id: 1,
                    name: super.translate("January")
                },
                {
                    id: 2,
                    name: super.translate("February")
                },
                {
                    id: 3,
                    name: super.translate("March")
                },
                {
                    id: 4,
                    name: super.translate("April")
                },
                {
                    id: 5,
                    name: super.translate("May")
                },
                {
                    id: 6,
                    name: super.translate("June")
                },
                {
                    id: 7,
                    name: super.translate("July")
                },
                {
                    id: 8,
                    name: super.translate("August")
                },
                {
                    id: 9,
                    name: super.translate("September")
                },
                {
                    id: 10,
                    name: super.translate("October")
                },
                {
                    id: 11,
                    name: super.translate("November")
                },
                {
                    id: 12,
                    name: super.translate("December")
                }
            ]
        });
    }

    handleOnChange(value) {
        if (this.props.onchange) {
            if (value) {
                this.props.onchange(value.id);
            } else {
                this.props.onchange(null);
            }
        }
    }

    render() {

        if (!this.state.ready) {
            return null;
        }

        return (
            <DropDown {...this.props} options={this.state.options} value={{id: this.props.value}} onchange={(value) => this.handleOnChange(value)}/>
        );
    }
}