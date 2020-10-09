import * as axios from 'axios';
import React from 'react';
import ReactJson from 'react-json-view';
import { Switch } from 'susam-components/advanced/Switch';
import { Button, Form, Notify, TextInput } from 'susam-components/basic';
import { Card, Grid, GridCell, ListHeading, Modal, PageHeader } from 'susam-components/layout';
import { SearchUtils } from "susam-components/utils/SearchUtils";
import { NotificationChannelService, NotificationManagementService, NotificationTemplateService } from '../../service/NotificationService';
import { Template } from './Template';

const DEFAULT_CHANNEL_CODE = 'WEB_PUSH';
const searchUtil = new SearchUtils(['concern.code', 'concern.name']);
export class TemplateManagement extends React.Component {
    state = {
        filter: "",
        filteredConcerns: [],
        concerns: [],
        channels: [],
        channel: null
    };

    constructor(props) {
        super(props);
        axios.all([
            NotificationChannelService.list(),
            NotificationManagementService.listConcerns()
        ]).then(axios.spread((channel, concern, ) => {
            this.setState({ channels: channel.data, concerns: concern.data, filteredConcerns: concern.data });
        })).catch(error=>Notify.showError(error));
    }

    handleUpdateConcernStatus(concern, status) {
        NotificationManagementService.updateStatus({ concern: concern, status: status }).then(response => {
            this.setState({ concern: response.data });
            return NotificationManagementService.listConcerns();
        }).then(response => {
            this.setState({ concerns: response.data, filteredConcerns: searchUtil.search(this.state.filter, response.data) });
        }).catch(error=>Notify.showError(error));
    }

    handleChangeConcern(concern) {
        let channel = _.find(this.state.channels, i => DEFAULT_CHANNEL_CODE === i.channel.code)
        this.setState({
            concern: concern,
            channel: channel,
            template: _.find(concern.templates, i => channel.channel.code === i.channel.code) || {}
        });
    }

    handleUpdateTemplateStatus(id, status) {
        NotificationTemplateService.patch(id, { status: status }).then(response => {
            this.setState({ template: response.data });
            return NotificationManagementService.listConcerns();
        }).then(response => {
            let concern = _.find(response.data, i => i.concern.code === this.state.concern.concern.code);
            this.setState({ concerns: response.data, concern: concern, filteredConcerns: searchUtil.search(this.state.filter, response.data) });
        }).catch(error=>Notify.showError(error));
    }

    handleSaveTemplate(template) {
        if (this.templateForm.validate()) {
            NotificationTemplateService.save(template.id, template).then(response => {
                this.setState({ template: response.data });
                Notify.showSuccess("Template is saved")
                return NotificationManagementService.listConcerns();
            }).then(response => {
                let concern = _.find(response.data, i => i.concern.code === this.state.concern.concern.code);
                this.setState({ concerns: response.data, concern: concern, filteredConcerns: searchUtil.search(this.state.filter, response.data) });
            }).catch(error => Notify.showError(error));
        }
    }

    handleFilter(value) {
        this.setState(prevState => ({ filter: value, filteredConcerns: searchUtil.search(value, prevState.concerns) }));
    }

    showSample() {
        NotificationManagementService.getSample(this.state.concern.concern.code).then(response => {
            this.setState({ sampleData: response.data }, ()=>this.modal.open());
        }).catch(error => Notify.showError(error));
    }

    iconColor(item, channel) {
        let template = _.find(item.templates, i => i.channel.code === channel);
        if (template) {
            if ('ACTIVE' === template.status.code && 'INACTIVE' === template.channelStatus.code) {
                return 'md-color-orange-500';
            } else if ('ACTIVE' === template.status.code) {
                return 'md-color-blue-500';
            }
            return "md-color-grey-500";
        } else {
            return 'md-color-red-500';
        }
    }

