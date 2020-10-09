import React from 'react';

import {Tree} from '../../components/src/advanced';
import {Button} from '../../components/src/basic';

export default class TreeTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.tree = this.loadTree();
    };

    loadTree = () => {
        return ([
            {
                deleted: false,
                lastUpdated: null,
                lastUpdatedBy: null,
                id: 1,
                code: "m1",
                name: "Menu 1",
                url: "url1",
                children: [
                    {
                        deleted: false,
                        lastUpdated: null,
                        lastUpdatedBy: null,
                        id: 101,
                        code: "m3",
                        name: "Menu 3",
                        url: "url1",
                        children: [
                            {
                                deleted: false,
                                lastUpdated: null,
                                lastUpdatedBy: null,
                                id: 151,
                                code: "m4",
                                name: "Menu 4",
                                url: "url1",
                                children: [ ]
                            }
                        ]
                    },
                    {
                        deleted: false,
                        lastUpdated: null,
                        lastUpdatedBy: null,
                        id: 51,
                        code: "m2",
                        name: "Menu 2",
                        url: "url1",
                        children: [ ]
                    }
                ]
            }
        ]);
    }

    handleElementSelect = (data) => {
        this.state.selectedId = data.id;
        this.setState(this.state);
        console.log("element clicked: " + data.id);
    }

    action1 = (data) => {
        console.log("action1: " + data.id);
    }

    action2 = (data) => {
        console.log("action2: " + data.id);

    }

    render() {
        return (
            <div>
                <Tree data={this.state.tree} onselect={(selectedElem) => this.handleElementSelect(selectedElem)} selectedId={this.state.selectedId }
                actions={[{name: "action1", action: this.action1}, {name: "action2", action: this.action2}]}/>
            </div>
        );
    }


}

