import React from 'react';


export class ReadOnlyDataInterface  extends React.Component {
    constructor(data, readonlyFieldConstant) {
        super(null);
        this.state = {data: data, readonlyFieldConstant: readonlyFieldConstant};
    }


    retrieveValueDynamic(field, dynamicData) {

        if (this.state.data) {

            let readonlyData = this.retrieveReadonlyData(field);

            if (readonlyData) {
                return readonlyData;
            }
            else {
                return dynamicData;
            }
        }

        return null;
    }

    retrieveValue(field) {

        if (this.state.data) {

            let readonlyData = this.retrieveReadonlyData(field);

            if (readonlyData) {
                return readonlyData;
            }
            else {
                return this.state.data[field];
            }
        }

        return null;
    }

    isReadOnly(field) {

        if (this.retrieveReadonlyData(field)) {
            return true;
        }

        return false;
    }


    retrieveReadonlyData(field) {

        if (this.state.data) {
            let readonlyFields = this.state.data[this.state.readonlyFieldConstant];

            if (readonlyFields) {
                return readonlyFields[field];
            }
        }
    }


}