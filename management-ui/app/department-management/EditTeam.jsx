import React from 'react';
import { DropDown, TextInput } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout/Grid';

export class EditTeam extends React.Component {
    state = {
        options: []
    };

    componentDidMount() {
        this.adjustNodeOptions();
    }
    
    componentDidUpdate(prevProps, prevState){
        if(!_.isEqual(prevProps.value, this.props.value)){
            this.adjustNodeOptions();
        }
    }

    handleTeamNameChange(value) {
        let val = _.cloneDeep(this.props.value);
        _.set(val, 'from.name', value)
        this.props.onChange && this.props.onChange(val);
    }

    handleNodeChange(value) {
        let val = _.cloneDeep(this.props.value);
        if(value){
            if(_.startsWith(value.name, this.props.department.type)){
                val.to = this.props.department
            } else {
                val.to = _.find(this.props.teams, {id: value.id});
            }
        }
        this.props.onChange && this.props.onChange(val);
    }

    adjustNodeOptions() {
        let options = _.cloneDeep(this.props.teams);
        if(this.props.value.from){
            options = _.reject(options, i=> i.id === this.props.value.from.id);
        }
        options.unshift(this.props.department)
        options = options.map(i => { return { id: i.id, name: i.type + ": " + i.name } });
        this.setState({ options: options });
    }

    renderTeam() {
        if (this.props.mode === "EDIT_INHERITANCE") {
            return null;
        }
        return (
            <GridCell>
                <TextInput label="Name" required={true}
                    value={this.props.value.from.name}
                    onchange={value => this.handleTeamNameChange(value)}
                />
            </GridCell>
        );

    }

    renderNode() {
        if (this.props.mode === "EDIT_NAME") {
            return null;
        }
        return (
            <GridCell>
                <DropDown label="Inherit From"
                    value={this.props.value.to}
                    onchange={value => this.handleNodeChange(value)}
                    options={this.state.options} />
            </GridCell>
        );
    }

    render() {
        return (
            <Grid>
                {this.renderTeam()}
                {this.renderNode()}
            </Grid>);
    }
}