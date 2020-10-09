import _ from 'lodash';
import React from "react";
import { connect } from "react-redux";
import { Button } from "susam-components/basic";
import { Grid, GridCell, Loader, Secure } from 'susam-components/layout';
import { changeRank, deleteMenu, fetchMenuList, newSubMenu, selectMenu } from "./Actions";


class _UIMenuTree extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetchMenuList();
    }

    componentDidUpdate(){
        let menuTree = $("#menuTree");
        UIkit.nestable(menuTree, { /* options */ });
        menuTree.off('change.uk.nestable');
        menuTree.on({
            'change.uk.nestable': (event, sortable, dragged) => {
                let $dragged = $(dragged);
                let $parent = $dragged.parents("li.uk-parent");
                let rank = $dragged.prevAll("li.uk-nestable-item").length + 1;
                this.props.changeRank($dragged.data("id"), $parent.data("id"), rank);
            }
        });
    }

    render() {
        if(this.props.busy){
            return <Loader title="Building menu items" />;
        }
        let list = "There are no menu items";
        if(this.props.menuTree && this.props.menuTree.length > 0){
            list = <ul id="menuTree" className="uk-nestable" data-uk-nestable="{handleClass:'uk-nestable-handle'}" data-level = "1">
                {this.renderList(this.props.menuTree, 1)}
            </ul>;
        }

        return <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <div className="uk-align-right">
                        <Secure operations={["user.menu.manage"]}>
                            <Button label="Create new parent" waves = {true} style="success" size="small"
                                    onclick={() => this.props.newSubMenu(null)}/>
                        </Secure>
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    {list}
                </GridCell>
            </Grid>;
    }
    handleEditClick(e, item){
        e.preventDefault();
        this.props.selectMenu(item);
    }

    renderList(items, level){
        let menu = items.map(item => {
            let children = null;
            let classNames = ["uk-nestable-item"];
            if(item.children != null && item.children.length > 0){
                let nextLevel = level+1;
                children = <ul className="uk-nestable-list" data-level = {nextLevel}>{this.renderList(item.children, nextLevel)}</ul>;
                classNames.push("uk-parent");
                let hasNonCollapsedChildren = _.findIndex(item.children, {_collapsed: false}) != -1;
                item._collapsed = !hasNonCollapsedChildren;
            }else{
                let isSelectedMenu = (this.props.menu && item.id == this.props.menu.id);
                item._collapsed = !isSelectedMenu;
            }


            if(item._collapsed){
                classNames.push("uk-collapsed");
            }
            return (
                <li key = {item.id} className={classNames.join(" ")} data-id = {item.id} data-level = {level} data-rank = {item.rank}>
                    <div className="uk-nestable-panel" style = {{minHeight: "30px"}}>
                        <i className="uk-nestable-handle material-icons"></i>
                        <div className="uk-nestable-toggle" data-nestable-action="toggle"></div>
                        <span className="uk-text-large uk-text-primary" style = {{marginRight: "8px"}}>{item.rank}</span>
                        <a href = "#" onClick = {(e) => this.handleEditClick(e, item)}>{item.name}</a>

                        <div className="uk-align-right">
                            <Button label="Create New Child" size="small" waves={true} style="primary" flat = {true} onclick = {() => this.props.newSubMenu(item)} />
                            <Button label="Delete" size="small" waves={true} style="danger" flat = {true} onclick = {() => this.props.deleteMenu(item.id)} />
                        </div>
                    </div>
                    {children}
                </li>
            );
        });

        return menu;
    }

}

export const UIMenuTree = connect(
    function mapStateToProps(state) {
        return {
            menuTree: state.menuList.menuTree,
            menu: state.menuList.menu,
            busy: state.menuList.busy
        };
    },

    function mapDispatchToProps(dispatch) {
        return {
            fetchMenuList: (user, callback) => dispatch(fetchMenuList()),
            newSubMenu: (menu) => dispatch(newSubMenu(menu)),
            deleteMenu: (menuId) => dispatch(deleteMenu(menuId)),
            selectMenu: (menu) => dispatch(selectMenu(menu)),
            changeRank: (menu, parent, rank) => dispatch(changeRank(menu, parent, rank))
        }
    }
)
(_UIMenuTree);