import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {Notify, Button} from "susam-components/basic";
import {Chip} from "susam-components/advanced";

import {ProjectService} from '../../services';

export class Incoterm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: {},
            lookup:{},
            isHidden: true
        }

    }

    componentDidMount() {
        this.loadData(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this.loadData(nextProps)

    }

    loadData(props) {
        let data = this.state.data;
        let lookup = this.state.lookup;

        if (props.data) {
            data = props.data;
        }
        if (props.lookup) {
            lookup = props.lookup;
        }
        this.setState({data: data, lookup: lookup});
    }

    handleSave() {
        this.props.saveHandler(this.state.data);
    }

    handleShowHideClick() {
        if (this.state.isHidden) {
            this.setState({isHidden: false});
        } else {
            this.setState({isHidden: true});
        }
    }

    retrieveShowHideIcon() {
        if (this.state.isHidden) {
            return "angle-double-down";
        } else {
            return "angle-double-up";
        }
    }


    render() {

        let data = this.state.data;
        let lookup = this.state.lookup;

        return (
            <Card title="Incoterm"
                  toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]} c>
                <Grid hidden={this.state.isHidden}>
                    <GridCell width="1-1">
                        <Chip label="Incoterm" options={lookup.incoterm} value={data} onchange={(data) => {
                            this.setState({data: data})
                        }}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Button label="Save" style="success" onclick={() => {
                            this.handleSave()
                        }}/>
                    </GridCell>
                </Grid>
            </Card>

        );
    }
}