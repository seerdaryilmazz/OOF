import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';

import * as DataTable from 'susam-components/datatable';

export class PlaceList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            lookup: {}
        }
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {

    }
    render() {
        return (
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <DataTable.Table data={this.props.list} filterable={false} sortable={true} insertable={false}
                                         editable={false}>
                            <DataTable.Text width="25" field="name" header="Name"/>
                            <DataTable.Text width="10" field="localName" header="Local Name" />
                            <DataTable.Text width="10" field="establishment.address.country.name" header="Country" />
                            <DataTable.ActionColumn width="20">
                                <DataTable.ActionWrapper track="onclick"
                                                         onaction={(data) => this.props.onEditPlaceClick(data)}>
                                    <Button label="Edit" flat={true} style="success" size="small"/>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper track="onclick"
                                                         onaction={(data) => this.props.onDeletePlaceClick(data)}>
                                    <Button label="Delete" flat={true} style="danger" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                </Grid>
        );
    }
}