import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Modal} from "susam-components/layout";
import {Notify, Button} from 'susam-components/basic';
import {PackageDetail} from "./PackageDetail";
import {TemplatePackageValidator} from "./validators/TemplatePackageValidator";
import {PrintPackageDetail} from "./helper/Helper";

export class SenderTemplatePackageDetails extends TranslatingComponent {
    constructor(props){
        super(props);
        this.maxStackOption = {id: "0", name: "Maximum"};
        this.noStackOption = {id: "1", name: "Not Stackable"};
        this.state = {packageDetails:{}, packageDetail:{},
            editingPackage: {}, editingPackageKey: null,};
        this.truckHeight = 300;
    }

    handleEditPackage(packageDetail){
        let editingPackage = {
            packageType: packageDetail.packageType,
            width: packageDetail.width,
            length: packageDetail.length,
            height: packageDetail.height,
            stackSize: packageDetail.stackSize
        };

        this.setState({editingPackage: editingPackage, editingPackageKey: packageDetail._key}, () => this.modal.open());


    }

    populateStackOptions(max){
        let stackOptions = [...Array(_.clamp(max, 1, 20) - 1).keys()].map(item => {
            return {id: item + 2, name: "" + (item + 2)}
        });
        stackOptions.splice(0, 0, this.noStackOption);
        stackOptions.push(this.maxStackOption);
        return stackOptions;
    }


    handleNewPackageChange(key, value){
        let packageDetail = _.cloneDeep(this.state.packageDetail);
        packageDetail[key] = value;
        this.setState({packageDetail: packageDetail});
    }

    handleEditChange(key, value){
        let editingPackage = _.cloneDeep(this.state.editingPackage);
        editingPackage[key] = value;
        this.setState({editingPackage: editingPackage});
    }

    handleSaveEditingPackage(){
        let result = TemplatePackageValidator.validatePackageDetail(this.state.editingPackage);

        if(result){
            Notify.showError(result);
        }else {
            let template = _.cloneDeep(this.props.template);
            let existingIndex =
                _.findIndex(template.packageDetails, item => item._key === this.state.editingPackageKey);
            if (existingIndex === -1) {
                Notify.showError(`Error`);
                return;
            }
            template.packageDetails[existingIndex].packageType = this.state.editingPackage.packageType;
            template.packageDetails[existingIndex].width = this.state.editingPackage.width;
            template.packageDetails[existingIndex].length = this.state.editingPackage.length;
            template.packageDetails[existingIndex].height = this.state.editingPackage.height;
            template.packageDetails[existingIndex].stackSize = this.state.editingPackage.stackSize;

            this.setState({editingPackageKey: null, editingPackage: {}}, () => {
                this.props.onChange && this.props.onChange(template.packageDetails);
                this.handleClose();
            });
        }

    }

    handleAddClick(){
        let result = TemplatePackageValidator.validatePackageDetail(this.state.packageDetail);

        if(result){
            Notify.showError(result)
        }else {
            let template = _.cloneDeep(this.props.template);
            if (!template.packageDetails) {
                template.packageDetails = [];
            }
            let packageDetail = {
                _key: uuid.v4(),
                packageType: this.state.packageDetail.packageType,
                width: this.state.packageDetail.width,
                length: this.state.packageDetail.length,
                height: this.state.packageDetail.height,
                stackSize: this.state.packageDetail.stackSize
            };

            template.packageDetails.push(packageDetail);
            this.setState({packageDetail: {}, stackOptions: this.populateStackOptions(20)});
            this.setState({packageDetails: template.packageDetails});
            this.props.onChange && this.props.onChange(template.packageDetails);
        }
    }


    handleDeleteClick(packageDetail){
        Notify.confirm("Are you sure?", () => {
            let template = _.cloneDeep(this.props.template);
            _.remove(template.packageDetails, item => item._key === packageDetail._key);
            this.props.onChange && this.props.onChange(template.packageDetails);
        });
    }

    handleClose(){
        this.modal.close();
    }

    renderPackageDetails(packageDetail){
        return (
            <li key = {packageDetail._key} className = {false ? "md-bg-blue-50" : ""}>
                <Grid>
                    <GridCell width = "4-5">
                        {PrintPackageDetail(packageDetail,this.context.translator)}
                    </GridCell>
                    <GridCell width = "1-5">
                        <Button label = "edit" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleEditPackage(packageDetail)} />
                        <Button label = "delete" flat = {true} size = "small" style = "danger"
                                onclick = {() => this.handleDeleteClick(packageDetail)} />
                    </GridCell>
                </Grid>
            </li>
        );
    }

    render(){



        let addButton =
            <GridCell width="1-10">
                <div className = "uk-margin-top">
                    <Button label="add" size="small" style="success" waves = {true} onclick = {() => this.handleAddClick()}/>
                </div>
            </GridCell>;

        let list = <div>{super.translate("There are no package details")}</div>;
        if(this.props.template.packageDetails && this.props.template.packageDetails.length >0 ) {
            list = <ul className = "md-list">
                {this.props.template.packageDetails.map(item => this.renderPackageDetails(item))}
            </ul>;
        }


        return (
            <Grid>
                <GridCell width="1-1">
                    <span className="uk-text-large uk-text-bold uk-text-primary">
                        {super.translate("Package Details")}
                    </span>
                </GridCell>

                <GridCell>
                    <PackageDetail packageDetail = {this.state.packageDetail}
                                   onChange = {(key, value) => this.handleNewPackageChange(key, value)}
                                   customComponent = { addButton }
                                   packageKey = "packageDetail"/>
                </GridCell>

                <GridCell width="1-1">
                    {list}
                </GridCell>

                <Modal title={"Package Edit"} ref={(c) => this.modal = c} large = {true}
                       actions={[
                           {label:"Close", action:() => this.handleClose()},
                           {label:"Save", action: () => this.handleSaveEditingPackage()}
                       ]}>
                    <PackageDetail packageDetail = {this.state.editingPackage}
                                   onChange = {(key, value) => this.handleEditChange(key, value)}
                                   packageKey = "editingPackage"/>
                </Modal>

            </Grid>
        );
    }
}

SenderTemplatePackageDetails.contextTypes = {
    translator: React.PropTypes.object
}