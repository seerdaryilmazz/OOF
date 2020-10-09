import * as axios from 'axios';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Switch } from 'susam-components/advanced/Switch';
import { Card, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { NotificationService, UserPreferenceService } from '../service/NotificationService.jsx';

export class UserPreferences extends TranslatingComponent {

    state = {
        data: [],
        columnHeaders: []
    };
    constructor(props) {
        super(props);
        this.init();
    }

    init() {
        axios.all([
            UserPreferenceService.my(),
            NotificationService.lookup('channel'),
        ]).then(axios.spread((list, channel) => {
            this.setState({
                data: list.data,
                columnHeaders: channel.data
            });
        }));
    }

    handleSettingChange(id, value) {
        UserPreferenceService.updateStatus(id, { status: value ? 'ACTIVE' : 'INACTIVE' }).then(response => {
            return UserPreferenceService.my();
        }).then(response => {
            this.setState({
                data: response.data
            });
        });
    }

    handleChannelSettingChange(id, channel, value) {
        UserPreferenceService.updateChannelStatus(id, { status: value ? 'ACTIVE' : 'INACTIVE', channel: channel }).then(response => {
            return UserPreferenceService.my();
        }).then(response => {
            this.setState({
                data: response.data
            });
        });
    }

    render() {
        let columCount = this.state.columnHeaders.length + 2;
        return (
            <div>
                <PageHeader title="My Notification Preferences" translate={true} />
                <Card>
                    <Grid collapse={true}>
                        <GridCell width={`2-${columCount}`} >
                            <div className="uk-text-bold">
                                {super.translate("Notification")}
                            </div>
                        </GridCell>
                        {this.state.columnHeaders.map(i => <GridCell width={`1-${columCount}`} textCenter={true} key={i.code}>
                            <div className="uk-text-bold">
                                {i.code === 'WEB_PUSH' ? super.translate("Web Push"): super.translate(i.name)}
                            </div>
                        </GridCell>)}
                    </Grid>
                    {this.state.data.map(item => <Grid collapse={true} key={item.id} divider={true}>
                        <GridCell width={`2-${columCount}`}>
                            <Switch value={'ACTIVE' === item.status.code} 
                                translate={true}
                                style="primary" 
                                label={item.concern.name} 
                                onChange={value => this.handleSettingChange(item.id, value)} />
                        </GridCell>
                        {this.state.columnHeaders.map(c => <GridCell width={`1-${columCount}`} key={c.code} textCenter={true}>
                            <Switch key={item.id + item.status.code} disabled={'INACTIVE' === item.status.code} value={'ACTIVE' === item.channels[c.code].code} style="primary" onChange={value=> this.handleChannelSettingChange(item.id, c.code, value)} />
                        </GridCell>)}
                    </Grid>)}
                </Card>
            </div>
        );
    }
} 
UserPreferences.contextTypes = {
    translator: React.PropTypes.object,
}