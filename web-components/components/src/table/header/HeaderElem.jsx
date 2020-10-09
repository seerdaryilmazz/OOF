import React from 'react';


/**
 * name
 * data
 * alignment
 * sortable
 * hidden
 * width
 */
export class HeaderElem extends React.Component {
    constructor(props) {
        super(props);

    }

    render(){

        let header = this.props.header;

        let className = this.getClassName(this.props);
        let style = this.getStyle(this, header);
        let width = this.getWidth(header);

        let sortElem = this.getSortElem(this, header);

        return(
            <th className={className} style={style} width={width}>
                {header.name}
                {sortElem}
            </th>


        );
    }

    getStyle = (self, header)  => {

        let hidden = this.isHidden(header);

        let style = {};
        if(hidden){
            style.display= 'none';
        }

        return style;
    }

    isHidden = (header)  => {
        if (!header.hidden) {
            return false;
        }
        return true;
    }


    getClassName = (props) => {

        return this.getClassNameAlignment(props.header);

    }

    getWidth = (header) => {

        if(header.width) {
            return header.width;
        } else {
            return -1;
        }

    }

    getClassNameAlignment = (header) => {

        let className = "uk-text-";

        if(header.alignment) {
            className  += header.alignment;
        } else {
            className += "center";
        }

        return className
    }

    getSortElem = (self, header) => {

        let sortType = this.getCurrentSortType(header);

        if (sortType == "asc") {
            return <a href="javascript:void(null);" onClick = {() => this.props.sortData(header.data, "desc", header.sort)}>
                <i className="md-icon uk-icon-sort-amount-desc" ></i>
            </a>;
        }
        else if (sortType == "desc" ) {
            return <a href="javascript:void(null);" onClick = {() => this.props.sortData(header.data, "asc", header.sort)}>
                <i className="md-icon uk-icon-sort-amount-asc" ></i>
            </a>;
        } else if (sortType == "none" ) {
            return <a href="javascript:void(null);" onClick = {() => this.props.sortData(header.data, "asc", header.sort)}>
                <i className="md-icon uk-icon-sort-amount-asc" ></i>
            </a>;
        }
        return null;
    }

    getCurrentSortType = (header) => {
        if(header.sort) {

            if (header.sort.sorted && header.sort.sorted.order) {
                return header.sort.sorted.order;
            } else {
                return "none"
            }
        }
        return null;
    }

}