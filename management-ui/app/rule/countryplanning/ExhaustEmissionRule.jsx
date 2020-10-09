import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown} from 'susam-components/basic';

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";

export class ExhaustEmissionRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: {},
            lookup: {},
            isHidden:true
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
        }  if (this.props.lookup) {
            lookup = this.props.lookup;
        }
        this.setState({data: data, lookup: lookup});

    }

    updateData(field, value) {
        let data = this.state.data;
        data[field] = value;
        this.setState({data: data})
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
            <Card title="Exhaust Emission Rule"
                  toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]}>
                <Grid hidden={this.state.isHidden}>
                    <GridCell width="1-5">
                        <DropDown label="Emission Type"
                                  options={lookup.exhaustEmissionType}
                                  value={data.exhaustEmissionType}
                                  onchange={(val) => {
                                      this.updateData("exhaustEmissionType", val)
                                  }}></DropDown>
                    </GridCell>
                    <GridCell width="4-5"/>
                    <GridCell width="1-1">
                        <Button label="Save" flat={true} style="success" size="large"
                                onclick={() => {
                                    this.props.saveHandler(data)
                                }}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}