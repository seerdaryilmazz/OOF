import React from "react";
import uuid from "uuid";
import _ from "lodash";

import {Notify} from "susam-components/basic";
import {GoogleMaps} from "susam-components/advanced/GoogleMaps";

import {LookupService} from "../../../services/KartoteksService";

export class BasicMap extends React.Component {
    constructor(props) {
        super(props);
        this.id = (props.id ? props.id : uuid.v4()).replace(/-/g, '');
    }

    componentDidMount() {
        this.getPropertyValue("google.apikey", (apikey) => {
            let googleMapsBaseScriptUrl = 'https://maps.googleapis.com/maps/api/js';
            let googleMapsScriptUrl = googleMapsBaseScriptUrl + "?key=" + apikey + "&callback=initMap" + this.id;
            window['initMap' + this.id] = () => {
                this.init(this.props);
            };
            if(!GoogleMaps.addScript(googleMapsBaseScriptUrl, googleMapsScriptUrl, true, true)){
                this.init(this.props);
            }
        });
    }
    getPropertyValue(propertyKey, callback) {
        LookupService.getPropertyValue(propertyKey).then(response => {
            callback(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
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
        this.extendMapBounds();
    }
    componentWillReceiveProps(nextProps) {

        if(this.markers){
            Object.keys(this.markers).forEach(key => {
                if(this.isMarkerChanged(this.markers[key], _.find(nextProps.dropPins, (item) => item.name == key))){
                    this.initPins(nextProps);
                }
            });
        }

    }
    isMarkerChanged(currentMarker, newMarker){
        let currentPin = currentMarker && currentMarker.position ? currentMarker.position.lat + "," + currentMarker.position.lng : "";
        let newPin = newMarker && newMarker.position ? newMarker.position.lat + "," + newMarker.position.lng : "";
        return currentPin != newPin && newPin != "";
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
            }else{
                this.createMarker(marker);
            }
        }
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
        let config = {
            name: marker.name,
            draggable: marker.draggable,
            position: marker.position,
            animation: google.maps.Animation.DROP,
            map: this.map,
            icon: marker.pinColor ? this.alternativePins[marker.pinColor] : null
        };
        this.markers[marker.name] = new google.maps.Marker(config);
        this.markers[marker.name].addListener('dragend', () => marker.dragend(this.markers[marker.name]));
    }
    extendMapBounds(){
        if(Object.keys(this.markers).length > 1){
            let bounds = new google.maps.LatLngBounds();
            Object.keys(this.markers).forEach(key => {
                bounds.extend(this.markers[key].getPosition());
            });
            this.map.fitBounds(bounds);
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