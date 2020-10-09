import './main.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router'
import BasicComponentsTest from './BasicComponentsTest';
import FormsTest from './FormsTest';
import TableTest from './TableTest';
import ListTest from './ListTest';
import I18nTest from './I18nTest';
import CardListTest from './CardListTest';
import TabTest from './TabTest';
import WizardTest from './WizardTest';
import MenuTest from './MenuTest';
import FileInputTest from './FileInputTest';
import ModalTest from './ModalTest';
import TreeTest from './TreeTest';
import DataTableTest from './DataTableTest';
import TableSorterTest from './TableSorterTest';

import {Menu} from '../../components/src/layout';


ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/basic" component={BasicComponentsTest}/>
        <Route path="/table" component={TableTest}/>
        <Route path="/datatable" component={DataTableTest}/>
        <Route path="/forms" component={FormsTest}/>
        <Route path="/list" component={ListTest}/>
        <Route path="/i18n" component={I18nTest}/>
        <Route path="/cardlist" component={CardListTest}/>
        <Route path="/tab" component={TabTest}/>
        <Route path="/wizard/:currentStep" component={WizardTest}/>
        <Route path="/menu" component={MenuTest}/>
        <Route path="/fileinput" component={FileInputTest}/>
        <Route path="/modal" component={ModalTest}/>
        <Route path="/tree" component={TreeTest}/>
        <Route path="/tablesorter" component={TableSorterTest}/>
    </Router>
    , document.getElementById('page_content_inner'));

var menuData = [
    {
        title: "Basic Components",
        url: "#/basic"
    },
    {
        title: "Forms",
        url: "#/forms"
    },
    {
        title: "Tables",
        url: "#/table"

    },
    {
        title: "List",
        children: [
            {
                title: "List ",
                url: "#/list"
            },
            {
                title: "Card List",
                url: "#/cardlist"
            }
        ]
    },
    {
        title: "Layout",
        children: [
            {
                title: "Wizard ",
                url: "#/wizard/1"
            },
            {
                title: "Tab",
                url: "#/tab"
            },
            {
                title: "Menu",
                url: "#/menu"
            }
        ]
    },
    {
        title: "I18N",
        url: "#/i18n"
    },
    {
        title: "File Input",
        url: "#/fileinput"
    },
    {
        title: "Modal test",
        url: "#/modal"
    },
    {
        title: "Tree test",
        url: "#/tree"
    }
];


ReactDOM.render(
    <Menu data={menuData} ></Menu>
    , document.getElementById('sidemenu'));



