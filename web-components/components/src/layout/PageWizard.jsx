import React from 'react';

export class PageWizard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    };

    render() {

        let self = this;

        let currentStep = this.props.currentStep;

        let currPageUrl = this.props.currPageUrl;

        let children = this.props.children;
        let currentChild = this.props.children[this.props.currentStep - 1];

        let headers = this.createHeaders(currPageUrl, currentStep, children, self);
        let footers = this.createFooters(currPageUrl, currentStep, children.length, currentChild, self);

        let headerName = children[currentStep - 1].props.header;


        if (currentChild.props.beforeLoad) {
            currentChild.props.beforeLoad(currentStep);
        }

        return (
            <div id="wizard_advanced" role="application" className="wizard clearfix">
                {headers}
                {footers}

                <h3 id="wizard_advanced-h-0" tabIndex="-1" className="title">{headerName}</h3>

                <div className="content clearfix">
                    {currentChild}
                </div>


            </div>
        );
    }

    createHeaders = (currPageUrl, currentStep, children, self) => {

        let enableTabSwitch = false;

        if (self.props.enableTabSwitch) {
            enableTabSwitch = true;
        }

        let totalChildren = children.length;

        let index = 1;

        return (
            <div className="steps clearfix">
                <ul role="tablist">
                    {

                        children.map(function (child) {

                            let className = self.getClassName(index, currentStep, totalChildren);

                            let href = currPageUrl + "/" + index;

                            if (!enableTabSwitch) {
                                href = "javascript:void(null);";
                            }

                            return (
                                <li key={index} role="tab" className={className} aria-disabled="false"
                                    aria-selected={currentStep == index}>
                                    <a id="wizard_advanced-t-0" href={href}
                                       aria-controls="wizard_advanced-p-0">
                                        <span className="number">{index++}</span>
                                        <span className="title">{child.props.header}</span>
                                    </a>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        );
    }

    getClassName = (index, currentStep, totalChildren) => {

        let className = "";
        if (index == 1) {
            className = "first ";
        }

        if (index < currentStep) {
            className += "done "
        } else if (currentStep == index) {
            className += "current "
        }

        if (index == totalChildren) {
            className += "last";
        }

        return className;
    }


    createFooters = (currPageUrl, currentStep, totalChildrenNo, currentChild, self) => {

        let prevElem = self.getFooterPrevElem(currPageUrl, currentStep, currentChild, self);
        let nextElem = self.getFooterNextElem(currPageUrl, currentStep, totalChildrenNo, currentChild, self);

        return (
            <div className="actions clearfix">
                <ul role="menu" aria-label="Pagination">
                    {prevElem}
                    {nextElem}
                </ul>
            </div>
        );
    }

    getFooterPrevElem = (currPageUrl, currentStep, currentChild, self) => {

        let nextPageHref = currPageUrl + "/" + (currentStep - 1);

        let className = "button_previous";

        if (currentStep == 1) {
            nextPageHref = currPageUrl + "/1";
            className = "button_previous disabled";
        }

        return (
            <li className={className}>
                <a href="javascript:void(null);" onClick={() => self.previousStep(nextPageHref)}
                   role="menuitem"><i className="material-icons"></i>Previous</a>
            </li>
        );
    }


    getFooterNextElem = (currPageUrl, currentStep, totalChildrenNo, currentChild, self) => {

        let nextPageHref = currPageUrl + "/" + (currentStep - 1 + 2);

        let className = "button_next";

        let label = "Next";
        let icon = <i className="material-icons"></i>;

        if (currentStep == totalChildrenNo) {
            nextPageHref = "";
            className = "button_finish";
            label = "Finish";
            icon = null;
        }

        return (
            <li className={className}>
                <a href="javascript:void(null);"
                   onClick={() => self.tryAdvanceNextStep(nextPageHref, currentStep, totalChildrenNo, currentChild, self)}
                   role="menuitem">{label}{icon}</a>
            </li>
        );
    }


    previousStep = (newLocation) => {
        window.location = newLocation;
    }

    tryAdvanceNextStep = (newLocation, currentStep, totalChildrenNo, currentChild, self) => {

        if (currentChild.props.onComplete) {
            let result = currentChild.props.onComplete(currentStep);
            if (!result) {
                return;
            }
        }

        if (currentStep == totalChildrenNo) {
            self.finalizeWizard(self);
        } else {
            window.location = newLocation;
        }

    }

    finalizeWizard = (self) => {
        if (self.props.onComplete) {
            self.props.onComplete();
        }

        if (self.props.onCompleteHref) {
            window.location = self.props.onCompleteHref;
        }
    }
}