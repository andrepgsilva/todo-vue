<template>
    <div class="login-form page-wrapper">
        <h2 class="login-heading">
            Login
        </h2>

        <form action="#" @submit.prevent="login">
            <div v-if="successMessage" class="success-message">
                {{ successMessage }}
            </div>

            <div v-if="serverError" class="server-error">
                {{ serverError }}
            </div>

            <div class="form-control">
                <label for="email">Username/Email</label>
                <input 
                    type="text" 
                    name="username" 
                    id="username" 
                    class="login-input"
                    v-model="username"
                >
            </div>

            <div class="form-control mb-more">
                <label for="password">Password</label>
                <input 
                    type="password" 
                    name="password" 
                    id="password" 
                    class="login-input"
                    v-model="password"
                >
            </div>

            <div class="form-control">
                <button type="submit" class="btn-submit">
                    Login
                </button>
            </div>
        </form>
    </div>
</template>

<script>
export default {
    name: 'login',
    
    props: {
        dataSuccessMessage: {
            type: String,
        }
    },

    data() {
        return {
            username: '',
            password: '',
            serverError: null,
            successMessage: this.dataSuccessMessage,
        }
    },

    methods: {
        login() {
            this.$store.dispatch('retrieveToken', {
                username: this.username,
                password: this.password,
            })
                .then(() => {
                   this.$router.push({ name: 'todo' }); 
                })
                .catch(error => {
                    this.serverError = error.response.data;
                    this.password = '';
                    this.successMessage = '';
                });
        }
    },
}
</script>