<template>
    <div></div>
</template>

<script>
export default {
    name: 'logout',

    created() {
        this.$store.dispatch('destroyToken')
            .then(() => {
                this.$router.push({ name: 'home' });
            })
            .catch(error => {
                console.log(error);
            })
    },
}
</script>