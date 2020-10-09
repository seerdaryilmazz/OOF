import React from "react";
import {Table} from "susam-components/table";

export class ZoneZipCodesTable extends React.Component {

    constructor(props) {
        super(props);

        this.headers = [
            {
                name: "Type",
                data: "zoneZipCodeType",
                width: "%30",
                render: (values) => {
                    return values.zoneZipCodeType.name;
                }
            },
            {
                name: "Value",
                data: "value",
                width: "70%",
                render: (values) => {
                    return values.country.iso + " " + values.value1 + (values.value2 ? " - " + values.value2 : "");
                }
            }
        ];

        this.actions = {
            actionButtons: [
                {
                    icon: "pencil-square",
                    action: (elem) => this.onEditZoneZipCode(elem),
                    title: "edit"
                },
                {
                    icon: "close",
                    action: (elem) => this.onDeleteZoneZipCode(elem),
                    title: "delete"
                },
            ]
        };
    }

    onEditZoneZipCode(values) {
        this.props.onEditZoneZipCode(values);
    }

    onDeleteZoneZipCode(values) {
        this.props.onDeleteZoneZipCode(values);
    }

    render() {
        return <Table headers={this.headers}
                      data={this.props.zipCodes}
                      actions={this.actions}/>;
    }
}