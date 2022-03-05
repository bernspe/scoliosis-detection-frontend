export function getterFrontendVersion(state) {
    return state.versions.frontend;
}

export function getterFrontendDate(state) {
    return state.versions.frontend_date;
}

export function getterBackendVersion(state) {
    return state.versions.backend;
}

export function getterBackendDate(state) {
    return state.versions.backend_date;
}


export function getterDevice(state) {
    return state.device;
}

export function isMobile(state) {
    return state.device.isMobile;
}

export function isThisDeviceFastLogin(state){
    return state.device.isInList;
}

export function getterOtherDevices(state) {
    return state.other_devices;
}

export function getterStatus(state,id)  {
    return state.entries[id].status
}

export function getterTitle(state,id)  {
    return state.entries[id].title
}

export function getterAllEntries(state) {
    return state.entries;
}

export function getterSelectedEntries(state){
        var d = {};
        var l = state.selectEntriesKeys.length;
        for (var i=0; i<l;i++)  {
            const id=state.selectEntriesKeys[i];
            d[id]=state.entries[id];
        }
        return d;
}

export function getterAuthToken(state) {
    return 'Bearer '+state.token;
}

export function getterInformationSwitch(state) {
    return state.informationSwitch;
}