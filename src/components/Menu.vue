<template>
  <div>
    <v-list-item>
      <v-icon large>
        mdi-account-circle
      </v-icon>

      <v-list-item-content class="ml-2">
        <v-list-item-title>{{ getterFirstname }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense>
      <v-list-item v-for="item in items" :key="item.title" link :to="item.url">
          <div
            v-if="item.title=='Diskussionsraum'">
                    <v-list-item-icon>
                 <v-badge

        :value="hasNews"
        color="green"
        bordered
        overlap
      >
                      <v-icon>{{ item.icon }}</v-icon>
                   </v-badge>
        </v-list-item-icon>
      </div>
      <div v-else>
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>
        </div>

                 <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>

      </v-list-item>
    </v-list>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";

export default {
  name: "Menu",
  data() {
    return {
      items_NonValidatedUser: [
        { title: "Home", icon: "mdi-home", url: "/" },
        { title: "Benutzerinformationen", icon: "mdi-account-details-outline", url: "/account"},
        { title: "XR Board", icon: "mdi-file-document", url: "/xrboard" },
        { title: "Impressum", icon: "mdi-information-variant", url:"/impressum" },
      ],
      items_ValidatedUser: [
        { title: "Home", icon: "mdi-home", url: "/" },
        { title: "Benutzerinformationen", icon: "mdi-account-details-outline", url: "/account"},
        { title: "Diskussionsraum", icon: "mdi-forum", url: "/caseroomforum"},
        { title: "XR List", icon: "mdi-book-multiple-outline", url: "/xrlist" },
        { title: "XR Submit", icon: "mdi-radiology-box-outline", url: "/xrsubmit" },
        { title: "XR Board", icon: "mdi-file-document", url: "/xrboard" },
        { title: "Impressum", icon: "mdi-information-variant", url:"/impressum" },
      ],
      items_Staff: [
        { title: "Home", icon: "mdi-home", url: "/" },
        { title: "Benutzerinformationen", icon: "mdi-account-details-outline", url: "/account"},
        { title: "XR List", icon: "mdi-book-multiple-outline", url: "/xrlist" },
        { title: "XR Submit", icon: "mdi-radiology-box-outline", url: "/xrsubmit" },
        { title: "XR Board", icon: "mdi-file-document", url: "/xrboard" },
        { title: "Document Dashboard", icon: "mdi-file-document-outline", url: "/consentdocs" },
        { title: "User Dashboard", icon: "mdi-account-supervisor", url: "/dashboard" },
        { title: "Impressum", icon: "mdi-information-variant", url:"/impressum" },
      ]
    };
  },
computed:{
  ...mapGetters("auth", ['getterFirstname', "isValidatedUser",'isNonValidatedUser','isStaff','getterUsernameSimple']),

  hasNews () {
    let username=this.getterUsernameSimple
    let cr=this.$store.state.caseroom.UserCaseRooms
            if (cr) {
                let news = Object.values(cr).map((x) => x.news_for_participants.includes(username))
                return news.includes(true)
            }
        return false
  },

  items: function () {
    let a=[]

    if (this.isNonValidatedUser) {
      let at=a.map(x=>x.title)
      a.push(...this.items_NonValidatedUser.filter((item) => at.indexOf(item.title)<0))
    }
    if (this.isValidatedUser) {
      let at=a.map(x=>x.title)
      a.push(...this.items_ValidatedUser.filter((item) => at.indexOf(item.title)<0))
    }
    if (this.isStaff) {
      let at=a.map(x=>x.title)
      a.push(...this.items_Staff.filter((item) => at.indexOf(item.title)<0))
    }
    return a
  }
  }
};
</script>
