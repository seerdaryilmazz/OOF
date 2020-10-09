import React from 'react';

import {Planning} from "./Planning";

export class PlanningForFtl extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render () {
        return <Planning loadPageFor={Planning.TYPE_FTL}/>
    }
}