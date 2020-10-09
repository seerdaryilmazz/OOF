import React from "react";
import {TextInput, DropDown, Notify} from "susam-components/basic";
import {Chip} from "susam-components/advanced";
import {Grid, GridCell} from "susam-components/layout";

export class ZoneForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.extractStateFromProps(props);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.extractStateFromProps(nextProps))
    }

    extractStateFromProps(props) {
        return {
            name: props.zone ? props.zone.name : null,
            description: props.zone ? props.zone.description : null,
            zoneType: props.zone ? props.zone.zoneType : null,
            tags: props.zone ? props.zone.tags : null,
        }
    }

    setStateProp(key, value) {
        let prop = {};
        prop[key] = value;
        this.setState(prop);
    }

    getZone() {
        return this.state;
    }

    validateZoneForm() {
        let valid = true;

        if (!this.state.name) {
            Notify.showError("Zone Name is required!")
            valid = false;
        }

        if (!this.state.zoneType) {
            Notify.showError("Zone Type is required!")
            valid = false;
        }

        return valid;
    }

    render() {
        return (
            <Grid>
                <GridCell noMargin="true" width="2-10">
                    <TextInput label="Zone Name"
                               value={this.state.name}
                               onchange={(value) => this.setStateProp("name", value)}/>
                </GridCell>
                <GridCell noMargin="true" width="3-10">
                    <TextInput label="Zone Description"
                               value={this.state.description}
                               onchange={(value) => this.setStateProp("description", value)}/>
                </GridCell>
                <GridCell noMargin="true" width="1-10">
                    <DropDown label="Zone Type"
                              onchange={(value) => this.setStateProp("zoneType", value)}
                              options={this.props.zoneTypes}
                              valueField="id"
                              labelField="name"
                              value={this.state.zoneType}/>
                </GridCell>
                <GridCell noMargin="true" width="4-10">
                    <Chip label="Tags"
                          valueField="value"
                          labelField="value"
                          options={this.props.zoneTags}
                          onchange={(value)=> this.setStateProp("tags", value)}
                          value={this.state.tags}/>
                </GridCell>
            </Grid>
        );
    }
}