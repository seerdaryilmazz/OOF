import React from "react";
import {connect} from "react-redux";
import {saveMenu, updateMenuField} from "./Actions";
import {Grid, GridCell, Card} from "susam-components/layout";
import {TextInput, Button, Span} from "susam-components/basic";
import {MenuAuthorization} from "./auth/MenuAuthorization";

class _UIMenuDetails extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <Span label="Parent" value = {this.props.menu.parent ? this.props.menu.parent.name : ""} />
                </GridCell>
                <GridCell width="1-3">
                    <TextInput label="Name" onchange={(value) => this.props.updateMenuField("name", value)}
                               value={this.props.menu.name}/>
                </GridCell>
                <GridCell width="2-3">
                    <TextInput label="Url" onchange={(value) => this.props.updateMenuField("url", value)}
                               value={this.props.menu.url}/>
                </GridCell>
                <GridCell width="1-1">
                    <MenuAuthorization/>
                </GridCell>
                <GridCell width="1-1">
                    <Button label="Save" waves = {true} style="primary" onclick={() => this.props.saveMenu(this.props.menu, this.props.authList)}/>
                </GridCell>
            </Grid>
        );
    }
}

export const UIMenuDetails = connect(
    function mapStateToProps(state) {
        return {
            menu: state.menuList.menu,
            authList: state.authState.authList
        };
    },

    function mapDispatchToProps(dispatch) {
        return {
            saveMenu: (menu, authList) => dispatch(saveMenu(menu, authList)),
            updateMenuField: (name, value) => dispatch(updateMenuField(name, value)),
        };
    },
)(_UIMenuDetails);