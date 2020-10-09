import React from "react";
import ReactDOM from 'react-dom';
import { GoogleMaps } from "susam-components/advanced/GoogleMaps";
import { Button, Notify } from 'susam-components/basic';
import uuid from "uuid";
import { KartoteksService } from "../../../services";



export class LocationMap extends React.Component {
    constructor(props) {
        super(props);

        this.state={};

        this.id = (props.id ? props.id : uuid.v4()).replace(/-/g, '');
        this.key = "AIzaSyDE6jFmZfiFjIYBu9CD2lNKSxYaJhAF4nI";
        //this.key = "AIzaSyChgiAMDKWpPRM8b3ajXfyrrLnOt_cG3tM";

        this.loadData(props);

    }

    componentDidMount() {
        KartoteksService.getProperty('google.apikey').then(response=>{
            let googleMapsBaseScriptUrl = 'https://maps.googleapis.com/maps/api/js';
            let googleMapsScriptUrl = googleMapsBaseScriptUrl + "?key=" + response.data + "&callback=initMap" + this.id;

            this.INITIAL_POSITION = {lat: 40.97379, lng: 29.253641};

            this.DEFAULT_POLYGON_SIZE = 0.0006;

            this.markers = {};

            this.alternativePins = {};
            this.alternativePins.blue = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
            this.alternativePins.purple = "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
            this.alternativePins.green = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
            this.alternativePins.yellow = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";

            this.MAX_AUTO_ZOOMIN = 0.04;


            window['initMap' + this.id] = () => {
                this.map = new google.maps.Map(document.getElementById(this.id), {zoom: 7});
                this.map.setCenter(this.INITIAL_POSITION);
                this.loadData(this.props);

            };
            if(!GoogleMaps.addScript(googleMapsBaseScriptUrl, googleMapsScriptUrl, true, true)){
                this.map = new google.maps.Map(document.getElementById(this.id), {zoom: 7});
                this.map.setCenter(this.INITIAL_POSITION);
                this.loadData(this.props);
            }
        })

    }


    loadData(props) {
        if(this.map) {
            this.loadPins(props);
            if(props.polygon) {
                this.loadPolygonButtons(props);
            }
        }

        if(props.polygon && this.state.polygonMode) {
            this.loadPolygon(props);
            this.extendMapBoundsForPolygon();
        }
        else {
            this.extendMapBoundsForPins();
        }
    }

    //PINS - START//
    loadPins(props) {
        if (props && props.dropPins) {

            Object.keys(props.dropPins).forEach(key => {
                this.dropPin(key, props.dropPins[key]);
            });
        }
    }

    dropPin(key, pin) {
        if(this.map && pin){
            this.map.setCenter(pin.position);
            if(this.markers[key]){
                this.markers[key].setPosition(pin.position);
                this.markers[key].setIcon(this.alternativePins[pin.pinColor]);
            }else{
                this.createMarker(key, pin);
            }
        }
    }

    createMarker(key, pin){
        if(pin.pinColor){
            pin.icon = this.alternativePins[pin.pinColor];
        }
        let config = _.merge({animation: google.maps.Animation.DROP, map: this.map}, pin);
        this.markers[key] = new google.maps.Marker(config);
        this.markers[key].addListener('dragend', () => pin.dragend(this.markers[key]));
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
    //PINS - END//



    //POLYGONS - START//
    loadPolygon(props) {

        if(!props.polygon) {
            return;
        }

        let paths = props.polygon.paths;

        if(!paths || paths.length == 0) {

            let primaryPin = props.dropPins.primary;
            if(!primaryPin) {
                return;
            }

            let position = primaryPin.position;

            if(!position) {
                return;
            }

            paths = this.createInitialPolygonPath(position);
        }

        if(!this.polygon) {
            this.polygon = new google.maps.Polygon({
                paths: paths,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                editable: true
            });
            this.polygon.setMap(this.map);
        } else{
            this.polygon.setPath(paths);
        }


    }

    createInitialPolygonPath(position) {
        return [
            {lat: position.lat - this.DEFAULT_POLYGON_SIZE, lng: position.lng - this.DEFAULT_POLYGON_SIZE},
            {lat: position.lat - this.DEFAULT_POLYGON_SIZE, lng: position.lng + this.DEFAULT_POLYGON_SIZE},
            {lat: position.lat + this.DEFAULT_POLYGON_SIZE, lng: position.lng + this.DEFAULT_POLYGON_SIZE},
            {lat: position.lat + this.DEFAULT_POLYGON_SIZE, lng: position.lng - this.DEFAULT_POLYGON_SIZE}
        ]
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

        let label = "Add Polygon";

        if (props.polygon && props.polygon.paths) {
            label = "Edit Polygon";

            polygonExistContent =
                <td>
                    <i className="uk-icon uk-icon-large uk-icon-check" />
                </td>;
        }

        let content = <table>
            <tbody>
            <tr>
                {polygonExistContent}
                <td>
                    <Button size="small" label={label}
                            onclick={() => this.polygonAddButtonClicked()}/>
                </td>
            </tr>
            </tbody>
        </table>

        return content;
    }

    polygonButtonLayout2(props) {

        let cancelButton = null;

        if (props.polygon.paths) {
            cancelButton = <td>
                <Button size="small" label="Cancel"
                        onclick={() => this.polygonCancelButtonClicked(props)}/>
            </td>;
        }

        let content = <table>
            <tbody>
            <tr>
                <td>
                    <Button style="success" size="small" label="Done"
                            onclick={() => this.polygonDoneButtonClicked(props)}/>
                </td>
                {cancelButton}
                <td>
                    <Button style="danger" size="small" label="Delete"
                            onclick={() => this.polygonRemoveButtonClicked(props)}/>
                </td>
            </tr>
            </tbody>
        </table>

        return content;
    }

    polygonAddButtonClicked() {
        let bounds = new google.maps.LatLngBounds();
        this.setState({polygonMode: true, backupMapBounds: bounds});
    }

    polygonDoneButtonClicked(props) {
        this.setState({polygonMode: false}, () => {
            let array = this.polygon.getPath().getArray().map( (a, i) => {return {lat: a.lat(), lng: a.lng(), sortIndex:i}});
            props.polygon.updateCoordinate(array);
            this.polygon.setPath([]);
            this.map.fitBounds(this.state.backupMapBounds);
            this.setState({backupMapBounds: null});
        });
    }

    polygonCancelButtonClicked(props) {
        this.polygon.setPath(props.polygon.paths);
    }

    polygonRemoveButtonClicked(props) {

        Notify.confirm("This will delete the polygon, Are you sure?", () => {
            this.setState({polygonMode: false}, () => {
                props.polygon.updateCoordinate(null);
                this.polygon.setPath([]);
                this.map.fitBounds(this.state.backupMapBounds);
                this.setState({backupMapBounds: null});
            });
        });
    }


    extendMapBoundsForPolygon() {

        if(!this.polygon) {
            return;
        }

        if(this.polygon.getPath()) {
            let bounds = new google.maps.LatLngBounds();

            this.polygon.getPath().getArray().forEach(path => {
                bounds.extend(path);
            });
            this.map.fitBounds(bounds);
        }

    }
    //POLYGONS - END//



    render() {

        this.loadData(this.props);


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