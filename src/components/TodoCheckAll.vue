<template>
    <label>
        <input type="checkbox" :checked="! anyRemaining" @change="allChecked"/>
        Check All
    </label>
</template>

<script>
export default {
    name: 'todo-check-all',
    props: {
        anyRemaining: {
            type: Boolean,
            required: true
        }
    },
    
    methods: {
        allChecked() {
            window.eventBus.$emit('checkAllChanged', this.anyRemaining);
        }
    }
}
</script>