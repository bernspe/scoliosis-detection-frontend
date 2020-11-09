/**
*
* 
* @param { Vuexmod1State } state
* @return { string }
*/

import { STATUS as AUTH_STATUS } from "@/store/mutations";

export function getterAuth(state){
    if (state.isAuthenticated) {
        if (state.isAuthenticated == AUTH_STATUS.success) {
            return true
        } else
        { return false} }
    else {
        return false
}}

export function getterUsername(state) {
    return state.authUser;
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
