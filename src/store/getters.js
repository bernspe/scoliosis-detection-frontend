/**
*
* 
* @param { Vuexmod1State } state
* @return { string }
*/

export function getterAuth(state){
    return state.isAuthenticated;
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
