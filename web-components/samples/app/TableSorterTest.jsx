import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export default class TableSorterTest extends React.Component {

    constructor(props) {
        super(props);
        this.moment = require('moment');
    };

    createPageSelectize(){
        $('select.ts_gotoPage')
            .val($("select.ts_gotoPage option:selected").val())
            .after('<div className="selectize_fix"></div>')
            .selectize({
                hideSelected: true,
                onDropdownOpen: function($dropdown) {
                    $dropdown
                        .hide()
                        .velocity('slideDown', {
                            duration: 200,
                            easing: easing_swiftOut
                        })
                },
                onDropdownClose: function($dropdown) {
                    $dropdown
                        .show()
                        .velocity('slideUp', {
                            duration: 200,
                            easing: easing_swiftOut
                        });

                    // hide tooltip
                    $('.uk-tooltip').hide();
                }});
    }

    componentDidMount(){
        $.tablesorter.addParser({
            id: 'date',
            is: (s) => {
                return false;
            },
            format: (s) => {
                return this.moment(s, 'DD/MM/YYYY', true).format("X");
            },
            // set type, either numeric or text
            type: 'numeric'
        });

        let $tablesorter = $("#ts_pager_filter");

        // define pager options
        var pagerOptions = {
            // target the pager markup - see the HTML block below
            container: $(".ts_pager"),
            // output string - default is '{page}/{totalPages}'; possible variables: {page}, {totalPages}, {startRow}, {endRow} and {totalRows}
            output: '{startRow} - {endRow} / {filteredRows} ({totalRows})',
            // if true, the table will remain the same height no matter how many records are displayed. The space is made up by an empty
            // table row set to a height to compensate; default is false
            fixedHeight: true,
            // remove rows from the table to speed up the sort of large tables.
            // setting this to false, only hides the non-visible rows; needed if you plan to add/remove rows with the pager enabled.
            removeRows: false,
            // go to page selector - select dropdown that sets the current page
            cssGoto: '.ts_gotoPage'
        };

        $tablesorter.tablesorter({
                theme: 'oneorder',
                widthFixed: true,
                widgets: ['zebra', 'filter'],
                headers: {
                    7: {
                        sorter: "date"
                    }
                },
                widgetOptions: {
                    filter_functions: {
                        1 : {
                            "A - D" : function(e, n, f, i, $r, c, data) { return /^[A-D]/.test(e); },
                            "E - H" : function(e, n, f, i, $r, c, data) { return /^[E-H]/.test(e); },
                            "I - L" : function(e, n, f, i, $r, c, data) { return /^[I-L]/.test(e); },
                            "M - P" : function(e, n, f, i, $r, c, data) { return /^[M-P]/.test(e); },
                            "Q - T" : function(e, n, f, i, $r, c, data) { return /^[Q-T]/.test(e); },
                            "U - X" : function(e, n, f, i, $r, c, data) { return /^[U-X]/.test(e); },
                            "Y - Z" : function(e, n, f, i, $r, c, data) { return /^[Y-Z]/.test(e); }
                        }
                    }
                }
            });



    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(){

    }


    render(){
        return(
            <div className="md-card">
                <div className="md-card-content">
            <table className="uk-table uk-table-align-vertical uk-table-nowrap tablesorter tablesorter-oneorder" id="ts_pager_filter">
                <thead>
                <tr>
                    <th data-priority="critical">Name</th>
                    <th data-priority="1">Major</th>
                    <th data-priority="2">Sex</th>
                    <th data-priority="3">English</th>
                    <th data-priority="4">Japanese</th>
                    <th data-priority="4">Calculus</th>
                    <th data-priority="4">Geometry</th>
                    <th data-priority="4">Date</th>
                    <th className="filter-false remove sorter-false uk-text-center" data-priority="1">Actions</th>
                </tr>
                </thead>
                <tfoot>
                <tr>
                    <th>Name</th>
                    <th>Major</th>
                    <th>Sex</th>
                    <th>English</th>
                    <th>Japanese</th>
                    <th>Calculus</th>
                    <th>Geometry</th>
                    <th>Date</th>
                    <th className="uk-text-center">Actions</th>
                </tr>
                </tfoot>
                <tbody>
                <tr>
                    <td>Student01</td>
                    <td>Languages</td>
                    <td>male</td>
                    <td>80</td>
                    <td>70</td>
                    <td>75</td>
                    <td>80</td>
                    <td>12/10/2016</td>
                    <td className="uk-text-center">
                        <a href="#" className="ts_remove_row"><i className="md-icon material-icons">&#xE872;</i></a>
                    </td>
                </tr>
                <tr>
                    <td>Student02</td>
                    <td>Mathematics</td>
                    <td>male</td>
                    <td>90</td>
                    <td>88</td>
                    <td>100</td>
                    <td>90</td>
                    <td>02/11/2016</td>
                    <td className="uk-text-center">
                        <a href="#" className="ts_remove_row"><i className="md-icon material-icons">&#xE872;</i></a>
                    </td>
                </tr>
                <tr>
                    <td>Student03</td>
                    <td>Languages</td>
                    <td>female</td>
                    <td>85</td>
                    <td>95</td>
                    <td>80</td>
                    <td>85</td>
                    <td>09/11/2016</td>
                    <td className="uk-text-center">
                        <a href="#" className="ts_remove_row"><i className="md-icon material-icons">&#xE872;</i></a>
                    </td>
                </tr>
                </tbody>
            </table>
                    </div>
                </div>
        );
    }
}