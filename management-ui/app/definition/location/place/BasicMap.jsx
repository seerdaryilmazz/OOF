import React from "react";
import ReactDOM from 'react-dom'
import uuid from "uuid";
import {GoogleMaps} from "./GoogleMaps.jsx";
import {TextInput} from 'susam-components/basic';
import {Button} from 'susam-components/basic';


export class BasicMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.id = (props.id ? props.id : uuid.v4()).replace(/-/g, '');
        this.key = "AIzaSyDE6jFmZfiFjIYBu9CD2lNKSxYaJhAF4nI";
        //this.key = "AIzaSyChgiAMDKWpPRM8b3ajXfyrrLnOt_cG3tM";
    }

    componentDidMount() {
        let googleMapsBaseScriptUrl = 'https://maps.googleapis.com/maps/api/js';
        let googleMapsScriptUrl = googleMapsBaseScriptUrl + "?key=" + this.key + "&callback=initMap" + this.id;
        window['initMap' + this.id] = () => {
            this.init(this.props);
        };
        if(!GoogleMaps.addScript(googleMapsBaseScriptUrl, googleMapsScriptUrl, true, true)){
            this.init(this.props);
        }
        this.MAX_AUTO_ZOOMIN = 0.04;

    }
    init(props){
        console.log("aaa");
        this.createPinImages();
        this.initMap(props);
        this.loadPins(props);
        this.loadPolygon(props);
        this.loadPolygonButtons(props);

    }


    componentWillReceiveProps(nextProps) {

        if(this.markers){
            Object.keys(this.markers).forEach(key => {
                if(this.isMarkerChanged(this.markers[key], _.find(nextProps.dropPins, (item) => item.name == key))){
                    this.loadPins(nextProps);
                }
            });
        }

        if(nextProps.polygon) {
            this.loadPolygon(nextProps);
        }

        this.loadPolygonButtons(nextProps);

    }


    loadPins(props){
        if(props.dropPins){
            props.dropPins.forEach(item => {
                this.dropPin(item);
            });
        }
    }

    loadPolygon(props) {

        if(!props.polygon) {
            return
        }

        var polygon = new google.maps.Polygon({
            paths: this.props.polygon.coords,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            editable: true
        });
        polygon.setMap(this.map);
        google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
            this.props.polygon.updateCoordinate(polygon.getPath().getArray());
        });
    }

    loadPolygonButtons(props) {
        if(!this.controlsDiv) {
            this.controlsDiv = document.createElement('div');
        }

        let content = null;
        if(this.state.polygonMode) {
            content = this.polygonButtonLayout2(props);
        } else {
            content = this.polygonButtonLayout1(props);
        }

        ReactDOM.render(content, this.controlsDiv);

        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].clear();
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.controlsDiv);

    }


    polygonButtonLayout1(props) {

        let polygonExistContent = null;

        if (props.polygon && props.polygon.coords) {
            polygonExistContent = <td>
                <span>exist</span>
            </td>;
        }

        let content = <table>
            <tbody>
            <tr>
                {polygonExistContent}
                <td>
                    <Button label="Polygon"
                            onclick={() => this.polygonAddButtonClicked()}/>
                </td>
            </tr>
            </tbody>
        </table>

        return content;
    }

    polygonButtonLayout2(props) {

        let content = <table>
            <tbody>
            <tr>
                <td>
                    <Button label="Done"
                            onclick={() => this.polygonDoneButtonClicked()}/>
                </td>                <td>
                    <Button label="Remove"
                            onclick={() => this.removePolygonBoundaries()}/>
                </td>
            </tr>
            </tbody>
        </table>

        return content;
    }

    polygonAddButtonClicked() {
        this.setState({polygonMode: true});
    }

    polygonDoneButtonClicked() {
        this.setState({polygonMode: false});
    }

    removePolygonBoundaries() {
        this.props.polygon.coords = null;
    }


    isMarkerChanged(currentMarker, newMarker){
        let currentPin = currentMarker ? currentMarker.position.lat + "," + currentMarker.position.lng : "";
        let newPin = newMarker ? newMarker.position.lat + "," + newMarker.position.lng : "";
        return currentPin != newPin && newPin != "";
    }

    initMap(props) {
        this.map = new google.maps.Map(document.getElementById(this.id), {zoom: 7});
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

    extendMapBoundsForPins(){
        if(!this.markers) {
            return;
        }

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

    extendMapBoundsForPolygon() {

        if(!this.props.polygon) {
            return;
        }

        if(this.props.polygon.coords) {
            let bounds = new google.maps.LatLngBounds();

            this.props.polygon.coords.forEach(coord => {
                bounds.extend(coord);
            });

            this.map.fitBounds(bounds);
        }
    }

    render() {

        if(this.state.polygonMode) {
            this.extendMapBoundsForPolygon();
        } else {
            this.extendMapBoundsForPins();
        }


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