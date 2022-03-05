<template>

            <router-view></router-view>

</template>

<script>
    import {run_init_after_auth} from "@/initblock2";

    export default {
        name: 'Landingpage',
        created() {
            run_init_after_auth(this)
        }
    };
</script>
