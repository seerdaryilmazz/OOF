import React from "react";
import uuid from "uuid";
import _ from 'lodash';

import {GoogleMaps} from "susam-components/advanced/GoogleMaps";
import { KartoteksService } from "../../../services/KartoteksService";

export class BasicMap extends React.Component {
    constructor(props) {
        super(props);
        this.id = (props.id ? props.id : uuid.v4()).replace(/-/g, '');
        this.key = "AIzaSyDE6jFmZfiFjIYBu9CD2lNKSxYaJhAF4nI";
        //this.key = "AIzaSyChgiAMDKWpPRM8b3ajXfyrrLnOt_cG3tM";
    }

    componentDidMount() {
        KartoteksService.getProperty('google.apikey').then(response=>{
            let googleMapsBaseScriptUrl = 'https://maps.googleapis.com/maps/api/js';
            let googleMapsScriptUrl = googleMapsBaseScriptUrl + "?key=" + response.data + "&callback=initMap" + this.id;
            window['initMap' + this.id] = () => {
                this.init(this.props);
            };
            if(!GoogleMaps.addScript(googleMapsBaseScriptUrl, googleMapsScriptUrl, true, true)){
                this.init(this.props);
            }
            this.MAX_AUTO_ZOOMIN = 0.04;
        })
    }
    init(props){
        this.createPinImages();
        this.initMap(props);
        this.initPins(props);
    }
    initPins(props){
        if(props.dropPins){
            props.dropPins.forEach(item => {
                this.dropPin(item);
            });
        }
        if(this.markers){
            Object.keys(this.markers).forEach(key => {
                if(!_.find(props.dropPins, {name: key})){
                    this.markers[key].setMap(null);
                    delete this.markers[key];
                }
            });
        }
        this.extendMapBounds();
    }
    componentWillReceiveProps(nextProps) {
        this.initPins(nextProps);
    }
    isMarkerChanged(currentMarker, newMarker){
        let currentPin = currentMarker ? _.floor(currentMarker.position.lat(), 6) + "," + _.floor(currentMarker.position.lng(), 6) : "";
        let newPin = newMarker ? newMarker.position.lat + "," + newMarker.position.lng : "";
        return currentPin !== newPin && newPin !== "";
    }

    initMap(props) {
        this.map = new google.maps.Map(document.getElementById(this.id), props.map);
        this.markers = {};
    }
    dropPin(marker) {
        if(this.map){
            this.map.setCenter(marker.position);
            if(this.markers[marker.name]){
                this.markers[marker.name].setPosition(marker.position);
                this.markers[marker.name].setIcon(this.alternativePins[marker.pinColor]);
            }else{
                this.createMarker(marker);
            }
        }
    }
    clearPins(){
        if(this.markers){
            Object.keys(this.markers).forEach(key => {
                this.markers[key].setMap(null);
            })
        }
        this.markers = {};
    }
    createPinImages(){
        this.alternativePins = {};
        this.alternativePins.blue = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
        this.alternativePins.purple = "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
        this.alternativePins.green = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
        this.alternativePins.yellow = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    }
    createMarker(marker){
        if(marker.pinColor){
            marker.icon = this.alternativePins[marker.pinColor];
        }
        let config = _.merge({animation: google.maps.Animation.DROP, map: this.map}, marker);
        this.markers[marker.name] = new google.maps.Marker(config);
        this.markers[marker.name].addListener('dragend', () => marker.dragend(this.markers[marker.name]));
    }
    extendMapBounds(){
        if(Object.keys(this.markers).length > 1){
            let bounds = new google.maps.LatLngBounds();

            Object.keys(this.markers).forEach(key => {
                bounds.extend(this.markers[key].getPosition());
            });

            this.adjustBoundsIfTooNarrow(bounds, this.MAX_AUTO_ZOOMIN);

            this.map.fitBounds(bounds);
        }
    }

    adjustBoundsIfTooNarrow(bounds, minSize) {
        if (bounds) {
            let height = bounds.getNorthEast().lat() - bounds.getSouthWest().lat();
            let width = bounds.getNorthEast().lng() - bounds.getSouthWest().lng();

            if(height < minSize && width < minSize) {
                bounds.extend(new google.maps.LatLng(bounds.getNorthEast().lat() + ((minSize-height)/2), bounds.getNorthEast().lng() + ((minSize-width)/2)));
                bounds.extend(new google.maps.LatLng(bounds.getSouthWest().lat() - ((minSize-height)/2), bounds.getSouthWest().lng() - ((minSize-width)/2)));
            }
        }
    }

    render() {
        let width = "100%";
        let height = "100%";
        if(this.props.width){
            width = this.props.width;
        }
        if(this.props.height){
            height = this.props.height;
        }
        return (
            <div id={this.id} style={{width: width, height: height}}/>
        );
    }
}