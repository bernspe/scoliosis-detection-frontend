import actions from '@/store/actions';
import mutations from '@/store/mutations';
import state from '@/store/state';
import * as getters from '@/store/getters';
/*
import auth from "@/store/modules/auth";
import caseroom from "@/store/modules/caseroom";
import mlmodel from "@/store/modules/mlmodel";
import imagecenter from "@/store/modules/imagecenter";
import messagehub from "@/store/modules/messagehub";
import userfindinvite from "@/store/modules/userfindinvite";
*/

export default {
    //modules: { auth, caseroom,mlmodel,imagecenter,messagehub,userfindinvite },
    //namespaced: true,
    mutations,
    actions,
    state,
   getters
}


