<template>
    <div class="todo-item">
        <div class="todo-item-left">
            <input 
                type="checkbox" 
                v-model="completed" 
                @change="doneEdit"
            >
            <div 
                v-if="! editing" 
                @dblclick="editTodo" 
                class="todo-item-label noselect"
                :class="{ completed : completed }"
            >
                {{ title }}
            </div>
            <input
                v-else 
                class="todo-item-edit" 
                type="text" 
                v-model="title"
                
                @keyup.enter="doneEdit"
                @keyup.esc="cancelEdit"
                @blur="doneEdit"
                v-focus
            >
        </div>
        <div>
            <button @click="pluralize">
                Plural
            </button>
            <span class="remove-item" @click="removeTodo(todo.id)">
                &times;
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'todo-item',

    props: {
        todo: {
            type: Object,
            required: true,
        },
        checkAll: {
            type: Boolean,
            required: true,
        },
    },

    created() {
        window.eventBus.$on('pluralize', this.handlePluralize)
    },

    beforeDestroy() {
        window.eventBus.$on('pluralize', this.handlePluralize)
    },

    data() {
        return {
            'id': this.todo.id,
            'title': this.todo.title,
            'completed': this.todo.completed,
            'editing': this.todo.editing,
            'beforeEditCache': '',
        }
    },

    watch: {
        checkAll() {
            this.completed = this.checkAll ? true : this.todo.completed;
        },

        todo() {
            this.title = this.todo.title;
            this.completed = this.todo.completed;
        },
    },

    methods: {
        removeTodo() {
            this.$store.dispatch('deleteTodo', this.id);
        },

        editTodo() {
            this.beforeEditCache = this.title,
            this.editing = true;
        },

        doneEdit() {
            if (this.title.trim().length == 0) {
                this.title = this.beforeEditCache;
            }

            this.editing = false;

            this.$store.dispatch('updateTodo', {
                'id': this.id,
                'title': this.title,
                'completed': this.completed,
                'editing': this.editing,
            });
        },

        cancelEdit() {
            this.title = this.beforeEditCache;
            this.editing = false;
        },

        pluralize() {
            window.eventBus.$emit('pluralize');
        },

        handlePluralize() {
            this.title = this.title + 's';

            const index = this.$store.state.todos.findIndex((item) => item.id == this.id);
            
            this.$store.state.todos.splice(index, 1, {
                'id': this.id,
                'title': this.title,
                'completed': this.completed,
                'editing': this.editing,
            });
        }
    },

    directives: {
      focus: {
          inserted: function(el) {
              el.focus();
          }
      }
    },
}
</script>