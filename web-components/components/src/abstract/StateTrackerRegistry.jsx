import {StateTracker} from "./StateTracker";

export class StateTrackerRegistry {

    constructor() {
        this.stateTrackerList = [];
    }

    registerStateTracker(component, propsToCheck, options, initialState, onStateChanged, onStateUnchanged) {
        console.log("Currently there are " + this.stateTrackerList.length + " state trackers. Registering a new state tracker.");
        this.stateTrackerList.push(new StateTracker(component, propsToCheck, options, initialState, onStateChanged, onStateUnchanged));
    }
}