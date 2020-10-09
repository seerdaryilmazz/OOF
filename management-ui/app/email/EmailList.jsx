import * as axios from 'axios';
import React from 'react';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import { Button, DropDown, Notify, Span } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, Modal, Pagination } from 'susam-components/layout';
import uuid from 'uuid';

function transform(node, index) {
    if (node.type === 'tag' && (node.name === 'html' || node.name === 'head' || node.name === 'body')) {
        node.name = 'div'
        return convertNodeToElement(node, index, transform);
    }
    if (node.type === 'tag' && node.name === 'meta') {
        return null;
    }
}
export class EmailList extends React.Component {
    state = {
        concerns: [],
        sources: [],
        sentStatuses: [],
        page: 1,
        emailList: {
            content: []
        },
        attachments: []
    };

    constructor(props) {
        super(props);
        
        axios.all([
            axios.get(`/email-service/lookup/source`),
            axios.get(`/email-service/lookup/sent-status`)
        ]).then(axios.spread((source, sentStatus)=>{
            this.setState({ 
                sources: source.data,
                sentStatuses: sentStatus.data
            })
        }))
    }

    list(page = this.state.page) {
        let params = {
            source: _.get(this.state.source, 'code'),
            concern: _.get(this.state.concern, 'code'),
            sentStatus: _.get(this.state.sentStatus, 'code'),
            page: page - 1
        }
        axios.all([
            axios.get(`/email-service/list-by`, { params: params }),
        ]).then(axios.spread((list) => {
            this.setState({
                emailList: list.data,
                page: page
            })
        })).catch(error=>Notify.showError(error));
    }

    getConcerns() {
        if (this.state.source) {
            axios.get(`/email-service/lookup/concern`, { params: { source: _.get(this.state.source, 'code') } })
                .then(response => this.setState({ concerns: response.data }));
        } else {
            this.setState({ concerns: [] })
        }
    }

    listAttachments() {
        this.setState({ attachments: [] }, () => {
            this.state.email.attachments.forEach(att => {
                axios.get(`/file-service/${att}`).then(response => {
                    this.setState(prevState => {
                        prevState.attachments.push(<a key={uuid.v4()} href={`/file-service/${response.data.id}/download`}>
                            <span className="uk-badge uk-badge-outline wide-badge uk-margin-small-right">
                                {response.data.name}
                            </span>
                        </a>);
                        return prevState;
                    })
                })
            })
        });
    }

    renderReceipents(receipents) {
        let arr = _.get(this.state.email, _.toLower(receipents));
        if (_.isEmpty(arr)) {
            return null;
        }
        return (
            <GridCell width="1-1">
                <Span label={receipents} value={_.join(arr, ', ')} />
            </GridCell>
        );
    }

    renderBody() {
        let body = _.get(this.state.email, 'body');
        if (_.get(this.state.email, 'html')) {
            const options = {
                decodeEntities: true,
                transform
            };
            return ReactHtmlParser(body, options);
        }
        return body;
    }

    sendMail(id = this.state.email.id){
        axios.get(`/email-service/${id}/send`).then(response=>{
            Notify.showSuccess("Mail has been sent");
            setTimeout(()=>this.list(), 2000)
        }).catch(error=>Notify.showError(error));
    }

    render() {
        return (
            <Card>
                <Grid>
                    <GridCell width="1-5">
                        <DropDown options={this.state.sources}
                            label="Source"
                            value={this.state.source}
                            onchange={value => this.setState({ source: value, concern: null, page: 1 }, () => {
                                this.getConcerns();
                                this.list();
                            })}
                            valueField="code" />
                    </GridCell>
                    <GridCell width="1-5">
                        <DropDown options={this.state.concerns}
                            label="Concern"
                            value={this.state.concern}
                            onchange={value => this.setState({ concern: value, page: 1 }, () => this.list())}
                            valueField="code" />
                    </GridCell>
                    <GridCell width="1-5">
                        <DropDown options={this.state.sentStatuses}
                            label="Sent Status"
                            value={this.state.sentStatus}
                            onchange={value => this.setState({ sentStatus: value, page: 1 }, () => this.list())}
                            valueField="code" />
                    </GridCell>
                    <GridCell width="2-5" />
                    <GridCell width="1-1">
                        <DataTable.Table data={this.state.emailList.content}>
                            <DataTable.Text field="subject" header="Subject" />
                            <DataTable.Text field="createdBy" header="Sender User" />
                            <DataTable.Text field="sentStatus.name" header="Sent Status" />
                            <DataTable.Text field="sentTime" header="Sent Time" />
                            <DataTable.Text field="createdAt" header="Create Time" />
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper track="onclick" onaction={value => this.setState({ email: value }, () => this.emailModal.open())}>
                                    <Button label="show" flat={true} style="primary" size="small" />
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper shouldRender={item=>'SUCCESSFUL' != _.get(item, "sentStatus.code")} track="onclick" onaction={value => this.sendMail(value.id)}>
                                    <Button label="send" flat={true} style="warning" size="small" />
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper shouldRender={item => !_.isEmpty(item.exceptionStackTrace)} track="onclick" onaction={value => this.setState({ email: value }, () => this.errorModal.open())}>
                                    <Button label="error" flat={true} style="danger" size="small" />
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                        <Pagination page={this.state.page} range={10}
                            totalElements={this.state.emailList.totalElements}
                            onPageChange={page => this.list(page)}
                            totalPages={this.state.emailList.totalPages} />
                    </GridCell>
                </Grid>
                <Modal ref={c => this.emailModal = c}
                    actions={[{ label: "Close", action: () => this.emailModal.close(), buttonStyle: "primary" }]}
                    onclose={() => this.setState({ attachments: [], email: null })}
                    onopen={() => this.listAttachments()}
                    large={true}>
                    <Grid>
                        <GridCell width="1-1">
                            <Span label="Subject" value={_.get(this.state.email, 'subject')} />
                        </GridCell>
                        {this.renderReceipents('To')}
                        {this.renderReceipents('Cc')}
                        {this.renderReceipents('Bcc')}
                        <GridCell width="1-1" style={{ whiteSpace: "pre-wrap" }}>
                            {this.renderBody()}
                        </GridCell>
                        <GridCell width="1-1">
                            {this.state.attachments}
                        </GridCell>
                    </Grid>
                </Modal>
                <Modal title="Error"
                    large={true}
                    ref={c => this.errorModal = c}>
                    <div style={{ whiteSpace: "pre-wrap" }}>
                        {_.get(this.state.email, 'exceptionStackTrace')}
                    </div>
                </Modal>
            </Card>
        )
    }
}