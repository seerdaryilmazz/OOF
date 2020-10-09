import React from 'react';
import * as axios from 'axios';

import {Card, Grid, GridCell} from 'susam-components/layout';
import {AutoComplete} from 'susam-components/advanced';

import {FindNodeTemplateList} from './FindNodeTemplateList.jsx';
import {FindNodeNodeList} from './FindNodeNodeList.jsx';

export class FindNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.state.current = "";

        this.state.selected = [];

        this.state.templates = [];

    }

    autoCompleteValueSelected(selected) {

        this.state.selected.push(selected);

        this.updateTemplateGrid();
        this.state.current = "";

        this.setState(this.state);

    }

    handleDeleteNode(id) {

        let elemIndex = -1;

        this.state.selected.forEach((s, i) => {
            if (s.id == id) {
                elemIndex = i;
            }
        });

        if (elemIndex > -1) {
            this.state.selected.splice(elemIndex, 1);
        }

        this.updateTemplateGrid();

    }

    autocompleteCallback = (release, val) => {

        let url = "/order-template-service/template-node/relatedparamnodes?keyword=" + val + "&nodeCodesStr=" + this.retrieveSelectedNodeCodes();

        this.state.options = [];
        let self = this;
        $.ajax({
            url: url,
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                release(
                    response.map(function (item) {
                        return {
                            id: item.code + "." + item.type,
                            name: item.label + ": " + item.name
                        }
                    })
                );
            }
        });

    }

    updateTemplateGrid() {
        let url = "/order-template-service/template-node/bynodecodes?nodeCodesStr=" + this.retrieveSelectedNodeCodes();

        let self = this;
        $.ajax({
            url: url,
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                self.state.templates = [];
                if (response) {

                    response.map(function (item) {
                        self.state.templates.push(item);
                    })
                }

                self.setState(self.state);
            }
        });
    }

    retrieveSelectedNodeCodes() {
        let result = "";
        this.state.selected.forEach(s => {
            if (result) {
                result += "*";
            }
            result += s.id;
        })
        return result;
    }

    createNewInput() {
        return (
            <GridCell width="1-1">
                <AutoComplete label={""} valueField="id" labelField="name"
                              value={this.state.current}
                              callback={this.autocompleteCallback}
                              onchange={(selected) => this.autoCompleteValueSelected(selected)}
                              minLength={1}
                />
            </GridCell>
        );
    }

    handleResponseForNode(data) {

    }


    handleResponseForTemplate(data) {

    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <FindNodeNodeList data={this.state.selected}
                                      deleteNodeHandler={(code) => this.handleDeleteNode(code)}/>
                </GridCell>
                <GridCell width="1-1">
                    {this.createNewInput()}
                </GridCell>
                <GridCell width="1-1">
                    <FindNodeTemplateList data={this.state.templates} templateSelectHandler={(value) => this.props.projectSelectHandler(value)}/>
                </GridCell>

            </Grid>
        );
    }
}
