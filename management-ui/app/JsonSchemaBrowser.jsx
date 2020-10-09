import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {TextInput, DropDown, Notify, Button} from "susam-components/basic";
import {AutoComplete, Chip} from "susam-components/advanced";

const PRESENTATION_MODE_DROPDOWNS = 1;
const PRESENTATION_MODE_AUTOCOMPLETE = 2;
const PRESENTATION_MODE_BOTH = 3;

export class JsonSchemaBrowser extends TranslatingComponent {

    constructor(props) {

        super(props);

        this.state = {
            presentationMode: props.presentationMode ? props.presentationMode : PRESENTATION_MODE_BOTH,
            schemaServiceUrlPrefix: props.schemaServiceUrlPrefix ? props.schemaServiceUrlPrefix : "/order-service/schema?className=",
            rootClass: props.rootClass ? props.rootClass : "ekol.orders.domain.TransportOrder",
            levelVersusProperties: [], // index: level, value: properties array
            levelVersusSelectedProperty: [], // index: level, value: selected property
            selectedProperty: null,
            classPropertiesCache: []
        }
    }

    componentDidMount() {
        if (this.state.presentationMode == PRESENTATION_MODE_DROPDOWNS || this.state.presentationMode == PRESENTATION_MODE_BOTH) {
            this.loadPropertiesForLevel(this.state.rootClass, 0);
        }
    }

    normalizeProperties(propertiesObject, displayNamePrefix) {

        let properties = [];

        let keys = _.keys(propertiesObject);

        if (_.size(keys) > 0) {

            keys = _.sortBy(keys, item => {
                return item;
            });

            keys.forEach(item => {
                let property = _.get(propertiesObject, item);
                property._id = uuid.v4();
                property._name = item;
                property._displayName = displayNamePrefix + item;
                properties.push(property);
            });
        }

        return properties;
    }

