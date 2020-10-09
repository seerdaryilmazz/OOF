import React from "react";
import { connect } from "react-redux";
import { Card, Grid, GridCell, PageHeader } from "susam-components/layout";
import { addSubMenu } from "./Actions";
import { UIMenuDetails } from "./UIMenuDetails";
import { UIMenuTree } from "./UIMenuTree";

class _UIMenuList extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $(window).on('scroll', function () {
            let top = $(this).scrollTop();
            let calculated = top < 68 ? 142 - top : 68;
            $(`#menuForm`).css("top", `${calculated}px`)
        })
    }

    render() {
        let menuDetails = null;
        if (!this.props.hideMenuDetails) {
            menuDetails =
                <div id="menuForm" style={{ float: 'left', position: 'fixed', margin: "0 32px 0 8px" }}>
                    <Card><UIMenuDetails /></Card>
                </div>
        }

        return (
            <div>
                <PageHeader title="Menu Configuration" />
                <Grid>
                    <GridCell width="1-2" noMargin={true}>
                        <UIMenuTree />
                    </GridCell>
                    <GridCell width="1-2" noMargin={true}>
                        {menuDetails}
                    </GridCell>
                </Grid>

            </div>
        );
    }
}

export const UIMenuList = connect(
    function mapStateToProps(state) {
        return {
            hideMenuDetails: state.menuList.hideMenuDetails
        };
    },

    function mapDispatchToProps(dispatch) {
        return {
            addSubMenu: (menu) => dispatch(addSubMenu(menu)),
        };
    },
)(_UIMenuList);