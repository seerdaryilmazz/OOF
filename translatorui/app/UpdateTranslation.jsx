import React from "react";
import _ from "lodash";
import {Grid, GridCell, Card, CardSubHeader, PageHeader} from "susam-components/layout";
import {Button, DropDown, TextInput, Notify} from "susam-components/basic";
import {TranslatorService} from "./services/TranslatorService";
import {SupportedLocales} from "./SupportedLocales";

export class UpdateTranslation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            appName: 'order',
            key: '',
            translations: [],
            supportedLocales: [],
        };
        this.lookups = {
            appName: [
                // TO-DO: App names should come from an external source
                {
                    id: 'order',
                    name: 'Order Application'
                },
                {
                    id: 'tag',
                    name: 'Tag Application'
                },
                {
                    id: 'crm',
                    name: 'Crm Application'
                },
                {
                    id: 'kartoteks',
                    name: 'Kartoteks Application'
                },
                {
                    id: 'sales',
                    name: 'Sales Application'
                },
                {
                    id: 'salesbox',
                    name: 'Sales Box Application'
                },
                {
                    id: 'management',
                    name: 'Management Application'
                }
            ]
        }; 
        this.loadSupportedLocales();
    }

    loadSupportedLocales() {
        TranslatorService.getSupportedLocales().then(response => {
            this.setState({supportedLocales: response.data});
            this.reloadTranslations(this.state.appName, this.state.key);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    save() {
        TranslatorService.putTranslations(this.state.translations).then(response => {
            this.reloadTranslations(this.state.appName, this.state.key, ()=>Notify.showSuccess('Saved'));
        }).catch(error => {
            Notify.showError(error);
        });
    }

    reloadTranslations(appName, key, callback) {
        if (appName && key) {
            TranslatorService.getTranslation(appName, key).then(response => {
                let foundTranslations = response.data;
                let translations = this.state.supportedLocales.map(locale=> {
                    let translation = null;
                    if (foundTranslations) {
                        let matched = foundTranslations.filter(foundTranslation=> {
                            return foundTranslation.localeId == locale.id;
                        });

                        if (matched && matched.length > 0) {
                            translation = matched[0];
                        }
                    }
                    if (!translation) {
                        translation = {
                            localeId: locale.id,
                            key: this.state.key,
                            appName: this.state.appName,
                            value: ''
                        };
                    }
                    translation.localeName = locale.name;
                    return translation;
                });
                this.setState({translations: translations}, callback && callback);
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    changeAppName(appName) {
        this.setState({appName: appName});
        this.reloadTranslations(appName, this.state.key)
    }

    changeKey(key) {
        this.setState({key: key});
        this.reloadTranslations(this.state.appName, key)
    }

    changeTranslation(localeId, value) {
        let translations = _.cloneDeep(this.state.translations);
        translations.forEach(translation => {
            if (translation.localeId == localeId) {
                translation.value = value;
            }
        });
        this.setState({translations, translations});
    }

    supportedLocalesChanged() {
        this.loadSupportedLocales();
    }

    getSelectedApp() {
        if (this.state.appName) {
            return {id: this.state.appName};
        } else {
            return null;
        }
    }
    render() {
        let width = '1-' + this.state.translations.length;
        let textInputs = this.state.translations.map(translation => {
            return (
                <GridCell width={width} key={translation.localeId}>
                    <TextInput label={translation.localeName} value={translation.value} key={translation.localeId}
                               onchange={(value) => this.changeTranslation(translation.localeId, value)}/>
                </GridCell>
            );
        });

        return (
            <div>
                <PageHeader title="Update Translation"/>
                <Grid>
                    <GridCell width="1-1">
                        <Card title="Translations">
                            <Grid>
                                <GridCell width="1-3">
                                    <DropDown label="App Name"
                                              onchange={(value) => this.changeAppName(value ? value.id : null)}
                                              value={this.getSelectedApp()}
                                              options={this.lookups.appName}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <TextInput label="Key" onchange={(value) => this.changeKey(_.toLower(value))}
                                               value={this.state.key}/>
                                </GridCell>
                                <GridCell width="1-3"></GridCell>
                            </Grid>
                            <Grid>
                                {textInputs}
                            </Grid>
                            <Grid>
                                <GridCell width="1-1">
                                    <div className="uk-float-right">
                                        <Button label="SAVE" style="primary" waves={true}
                                                onclick={() => this.save()}/>
                                    </div>
                                </GridCell>
                            </Grid>
                        </Card>
                    </GridCell>
                    <GridCell width="1-1">
                        <SupportedLocales onchange={() => this.supportedLocalesChanged()}/>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}