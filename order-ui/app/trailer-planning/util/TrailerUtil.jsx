/**
 * Created by burak on 09/11/17.
 */
import _ from "lodash";
import moment from 'moment';
import 'moment-timezone';

export class TrailerUtil {

    static momentFormat = "DD/MM/YYYY HH:mm ";


    constructor(storage){
        this.storage = storage;

    }

    setTripStopTrailers(trailers) {
        this.writeStorage("trailer-planning.tripstop-trailers", trailers);
        this.reconstructFilteredTrailers();
    }
    getTripStopTrailers() {
        return JSON.parse(this.readStorage("trailer-planning.tripstop-trailers"));
    }
    getFilteredTrailers() {
        return JSON.parse(this.readStorage("trailer-planning.filtered-trailers"));
    }

    initializeFiltersIfNotExist(distance, date) {
        let filterObject = this.getFilters();
        if(!filterObject) {
            filterObject = {distance: distance, date:date}
        }
        this.setFilters(filterObject);
    }

    setDistanceFilter(value) {
        let filterObject = this.getFilters();
        filterObject.distance = value;
        this.setFilters(filterObject);
    }
    resetDistanceFilter() {
        let filterObject = this.getFilters();
        filterObject.distance = null;
        this.setFilters(filterObject);
    }
    getDistanceFilter(value) {
        let filterObject = this.getFilters();
        if(filterObject) {
            return filterObject.distance;
        }
        return null;
    }

    setDateFilter(value) {
        let filterObject = this.getFilters();
        filterObject.date = value;
        this.setFilters(filterObject);
    }
    resetDateFilter() {
        let filterObject = this.getFilters();
        filterObject.date = null;
        this.setFilters(filterObject);
    }
    getDateFilter(value) {
        let filterObject = this.getFilters();
        if(filterObject) {
            return filterObject.date;
        }
        return null
    }

    getFilters() {
        let filter = JSON.parse(this.readStorage("trailer-planning.trailer-filter"));
        return filter;
    }
    setFilters(filterObject) {
        this.writeStorage("trailer-planning.trailer-filter", filterObject);
        this.reconstructFilteredTrailers();
    }

    applyFilter(allTrailers){
        let filterObject = this.getFilters();
        if(filterObject){
            let distanceFilter = _.isNumber(filterObject.distance) ? filterObject.distance * 1000 : null;
            let dateFilterMoment = filterObject.date ? this.toMoment(filterObject.date) : null;
            allTrailers.forEach(trailer =>  {
                trailer._hidden = (!trailer._airDistanceToFirstStop || trailer._airDistanceToFirstStop > distanceFilter) ||
                    !trailer.availableTime || this.toMoment(trailer.availableTime).isAfter(dateFilterMoment);
            });
        }
    }
    
    reconstructFilteredTrailers() {
        let trailers = this.getTripStopTrailers();

        if(!trailers || trailers.length == 0) {
            this.writeStorage("trailer-planning.filtered-trailers", []);
            return trailers;
        }

        let filterObject = this.getFilters();

        if(!filterObject) {
            this.writeStorage("trailer-planning.filtered-trailers", trailers);
            return trailers;
        }

        let filteredTrailers = [];
        let distanceFilter = _.isNumber(filterObject.distance) ? filterObject.distance * 1000 : null;
        let dateFilterMoment = filterObject.date ? this.toMoment(filterObject.date) : null;
        trailers.forEach(trailer =>  {

            let eliminated = false;

            if(!eliminated && _.isNumber(distanceFilter)) {
                if(!trailer._airDistanceToFirstStop || trailer._airDistanceToFirstStop > distanceFilter) {
                    eliminated = true;
                }
            }

            if(!eliminated && filterObject.date) {
                if(!trailer.availableTime || this.toMoment(trailer.availableTime).isAfter(dateFilterMoment)) {
                    eliminated = true;
                }
            }

            if(!eliminated) {
                filteredTrailers.push(trailer);
            }
        });

        this.writeStorage("trailer-planning.filtered-trailers", filteredTrailers);
        return filteredTrailers;
    }

    writeStorage(key, value){
        if(this.storage){
            this.storage.write(key, value);
        }
    }

    readStorage(key){
        if(this.storage){
            return this.storage.read(key);
        }
        return null;
    }

    toMoment(dateTimeStr) {
        let dateSplit = dateTimeStr.split(" ");
        return moment(dateSplit[0] + " " + dateSplit[1], TrailerUtil.momentFormat).tz(dateSplit[2] ? dateSplit[2] : "UTC" );
    }

}
