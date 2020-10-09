import React from 'react';


import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, CardSubHeader,} from 'susam-components/layout'
import {Button, TextInput, Span} from 'susam-components/basic';
import {RenderingComponent} from 'susam-components/oneorder';
import {ParticipantSelector} from './ParticipantSelector';

export class MultipleParticipantSelector extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {label: ""};

        if (props.data) {
            this.state.data = props.data;
        } else {
            this.state.data = [];
        }
        if (props.label) {
            this.state.label = props.label;
        }
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.data) {
            console.log("received" + JSON.stringify(nextProps.data));
            this.state.data = this.validateArray(nextProps.data);
        }
        this.setState(this.state);

    }

    validateArray(data) {
        if (!Array.isArray(data)) {
            let array = [];
            array.push(data);
            return array;
        }

        return data;
    }

    handleSave(selected) {

        console.log("save" + JSON.stringify(selected));

        this.state.data.push(selected);

        this.props.handleDataUpdate(this.state.data);

        this.setState(this.state);
    }

    handleDeleteSelectedCompany(id) {

        let elemIndex = -1;

        this.state.data.forEach((s, i) => {
            if (s.company.id == id) {
                elemIndex = i;
            }
        });

        if (elemIndex > -1) {
            this.state.data.splice(elemIndex, 1);
        }

        this.props.handleDataUpdate(this.state.data);

        this.setState(this.state);
    }

    handleSelectParticipantClick(event) {
        event.preventDefault();
        this.participantSelector.show();
    }

    renderStandard() {
        let readOnlyDataInterface = this.props.readOnlyDataInterface;
        return (
            <Grid>
                <GridCell width="1-1">
                    <div className="uk-form-row">
                        <div className="md-input-wrapper md-input-filled">
                            <label>{this.state.label}</label>
                        </div>
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <SelectedParticipantList data={this.state.data}
                                             readOnlyDataInterface={readOnlyDataInterface}
                                             deleteNodeHandler={(id) => this.handleDeleteSelectedCompany(id)}
                                             readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-1">
                    <Button label="Add New" onclick={(e) => this.handleSelectParticipantClick(e)}/>
                </GridCell>
                <GridCell noMargin={true} width="1-1">
                    <ParticipantSelector type="Sender" ref={(c) => this.participantSelector = c}
                                         readOnlyDataInterface={readOnlyDataInterface}
                                         onsave={(sender) => this.handleSave(sender) }/>
                </GridCell>
            </Grid>
        );
    }

    renderReadOnly() {
        let readOnlyDataInterface = this.props.readOnlyDataInterface;
        return (
            <Grid>
                <GridCell width="1-1">
                    <div className="uk-form-row">
                        <div className="md-input-wrapper md-input-filled">
                            <label>{this.state.label}</label>
                        </div>
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <SelectedParticipantList data={this.state.data}
                                             readOnlyDataInterface={readOnlyDataInterface}
                                             deleteNodeHandler={(id) => this.handleDeleteSelectedCompany(id)}
                                             readOnly={this.props.readOnly}/>
                </GridCell>
            </Grid>
        );
    }

    render() {
        return RenderingComponent.render(this);
    }
}


export class SelectedParticipantList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {
        this.state.data = this.props.data;
    }

    componentWillReceiveProps(nextProps) {

        this.state.data = nextProps.data;
        this.setState(this.state);
    }

    renderStandard() {

        let readOnlyDataInterface = this.props.readOnlyDataInterface;

        if (!this.state.data) {
            return null;
        }

        return (
            <Grid>
                {
                    this.state.data.map(elem => {
                        return (
                            <GridCell key={elem.company.id} width="1-1" noMargin={true}>
                                <div style={{float:'left'}}>
                                    <span className="uk-text-small uk-text-muted">{elem.company.name}</span>
                                </div>
                                <div style={{float:'right'}}>
                                    <i onClick={(e) => this.props.deleteNodeHandler(elem.company.id)}
                                       className="sm-icon uk-icon-times"></i>
                                </div>
                            </GridCell>
                        );
                    })
                }
            </Grid>
        );

    }

    renderReadOnly() {

        let readOnlyDataInterface = this.props.readOnlyDataInterface;

        if (!this.state.data) {
            return null;
        }

        return (
            <Grid>
                {
                    this.state.data.map(elem => {
                        return (
                            <GridCell key={elem.company.id} width="1-1" noMargin={true}>
                                {elem.company.name}
                            </GridCell>
                        );
                    })
                }
            </Grid>
        );

    }

    render() {
        return RenderingComponent.render(this);
    }
}

MultipleParticipantSelector.contextTypes = {
    translator: React.PropTypes.object
};
