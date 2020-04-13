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
        <div class="remove-item" @click="removeTodo(todo.id)">
            &times;
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
            this.completed = this.checkAll ? true : false;
        }
    },

    methods: {
        removeTodo(id) {
             this.$emit('removedTodo', id)
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
            this.$emit('finishedEdit', {
                'id': this.id,
                'title': this.title,
                'completed': this.completed,
                'editing': this.editing,
            })
        },

        cancelEdit() {
            this.title = this.beforeEditCache;
            this.editing = false;
        },
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