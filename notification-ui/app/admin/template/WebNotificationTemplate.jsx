import React from 'react';
import { YesNoDropDown } from 'susam-components/advanced';
import { TextArea, TextInput } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { ColorPicker } from '../../common/ColorPicker';
import { TemplateComponent } from './TemplateComponent';

export class WebNotificationTemplate extends TemplateComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <TextInput label="Subject"
                        required={true}
                        onchange={value => this.handleChange({ subject: value })}
                        value={this.state.template.subject} />
                </GridCell>
                <GridCell width="1-1">
                    <TextArea label="Content"
                        required={true}
                        value={this.state.template.content}
                        onchange={value => this.handleChange({ content: value })} />
                </GridCell>
                <GridCell width="1-1">
                    <TextArea label="Body (Not shown in Push Notification)"
                        value={this.state.template.body}
                        onchange={value => this.handleChange({ body: value })} />
                </GridCell>
                <GridCell width="1-1">
                    <TextInput label="URL"
                        onchange={value => this.handleChange({ url: value })}
                        value={this.state.template.url} />
                </GridCell>
                <GridCell width="1-3">
                    <IconColor label="Icon Color"
                        required={true}
                        color={this.state.template.addonClass}
                        text={this.state.template.addonText}
                        onchange={value => this.handleChange({ addonClass: value })} />
                </GridCell>
                <GridCell width="1-3">
                    <TextInput label="Icon Text"
                        maxLength={2}
                        required={true}
                        onchange={value => this.handleChange({ addonText: value })}
                        value={this.state.template.addonText} />
                </GridCell>
                <GridCell width="1-3" />
                <GridCell width="1-3">
                    <YesNoDropDown label="Push Notification?"
                        required={true}
                        onchange={value => this.handleChange({ channelStatus: value ? { id: 'ACTIVE' } : { id: 'INACTIVE' } })}
                        value={'ACTIVE' === _.get(this.state.template, 'channelStatus.code')} />
                </GridCell>
                {this.renderButtons()}
            </Grid>
        );
    }
}

const defaultColor = '{"backgroundColor": "#f00", "color":"#fff"}';
class IconColor extends React.Component {
    componentDidMount() {
        if (_.isNil(this.props.color)) {
            this.props.onchange && this.props.onchange(defaultColor);
        }
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.color, this.props.color) && _.isNil(this.props.color)) {
            this.props.onchange && this.props.onchange(defaultColor);
        }
    }

    get(key) {
        return JSON.parse(_.defaultTo(this.props.color, defaultColor))[key];
    }

    handleChange(value) {
        let color = JSON.parse(this.props.color);
        for (let key in value) {
            _.set(color, key, value[key]);
        }
        this.props.onchange && this.props.onchange(JSON.stringify(color));
    }

    render() {
        return (
            <Grid collapse={true}>
                <GridCell width="1-3">
                    <div className="md-card-list-item-avatar-wrapper">
                        <span className="md-user-letters" style={JSON.parse(_.defaultTo(this.props.color, defaultColor))}>{this.props.text}</span>
                    </div>
                </GridCell>
                <GridCell width="1-3">
                    <ColorPicker label="Background"
                        color={this.get('backgroundColor')}
                        onchange={color => this.handleChange({ backgroundColor: color })} />
                </GridCell>
                <GridCell width="1-3">
                    <ColorPicker label="Text"
                        color={this.get('color')}
                        onchange={color => this.handleChange({ color: color })} />
                </GridCell>
            </Grid>
        );
    }
}