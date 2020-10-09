import React from "react";
import uuid from "uuid";

export class Pagination extends React.Component {

    constructor(props) {
        super(props);
    }

    getPaginationControlButton(disabled, icon, fn) {
        if (disabled) {
            return <li key={uuid.v4()} className="uk-disabled"><span><i className={icon}></i></span></li>
        } else {
            return <li key={uuid.v4()}><a href="javascript:void(0)" onClick={fn}><i className={icon}></i></a></li>
        }
    }

    paginationGoBack() {
        this.paginationGo(this.props.page - 1);
    }

    paginationGoForward() {
        this.paginationGo(this.props.page + 1);
    }

    paginationGo(page) {
        this.props.onPageChange(page);
    }

    render() {
        let pagination = null;
        let totalElements = null;

        if (this.props.totalElements > 0) {
            totalElements = (
                <div className="paginationTotalElements">
                    Total : <b>{this.props.totalElements}</b>
                </div>
            );
        }

        if (this.props.totalPages > 1) {
            let paginationElements = [];

            paginationElements.push(this.getPaginationControlButton(this.props.page == 1, "uk-icon-angle-double-left", ()=>this.paginationGo(1)));
            paginationElements.push(this.getPaginationControlButton(this.props.page == 1, "uk-icon-angle-left", ()=>this.paginationGoBack()));

            if(this.props.range){
                if(this.props.page > this.props.range + 1 ){
                    paginationElements.push(<li key={uuid.v4()} className="uk-disabled"><span><i className="uk-icon">...</i></span></li>)
                }
                for(let i = -this.props.range; i <= this.props.range; i++){
                    let element = this.props.page + i;
                    if(element >= 1 && element <=this.props.totalPages){
                        if (this.props.page == element) {
                            paginationElements.push(
                                <li key={uuid.v4()} className="uk-active">
                                    <span key={uuid.v4()}>{element}</span>
                                </li>);
                        } else {
                            paginationElements.push(
                                <li key={uuid.v4()}>
                                    <a href="javascript:void(0)" onClick={()=>this.paginationGo(element)}>{element}</a>
                                </li>);
                        }
                    }
                }
                if(this.props.page < this.props.totalPages - this.props.range ){
                    paginationElements.push(<li key={uuid.v4()} className="uk-disabled"><span><i className="uk-icon">...</i></span></li>)
                }
            } else {
                for (let i = 1; i <= this.props.totalPages; i++) {
                    if (this.props.page == i) {
                        paginationElements.push(
                            <li key={uuid.v4()} className="uk-active">
                                <span key={uuid.v4()}>{i}</span>
                            </li>);
                    } else {
                        paginationElements.push(
                            <li key={uuid.v4()}><a href="javascript:void(0)" onClick={()=>this.paginationGo(i)}>{i}</a>
                            </li>);
                    }
                }
            }

            paginationElements.push(this.getPaginationControlButton(this.props.page == this.props.totalPages, "uk-icon-angle-right", ()=>this.paginationGoForward()));
            paginationElements.push(this.getPaginationControlButton(this.props.page == this.props.totalPages, "uk-icon-angle-double-right", ()=>this.paginationGo(this.props.totalPages)));

            pagination = (
                <ul key={uuid.v4()} className="uk-pagination">
                    {paginationElements}
                </ul>
            )
        }

        return (
            <div>
                {pagination}
                {totalElements}
            </div>
        );
    }
}