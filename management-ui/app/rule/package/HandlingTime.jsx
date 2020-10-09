import React from "react";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown} from 'susam-components/basic';
import {Duration} from 'susam-components/advanced';

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";

import * as DataTable from 'susam-components/datatable';

export class HandlingTime extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: {},
            lookup: {},
            isHidden: true
        }
    }

    componentDidMount() {
        let data = {};
        let lookup = {};
        if (this.props.data) {
            data = this.props.data;
        }
        if (this.props.lookup) {
            lookup = this.props.lookup;
        }
        this.setState({data: data, lookup: lookup});
    }

    componentWillReceiveProps(nextProps) {
        let data = {};
        let lookup = {};
        if (nextProps.data) {
            data = nextProps.data;
        }
        if (nextProps.lookup) {
            lookup = nextProps.lookup;
        }
        this.setState({data: data, lookup: lookup});
    }

    updateData(field, value) {
        let data= this.state.data;
        data[field] = value;
        this.setState({data: data});
    }

    handleShowHideClick() {
        if(this.state.isHidden) {
            this.setState({isHidden: false});
        } else {
            this.setState({isHidden: true});
        }
    }

    retrieveShowHideIcon() {
        if(this.state.isHidden) {
            return "angle-double-down";
        } else {
            return "angle-double-up";
        }
    }

    render() {

        let data = this.state.data;
        let lookup = this.state.lookup;

        return (
            <Card title="Handling Time"
                  toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]}>
                <Grid hidden={this.state.isHidden}>
                    <GridCell width="2-5" >
                        <DropDown label="Range Type" options={lookup.rangeType}
                                  value={data.rangeType}
                                  onchange={(e) => this.updateData("rangeType", e)}/>
                    </GridCell>
                    <GridCell width="2-5" >
                        <Duration label="Duration Per unit/kg/vol/ldm" value={data.durationPerElem}
                                  onchange={(e) => this.updateData("durationPerElem", e)}/>
                    </GridCell>
                    <GridCell width="1-5" >
                        <Button label="Save" onclick={() => {this.props.saveHandler(data)}}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}