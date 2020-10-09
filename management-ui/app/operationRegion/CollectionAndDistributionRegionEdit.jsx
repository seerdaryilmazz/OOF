import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Modal, PageHeader} from "susam-components/layout";
import {Notify, TextInput, DropDown, Button} from "susam-components/basic";
import {Map, Chip} from "susam-components/advanced";
import {RegionMapWithPostcodeFilter} from "./RegionMapWithPostcodeFilter";

import {ZoneService, LocationService} from '../services';

export class CollectionAndDistributionRegionEdit extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            isCollectionRegionEdit: true,
            data: null,
            name: null,
            tags: [],
            polygonRegionsThatCanBeAdded: [],
            polygonRegionsThatCannotBeAdded: [],
            polygonRegionsThatAreAdded: [],
            allTags: [],
            regionCategories: [],
            caller: uuid.v4()
        };
    }

    componentDidMount() {
        this.loadTags();
        this.loadRegionCategories();
    }

    componentWillReceiveProps(nextProps) {
    }

    loadTags() {
        ZoneService.getZoneTags().then(response => {
            this.setState({allTags: response.data ? response.data : []});
        }).catch(error => {
            this.setState({allTags: []});
            Notify.showError(error);
        });
    }

    loadRegionCategories() {
        ZoneService.getRegionCategories().then(response => {
            this.setState({regionCategories: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updateName(value) {
        this.setState({name: value});
    }

    updateTags(value) {
        this.setState({tags: value});
    }

    open(isCollectionRegionEdit, data, polygonRegionsThatCanBeAdded, polygonRegionsThatCannotBeAdded, polygonRegionsThatAreAdded) {

        this.modal.open();

        let state = _.cloneDeep(this.state);

        state.isCollectionRegionEdit = isCollectionRegionEdit;
        state.data = _.cloneDeep(data);
        state.name = state.data.name;
        state.tags = state.data.tags;
        state.polygonRegionsThatCanBeAdded = polygonRegionsThatCanBeAdded;
        state.polygonRegionsThatCannotBeAdded = polygonRegionsThatCannotBeAdded;
        state.polygonRegionsThatAreAdded = polygonRegionsThatAreAdded;
        state.caller = uuid.v4();

        this.setState(state, () => { this.mapComponent.clearCountryPostcodeSubregion(); });

        ReactDOM.findDOMNode(this.elementToBeFocused).scrollIntoView();
    }

    close() {
        this.modal.close();
    }

    onSaveClick() {

        let polygons = this.mapComponent.getAddedPolygons();
        let allFieldsOk = true;

        if (allFieldsOk && !this.state.name) {
            allFieldsOk = false;
            Notify.showError("Name is required.");
        }

        if (allFieldsOk && polygons.length == 0) {
            allFieldsOk = false;
            Notify.showError("At least one region is required.");
        }

        if (allFieldsOk) {

            let data = _.cloneDeep(this.state.data);

            data.name = _.trim(this.state.name);
            data.tags = [];

            _.remove(data.tags, tag => {

                let match = _.find(this.state.tags, tagInner => {
                    return tagInner.value == tag.value;
                });

                if (!match) {
                    return true;
                } else {
                    return false;
                }
            });

            this.state.tags.forEach(tag => {
                data.tags.push({
                    value: tag.value
                });
            });

            let list;

            if (this.state.isCollectionRegionEdit) {
                list = data.collectionRegionToPolygonRegions;
            } else {
                list = data.distributionRegionToPolygonRegions;
            }

            _.remove(list, elem => {

                let match = _.find(polygons, polygon => {
                    return polygon.externalData.id == elem.id;
                });

                if (!match) {
                    return true;
                } else {
                    return false;
                }
            });

            polygons.forEach(elem => {
                list.push({
                    polygonRegion: {
                        id: elem.externalData.id,
                        absoluteName: elem.externalData.absoluteName
                    },
                    category: elem.externalData.category
                });
            });

            // Sonuç true dönerse kapat.
            if (this.props.onSave(this.state.isCollectionRegionEdit, data)) {
                this.close();
            }
        }
    }

    onResize() {
    }

    render() {
        return (
            <Modal title="" ref = {(c) => this.modal = c} large={true} closeOnBackgroundClicked={false} closeOnEscKeyPressed={false}>
                <div>
                    <Grid>
                        <GridCell width="1-1" noMargin="true">
                            <Grid>
                                <GridCell width="1-2" noMargin="true">
                                    <TextInput label={this.state.isCollectionRegionEdit ? "Collection Region Name" : "Distribution Region Name"}
                                               value={this.state.name}
                                               placeholder=" "
                                               onchange={(value) => this.updateName(value)}/>
                                </GridCell>
                                <GridCell width="1-2" noMargin="true">
                                    <Chip label="Tags"
                                          valueField="value"
                                          labelField="value"
                                          options={this.state.allTags}
                                          onchange={(value)=> this.updateTags(value)}
                                          value={this.state.tags}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-1" noMargin="true">
                            <Card>
                                <RegionMapWithPostcodeFilter ref={(c) => this.mapComponent = c}
                                                             polygonRegionsThatCanBeAdded={this.state.polygonRegionsThatCanBeAdded}
                                                             polygonRegionsThatCannotBeAdded={this.state.polygonRegionsThatCannotBeAdded}
                                                             polygonRegionsThatAreAdded={this.state.polygonRegionsThatAreAdded}
                                                             mapId="collAndDistRegionEdit"
                                                             canAddCountryIfNotExists={false}
                                                             categoriesWhenAdding={this.state.regionCategories}
                                                             caller={this.state.caller}
                                                             onResize={() => this.onResize()}/>
                            </Card>
                        </GridCell>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-1" noMargin="true">
                                    <div className="uk-align-right" ref={(c) => this.elementToBeFocused = c}>
                                        <Button label="Close" style="primary" waves={true} onclick={() => this.modal.close()} />
                                        <Button label="Save" style="primary" waves={true} float="right" onclick={() => this.onSaveClick()}/>
                                    </div>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </div>
            </Modal>
        );
    }
}