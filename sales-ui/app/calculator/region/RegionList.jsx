import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {TextInput, Button} from "susam-components/basic";
import {Grid, GridCell, CardHeader, OverflowContainer} from "susam-components/layout";


export class RegionList extends TranslatingComponent {

    constructor(props){
        super(props);
    }

    handleEditClick(item){
        this.props.onEdit && this.props.onEdit(item);
    }
    handleDeleteClick(item){
        this.props.onDelete && this.props.onDelete(item);
    }

    handleCreateRegion(e, country){
        e.preventDefault();
        this.props.onCreate && this.props.onCreate(country);
    }

    renderRegion(region){
        return (
            <li key = {"region-" + region.regionId}>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width="1-4" noMargin = {true} />
                        <GridCell width="1-4" noMargin = {true}>
                            <div className="md-list-heading">
                                {region.regionName}
                            </div>
                        </GridCell>
                        <GridCell width="1-4" noMargin = {true}>
                            <div className="uk-text-muted">
                                {region.separatedPostalCodes.replace(/,/g, ', ')}
                            </div>
                        </GridCell>
                        <GridCell width="1-4" noMargin = {true}>
                            <div className="uk-align-right">
                                <Button label="edit" size="small" style="success" flat = {true}
                                        onclick = {() => this.handleEditClick(region)} />
                                <Button label="delete" size="small" style="danger" flat = {true}
                                        onclick = {() => this.handleDeleteClick(region)} />
                            </div>
                        </GridCell>
                    </Grid>
                </div>
            </li>
        );
    }

    renderCountryAndRegions(country, regions){

        regions = _.sortBy(regions, ["regionName"]);

        return(
                <li key = {"country-" + country.id}>
                    <div className="md-list-content">
                        <Grid smallGutter = {true} collapse = {true}>
                            <GridCell width="1-4" noMargin = {true} >
                                {country.name}
                            </GridCell>
                            <GridCell width="1-2" noMargin = {true} />
                            <GridCell width="1-4" noMargin = {true} >
                                <div className="uk-align-right uk-margin-bottom">
                                    <Button label="create region" size="small" style="success" flat = {true}
                                            onclick = {(e) => this.handleCreateRegion(e, country)} />
                                </div>
                            </GridCell>
                            <GridCell width="1-1" noMargin = {true}>
                                <ul className="md-list md-list-compact">
                                {
                                    regions.map(region => {
                                        return this.renderRegion(region);
                                    })
                                }
                                </ul>
                            </GridCell>
                        </Grid>
                        </div>
                    </li>
        );
    }

    render(){

        let list = <div>{super.translate("There are no countries or regions")}</div>;
        if(this.props.countries && this.props.countries.length > 0){
            list = this.props.countries.map(country => {
                let regionsOfCountry = _.filter(this.props.regions, region => {
                    return region.country.id == country.id
                })
                return this.renderCountryAndRegions(country, regionsOfCountry);
            });
        }

        return (
            <div>
                <CardHeader title="Regions"/>
                <OverflowContainer height = "600">
                    <ul className="md-list md-list-compact">
                    {list}
                    </ul>
                </OverflowContainer>
            </div>
        );
    }

}