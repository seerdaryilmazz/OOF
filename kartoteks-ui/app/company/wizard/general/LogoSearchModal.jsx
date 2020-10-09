import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Modal, Loader, OverflowContainer} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {LookupService} from '../../../services/KartoteksService';

export class LogoSearchModal extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {searchText: ""};
    }

    componentDidMount(){
        this.setState({searchText: this.props.searchText});
    }

    searchImage(searchText){
        this.setState({searching: true});
        LookupService.searchGoogleForImages(searchText).then(response => {
            let results = response.data.map(item => {
                return {key: uuid.v4(), url: item};
            });
            this.setState({searchResults: results, searching: false});
        }).catch(error => {
            this.setState({searching: false});
            Notify.showError(error);
        });
    }

    handleImageSearchClick(){
        this.searchImage(this.state.searchText);
    }
    handleImageSelect(e, url){
        e.preventDefault();
        this.setState({selectedImage: url});
    }
    handleModalSave(){
        this.props.onImageSelect && this.props.onImageSelect(this.state.selectedImage);
        this.logoModal.close();
    }

    open(){
        this.logoModal.open();
    }

    render(){
        let searchResults = <GridCell width="1-1" noMargin = {true}>{super.translate("Please click search to start searching")}</GridCell>;
        if(this.state.searching){
            searchResults = <GridCell width="1-1" noMargin = {true}><Loader size="M" /></GridCell>;
        }
        if(this.state.searchResults){
            searchResults = <GridCell width="1-1">No results found, try changing search text</GridCell>;
            if(this.state.searchResults.length > 0){
                searchResults = this.state.searchResults.map(item => {
                    let style = {border: "1px solid #dddddd", padding: "6px", borderRadius: "4px"};
                    let selectedClassName = "";
                    if(item.url == this.state.selectedImage){
                        selectedClassName = "md-bg-light-blue-50";
                    }
                    return (
                        <GridCell width="1-6" key = {item.key} margin = "small">
                            <div style = {style} className = {selectedClassName}>
                                <a href="#" onClick = {(e) => this.handleImageSelect(e, item.url)}>
                                    <img style={{maxWidth:"100%", height:"auto"}} src={item.url} />
                                </a>
                            </div>
                        </GridCell>
                    );
                });
            }
        }


        return (
            <Modal title="Search Company Logo" ref = {(c) => this.logoModal = c} large={true}
                   actions = {[{label:"Close", action:() => this.logoModal.close()},
                   {label:"save", action:() => this.handleModalSave()}]}>
                <Grid>
                    <GridCell width="1-1">
                        <TextInput label="Image URL" value = {this.state.selectedImage} onchange = {(value) => this.setState({selectedImage: value})}/>
                    </GridCell>
                    <GridCell width="5-6">
                        <TextInput value = {this.state.searchText} onchange = {(value) => this.setState({searchText: value})}/>
                    </GridCell>
                    <GridCell width="1-6">
                        <Button label="Search"
                                style="success" onclick = {() => this.handleImageSearchClick()}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <OverflowContainer height="500">
                            <Grid>
                            {searchResults}
                            </Grid>
                        </OverflowContainer>
                    </GridCell>
                </Grid>
            </Modal>
        );
    }
}
