import React from 'react';
import { Button } from 'susam-components/basic';
import { GridCell } from 'susam-components/layout';

export class TemplateComponent extends React.Component {
    state = {
        template: {}
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.init();
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.template, this.props.template) || !_.isEqual(nextProps.concern, this.props.concern)) {
            this.init(nextProps);
        }
    }
    
    handleChange(values) {
        let template = _.cloneDeep(this.state.template);
        for (let key in values) {
            _.set(template, key, values[key]);
        }
        this.setState({ template: template });
    }

    init(props = this.props) {
        let tmp = _.cloneDeep(props.template);
        if (!tmp.channel) {
            tmp.channel = props.channel.channel;
        }
        if (!tmp.concern) {
            tmp.concern = props.concern;
        }
        if (!tmp.status) {
            tmp.status = { code: 'ACTIVE', name: 'ACTIVE' };
        }
        if (!tmp.channelStatus) {
            tmp.channelStatus = { code: 'ACTIVE', name: 'ACTIVE' };
        }
        this.setState({ template: tmp });
    }

    renderButtons() {
        return (
            <GridCell width="1-1">
                <div className="uk-text-right">
                    <Button label="save" style="primary" onclick={() => this.props.onSave && this.props.onSave(this.state.template)} />
                </div>
            </GridCell>
        )
    }

    renderStatusButton() {
        let templateId = _.get(this.props.template,'id');
        if (templateId) {
            let active = _.get(this.props.template, 'status.code') === 'ACTIVE';
            let label = active ? 'inactivate' : 'activate';
            let style = active ? 'danger' : 'success';
            let nextStatus = active ? 'INACTIVE' : 'ACTIVE';
            return <Button label={label} style={style} onclick={() => this.props.onStatusUpdate && this.props.onStatusUpdate(templateId, nextStatus)} />
        }
        return null;
    }

}