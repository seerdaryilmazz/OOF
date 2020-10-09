export class PlanningSearchConstans  {

    static OP_TYPE_LOAD = "Load";

    static OP_TYPE_UNLOAD = "Unload";

    static OP_TYPE_NONE = "None";

    static LOCATION_TYPE_CUSTOMER = "Customer";

    static LOCATION_TYPE_WAREHOUSE = "Warehouse";

    static LOCATION_TYPE_TRAILER = "Trailer";

    static STOP_STATUS_PENDING = {
        id: "PENDING",
        name: "Pending",
        class: "danger"
    };

    static STOP_STATUS_ARRIVED = {
        id: "ARRIVED",
        name: "Arrived",
        class: "success"
    };

    static STOP_STATUS_DEPARTED = {
        id: "DEPARTED",
        name: "Departed",
        class: "primary"
    };

    static STOP_SUBSTATUS_UNLOADING_STARTED = {
        id: "UNLOADING_STARTED",
        name: "Unloading Started",
        class: "success"
    };

    static STOP_SUBSTATUS_UNLOADING_COMPLETED = {
        id: "UNLOADING_COMPLETED",
        name: "Unloading Completed",
        class: "success"
    };

    static STOP_SUBSTATUS_LOADING_STARTED = {
        id: "LOADING_STARTED",
        name: "Loading Started",
        class: "success"
    };

    static STOP_SUBSTATUS_LOADING_COMPLETED = {
        id: "LOADING_COMPLETED",
        name: "Loading Completed",
        class: "success"
    };

    static STOP_SUBSTATUS_PLAN_COMPLETED = {
        id: "PLAN_COMPLETED",
        name: "Plan Completed",
        class: "primary"
    };


    static PLAN_STATUS_NOT_STARTED = {
        id: "PLAN_NOT_STARTED",
        name: "Not Started",
        class: "danger"
    }
    static PLAN_STATUS_IN_PROGRESS = {
        id: "IN_PROGRESS",
        name: "In Progress",
        class: "success"
    }
    static PLAN_STATUS_COMPLETED = {
        id: "PLAN_COMPLETED",
        name: "Completed",
        class: "primary"
    }
}