    getProperties(clazz, propertyPrefix, callbackFunction) {

        let classPropertiesCache = _.cloneDeep(this.state.classPropertiesCache);

        let foundIndex = _.findIndex(classPropertiesCache, element => {
            return element.clazz == clazz;
        });

        if (foundIndex >= 0) {
            console.log("from cache");
            callbackFunction(classPropertiesCache[foundIndex].properties);
        } else {

            axios.get(this.state.schemaServiceUrlPrefix + clazz).then(response => {
                console.log("from url");
                let properties = this.normalizeProperties(response.data.properties, propertyPrefix);

                let cacheData = {
                    clazz: clazz,
                    properties: properties
                };

                if (classPropertiesCache.length < 20) {
                    classPropertiesCache.push(cacheData);
                } else {
                    // 0 yerine başka bir index de olabilir. En mantıklısı yeni kaydı,
                    // en az kullanılan veya en uzun süredir kullanılmayan kaydın yerine koymak.
                    classPropertiesCache[0] = cacheData;
                }

                this.setState({classPropertiesCache: classPropertiesCache});

                callbackFunction(properties);

            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    loadPropertiesForLevel(clazz, level) {

        let callbackFunction = (properties) => {
            if (properties.length > 0) {
                let levelVersusProperties = _.cloneDeep(this.state.levelVersusProperties);
                levelVersusProperties[level] = properties;
                this.setState({levelVersusProperties: levelVersusProperties});
            }
        };

        this.getProperties(clazz, "", callbackFunction);
    }

    handleOnChangeDropdown(value, level) {

        let levelVersusProperties = _.cloneDeep(this.state.levelVersusProperties);
        let levelVersusSelectedProperty = _.cloneDeep(this.state.levelVersusSelectedProperty);

        levelVersusSelectedProperty[level] = value;

        let size = _.size(levelVersusProperties);

        if (level < size - 1) {
            let numberOfItemsToBeDeleted = size - 1 - level;
            levelVersusProperties = _.dropRight(levelVersusProperties, numberOfItemsToBeDeleted);
        }

        size = _.size(levelVersusSelectedProperty);

        if (level < size - 1) {
            let numberOfItemsToBeDeleted = size - 1 - level;
            levelVersusSelectedProperty = _.dropRight(levelVersusSelectedProperty, numberOfItemsToBeDeleted);
        }

        this.setState({levelVersusProperties: levelVersusProperties, levelVersusSelectedProperty: levelVersusSelectedProperty});

        let clazz = null;

        if (value.type == "object") {
            clazz = value.id.substr(15).split(':').join('.');
        } else if (value.type == "array" && value.items.type == "object") {
            clazz = value.items.id.substr(15).split(':').join('.');
        }

        if (clazz) {
            this.loadPropertiesForLevel(clazz, level + 1);
        }
    }

    handleOnChangeAutocomplete(value) {
        this.setState({selectedProperty: value});
    }

    handleOnClearAutocomplete() {
        this.setState({selectedProperty: null});
    }

    autocompleteCallback = (release, val) => {

        let selectedProperty = {
            _id: uuid.v4(),
            _displayName: val
        };

        this.setState({selectedProperty: selectedProperty});

        // Aşağıda this.setState(...) çağırıldığında autocomplete içideki değer kayboluyor.
        // Bu değer kaybolmasın diye yukarıdaki işlemi yapıyoruz.
        this.loadAutocompleteData(release, this.state.rootClass, "", val);
    };

    loadAutocompleteData(release, clazz, propertyPrefix, hierarchicalPropertyName) {

        let callbackFunction = (properties) => {

            if (properties.length > 0) {

                let indexOfFirstDot = hierarchicalPropertyName.indexOf(".");
                let propertyName = null;

                if (indexOfFirstDot > 0) {
                    propertyName = hierarchicalPropertyName.substring(0, indexOfFirstDot);
                } else if (indexOfFirstDot == -1) {
                    propertyName = hierarchicalPropertyName;
                }

                if (propertyName) {

                    let property = _.find(properties, element => {
                        return element._name == propertyName;
                    });

                    if (property) {

                        if (indexOfFirstDot > 0) {

                            let nextHierarchicalPropertyName = hierarchicalPropertyName.substring(indexOfFirstDot + 1);

                            if (nextHierarchicalPropertyName || _.size(nextHierarchicalPropertyName) == 0) {

                                let nextClazz = null;

                                if (property.type == "object") {
                                    nextClazz = property.id.substr(15).split(':').join('.');
                                } else if (property.type == "array" && property.items.type == "object") {
                                    nextClazz = property.items.id.substr(15).split(':').join('.');
                                }

                                if (nextClazz) {
                                    let nextPropertyPrefix = propertyPrefix + propertyName + ".";
                                    this.loadAutocompleteData(release, nextClazz, nextPropertyPrefix, nextHierarchicalPropertyName);
                                } else {
                                    release([]);
                                }

                            } else {
                                // Kullanıcıya fikir vermek adına listenin tamamı gösterilecek.
                                release(properties);
                            }

                        } else {
                            release([property])
                        }

                    } else {

                        let propertiesToBeReleased = [];

                        properties.forEach(element => {
                            if (element._name.indexOf(propertyName) >= 0) {
                                propertiesToBeReleased.push(element);
                            }
                        });

                        if (propertiesToBeReleased.length > 0) {
                            release(propertiesToBeReleased);
                        } else {
                            // Kullanıcıya fikir vermek adına listenin tamamı gösterilecek.
                            release(properties);
                        }
                    }

                } else {
                    // Kullanıcıya fikir vermek adına listenin tamamı gösterilecek.
                    release(properties);
                }

            } else {
                Notify.showError("One or more properties were expected but there is no property. Check class: " + clazz);
            }
        };

        this.getProperties(clazz, propertyPrefix, callbackFunction);
    }

    handleSelectClickedDropdown() {

        let levelVersusSelectedProperty = _.cloneDeep(this.state.levelVersusSelectedProperty);

        if (levelVersusSelectedProperty.length == 0) {
            Notify.showError("A property must be selected.");
        } else {
            console.log("onSelect (dropdown)");
            console.log(levelVersusSelectedProperty);
            if (this.props.onSelect) {
                this.props.onSelect(levelVersusSelectedProperty);
            }
        }
    }

    handleSelectClickedAutocomplete() {

        let str = null;

        console.log("_.size(str)");
        console.log(_.size(str));

        // Burada özellikle "state.selectedProperty"'yi değil "autocompleteCompRef.getInputValue()"'yu baz alıyoruz.
        this.checkAndTriggerOnSelect(this.state.rootClass, this.autocompleteCompRef.getInputValue(), []);
    }

    checkAndTriggerOnSelect(clazz, hierarchicalPropertyName, selectedProperties) {

        let callbackFunction = (properties) => {

            if (properties.length > 0) {

                let indexOfFirstDot = hierarchicalPropertyName.indexOf(".");
                let propertyName = null;

                if (indexOfFirstDot > 0) {
                    propertyName = hierarchicalPropertyName.substring(0, indexOfFirstDot);
                } else if (indexOfFirstDot == -1) {
                    propertyName = hierarchicalPropertyName;
                }

                if (propertyName) {

                    let property = _.find(properties, element => {
                        return element._name == propertyName;
                    });

                    if (property) {

                        selectedProperties.push(property);

                        if (indexOfFirstDot > 0) {

                            let nextHierarchicalPropertyName = hierarchicalPropertyName.substring(indexOfFirstDot + 1);

                            if (nextHierarchicalPropertyName) {

                                let nextClazz = null;

                                if (property.type == "object") {
                                    nextClazz = property.id.substr(15).split(':').join('.');
                                } else if (property.type == "array" && property.items.type == "object") {
                                    nextClazz = property.items.id.substr(15).split(':').join('.');
                                }

                                if (nextClazz) {
                                    this.checkAndTriggerOnSelect(nextClazz, nextHierarchicalPropertyName, selectedProperties);
                                } else {
                                    Notify.showError(propertyName + " does not correspond to an object or an array of objects.");
                                }

                            } else {
                                Notify.showError("Entered value cannot end with a dot.");
                            }

                        } else {
                            // finish
                            console.log("onSelect (autocomplete)");
                            console.log(selectedProperties);
                            if (this.props.onSelect) {
                                this.props.onSelect(selectedProperties);
                            }
                        }

                    } else {
                        Notify.showError("There is no property with name " + propertyName + " in class " + clazz + ".");
                    }

                } else {
                    Notify.showError("Entered value cannot be empty, cannot start with a dot, cannot contain consecutive dots.");
                }

            } else {
                Notify.showError("One or more properties were expected but there is no property. Check class: " + clazz);
            }
        };

        this.getProperties(clazz, "", callbackFunction);
    }

    reset() {
        this.setState({levelVersusProperties: [], levelVersusSelectedProperty: [], selectedProperty: null});
    }

    renderForPresentationModeDropdowns() {

        let size = _.size(this.state.levelVersusProperties);

        let gridCells = this.state.levelVersusProperties.map((item, index) => {
            return (
                <GridCell key={"gridCell-" + (index + 1)} width={"1-" + (size + 1)}>
                    <DropDown label="Property"
                              onchange={(value) => this.handleOnChangeDropdown(value, index)}
                              options={this.state.levelVersusProperties[index]}
                              value={this.state.levelVersusSelectedProperty[index]}
                              disabled={true}
                              valueField="_id"
                              labelField="_name"/>
                </GridCell>
            );
        });

        gridCells.push(
            <GridCell key={"gridCell-" + (size + 1)} width={"1-" + (size + 1)}>
                <Button label="Select" style="primary" waves={true} onclick={() => this.handleSelectClickedDropdown()}/>
            </GridCell>
        );

        return (
            <Grid>
                {gridCells}
            </Grid>
        );
    }

    renderForPresentationModeAutocomplete() {

        return (
            <Grid>
                <GridCell width="2-3">
                    <AutoComplete ref={(c) => this.autocompleteCompRef = c}
                                  label="Property"
                                  readOnly={false}
                                  minLength="0"
                                  onchange={(value) => this.handleOnChangeAutocomplete(value)}
                                  value={this.state.selectedProperty}
                                  onclear={() => this.handleOnClearAutocomplete()}
                                  callback={this.autocompleteCallback}
                                  flipDropdown={true}
                                  hideLabel={false}
                                  placeholder="Enter a property name"
                                  valueField="_id"
                                  labelField="_displayName"/>
                </GridCell>
                <GridCell width="1-3">
                    <Button label="Select" style="primary" waves={true} onclick={() => this.handleSelectClickedAutocomplete()}/>
                </GridCell>
            </Grid>
        );
    }

    render() {

        let content;

        if (this.state.presentationMode == PRESENTATION_MODE_DROPDOWNS) {
            content = this.renderForPresentationModeDropdowns();
        } else if (this.state.presentationMode == PRESENTATION_MODE_AUTOCOMPLETE) {
            content = this.renderForPresentationModeAutocomplete();
        } else if (this.state.presentationMode == PRESENTATION_MODE_BOTH) {
            content = (
                <Grid>
                    <GridCell width="1-1">
                        {this.renderForPresentationModeDropdowns()}
                    </GridCell>
                    <GridCell width="1-1">
                        {this.renderForPresentationModeAutocomplete()}
                    </GridCell>
                </Grid>
            );
        } else {
            content = ("Invalid presentation mode");
        }

        return content;
    }
}

JsonSchemaBrowser.contextTypes = {
    translator: React.PropTypes.object
};