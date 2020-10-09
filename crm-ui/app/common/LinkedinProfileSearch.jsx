import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Loader} from "susam-components/layout";
import {Notify, TextInput, Button} from 'susam-components/basic';
import PropTypes from "prop-types";

import {LookupService} from '../services';

export class LinkedinProfileSearch extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {searching: false};
    }

    componentDidMount(){
        this.setState({firstName: this.props.firstName, lastName: this.props.lastName});
        //this.searchLinkedin(this.props.firstName, this.props.lastName);
    }
    searchLinkedin(firstName, lastName){
        this.setState({searching: true});
        if(!firstName){
            firstName = this.state.firstName;
        }
        if(!lastName){
            lastName = this.state.lastName;
        }
        firstName = firstName ? firstName.toLowerCase() : "";
        lastName = lastName ? lastName.toLowerCase() : "";
        LookupService.searchLinkedinProfiles(firstName, lastName).then(response => {
            this.setState({results: response.data.data, searching: false});
        }).catch(error => {
            this.setState({searching: false});
            Notify.showError(error);
        });
    }
    selectProfile(e, item){
        e.preventDefault();
        this.setState({selectedProfile: item, matchedProfileLink: item.profileLink});
    }
    componentWillReceiveProps(nextProps){
        this.setState({firstName: this.props.firstName, lastName: this.props.lastName});
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    render(){
        if(this.state.searching) {
            return <GridCell width="1-1"><Loader size="M" /></GridCell>;
        }
        let searchResults = "";
        let content = null;
        if (this.state.results) {
            searchResults = <GridCell width="1-1">{super.translate("No results found, try changing search text")}</GridCell>;
            if (this.state.results.length > 0) {
                searchResults = this.state.results.map(item => {
                    let selectedClassName = this.state.selectedProfile && this.state.selectedProfile.profileLink == item.profileLink ? "md-bg-light-blue-50" : "";
                    let matched = "";
                    let description = item.headline ? item.headline : (item.info.Current ? item.info.Current : item.info.Summary);
                    if (item.profileLink == this.state.matchedProfileLink) {
                        matched = <div className="uk-align-center"><i className="uk-badge primary">{super.translate("Matched")}</i></div>;
                    }
                    return <GridCell key={item.profileLink} width="1-4" widthSmall="1-2" widthLarge="1-4" margin="small">
                        <div className = {selectedClassName}>
                            <Grid noMargin = {true}>
                                <GridCell width="1-3" margin="small">
                                    <Grid>
                                        <GridCell width="1-1" margin="small">
                                            <img src = {item.imageUrl ? item.imageUrl : (baseResourceUrl + "/assets/img/person-placeholder.png")} className="uk-align-center" style={{margin:"4px"}} />
                                        </GridCell>
                                    </Grid>
                                </GridCell>
                                <GridCell width="2-3" margin="small">
                                    <Grid>
                                        <GridCell width="1-1" margin="small">
                                            <a href="#" className="uk-align-center" onClick={(e) => this.selectProfile(e, item)}>{item.name}</a>
                                        </GridCell>
                                        <GridCell width="1-1" margin="small">
                                            <div className="uk-align-center">{description}</div>
                                        </GridCell>
                                        <GridCell width="1-1" margin="small">
                                            {matched}
                                        </GridCell>
                                    </Grid>
                                </GridCell>
                            </Grid>
                        </div>
                    </GridCell>;
                });
            }
            content = <GridCell width="1-1">
                <Grid collapse = {true}>{searchResults}</Grid>
            </GridCell>;
        }

        return (
            <Grid>
                <GridCell width="1-4">
                    <TextInput label="First Name" value = {this.state.firstName} onchange = {(value) => this.updateState("firstName", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <TextInput label="Last Name" value = {this.state.lastName} onchange = {(value) => this.updateState("lastName", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <Button label="search" style="primary" onclick = {() => this.searchLinkedin()}/>
                </GridCell>
                {content}
            </Grid>
        );
    }
}
LinkedinProfileSearch.contextTypes = {
    translator: PropTypes.object
};