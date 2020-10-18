import { SET_DATA } from './mutation-types';

/**
*
* @param { function } commit
* @param { string } data
*/
export function setData({ commit }, { data }) {
    commit(SET_DATA, { data });
}
