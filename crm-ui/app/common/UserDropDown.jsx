import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown } from 'susam-components/basic';



export class UserDropDown extends TranslatingComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <DropDown {...this.props} options={this.context.getUsers()}/>
        );
    }
}

UserDropDown.contextTypes={
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
}