    renderConcerns() {
        return (
            <ul className="md-list md-list-centered">
                {this.state.filteredConcerns.map(item => {
                    let className = 'uk-text-primary ';
                    className += _.get(this.state, 'concern.concern.code') === item.concern.code ? 'active-list-element ' : '';
                    return (
                        <li key={item.concern.code} className={className} onClick={() => this.handleChangeConcern(item)}>
                            <Grid collapse={true}>
                                <GridCell width="4-5" noMargin={true}>
                                    <div style={{ display: 'inline-block' }}>
                                        <Switch key={`${item.concern.code}:${item.status.code}`}
                                            value={'ACTIVE' === item.status.code}
                                            onChange={value => this.handleUpdateConcernStatus(item.concern.code, value ? 'ACTIVE' : 'INACTIVE')}
                                            style="primary"
                                            disabled={_.isEmpty(item.templates)} />
                                    </div>
                                    <div style={{ display: 'inline-block' }}>
                                        <span className="md-list-heading" data-uk-tooltip="{cls:'long-text', pos:'right'}" title={item.concern.name}>
                                            {item.concern.code}
                                        </span>
                                    </div>
                                </GridCell>
                                <GridCell width="1-5" noMargin={true}>
                                    <div className="uk-text-right">
                                        <i className={`material-icons ${this.iconColor(item, 'WEB_PUSH')}`}>notifications_none</i>
                                        <i className={`material-icons ${this.iconColor(item, 'EMAIL')}`}>mail_outline</i>
                                    </div>
                                </GridCell>
                            </Grid>
                        </li>
                    );
                })}
            </ul>
        )
    }

    renderChannels() {
        if (!this.state.concern) {
            return;
        }
        return (
            <Grid collapse={true}>
                <GridCell width="9-10">
                    <ul className="md-list md-list-centered">
                        {this.state.channels.map((channel, index) => {
                            let className = 'uk-text-primary ';
                            className += _.get(this.state, 'channel.channel.code') === channel.channel.code ? 'active-list-element ' : '';
                            className += this.iconColor(this.state.concern, channel.channel.code);
                            let template = _.find(this.state.concern.templates, i => i.channel.code === channel.channel.code) || {};
                            return (
                                <li style={{ float: 'left', border: "0px solid", width: "unset" }} className={className} key={index} onClick={() => this.setState({ channel: channel, template: template })}>
                                    <div style={{ display: 'inline-block' }}>
                                        <Switch key={_.get(template,'status.code','INACTIVE')}
                                            value={'ACTIVE' === _.get(template,'status.code')}
                                            onChange={value => this.handleUpdateTemplateStatus(template.id, value ? 'ACTIVE' : 'INACTIVE')}
                                            style="primary"
                                            disabled={_.isEmpty(template)} />
                                    </div>
                                    <div style={{ display: 'inline-block' }}>
                                        <ListHeading value={channel.channel.name} />
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </GridCell>
                <GridCell width="1-10">
                    <Button mdIcon="code" iconColor="md-color-grey-500" flat={true} onclick={() => this.showSample()} />
                    <Modal ref={(c) => this.modal = c}
                        closeOnEscKeyPressed={true}
                        title={`${this.state.concern.concern.code} Sample Data`}
                        onclose={() => this.setState({sampleData: undefined})}
                        medium={true}
                        style={{ height: "70%" }}>
                        <div style={{ overflow: "hidden auto", display: "block", minHeight: "70%" }}>
                            <ReactJson src={_.get(this.state, 'sampleData.data')}
                                name="sample"
                                iconStyle="triangle"
                                theme="ocean"
                                displayObjectSize={false}
                                displayDataTypes={false} />
                        </div>
                    </Modal>
                </GridCell>
            </Grid>
        )
    }

    render() {
        return (
            <div>
                <PageHeader title="Notification Management" />
                <Card>
                    <Grid divider={true}>
                        <GridCell width="3-10">
                            <TextInput placeholder="Filter..." value={this.state.filter} onchange={value => this.handleFilter(value)} />
                            {this.renderConcerns()}
                        </GridCell>
                        <GridCell width="7-10" >
                            <Grid collapse={true}>
                                <GridCell width="1-1">
                                    {this.renderChannels()}
                                </GridCell>
                                <GridCell width="1-1">
                                    <Form ref={c => this.templateForm = c}>
                                        <Template template={this.state.template}
                                            concern={_.get(this.state,'concern.concern')}
                                            channel={this.state.channel}
                                            onStatusUpdate={(id, status) => this.handlePatchTemplate(id, { status: status })}
                                            onSave={template => this.handleSaveTemplate(template)} />
                                    </Form>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}