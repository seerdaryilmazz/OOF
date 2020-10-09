import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';


export class CompanyRelations extends TranslatingComponent{
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleRedirect(e, company){
        e.preventDefault();
        this.context.router.push('/ui/kartoteks/company/' + company.id);
    }
    render(){
        let relations = [];
        let activeRelations = _.filter(this.props.company.activeRelations, (item) => {return item.relationType.code == "ZCPG01"});
        let activeRelationsView = activeRelations.map(item => {
            return <a href="#" key = {item.id} className="uk-margin-left" onClick = {(e) => this.handleRedirect(e, item.passiveCompany)}>{item.passiveCompany.name}</a>;
        });

        if(activeRelationsView.length > 0){
            relations.push(<p key = "hasAgent"><i className="uk-badge uk-badge-outline">{super.translate("Has Agents")}</i>{activeRelationsView}</p>);
        }

        let passiveRelations = _.filter(this.props.company.passiveRelations, (item) => {return item.relationType.code == "ZCPG01"});
        let passiveRelationsView = passiveRelations.map(item => {
            return <a href="#" key = {item.id} className="uk-margin-left" onClick = {(e) => this.handleRedirect(e, item.activeCompany)}>{item.activeCompany.name}</a>;
        });
        if(passiveRelationsView.length > 0){
            relations.push(<p key = {"isAgentOf"}><i className="uk-badge uk-badge-outline">{super.translate("Is Agent Of")}</i>{passiveRelationsView}</p>);
        }
        if(relations.length == 0){
            return null;
        }
        return (
            <div>
                {relations}
            </div>
        );
    }
}
CompanyRelations.contextTypes = {
    router: PropTypes.object.isRequired
};