<template>
  <div>
    <input
      type="text"
      class="todo-input"
      placeholder="What needs to be done"
      v-model="newTodo"
      @keyup.enter="addTodo"
    />

    <transition-group
      enter-active-class="animated fadeInUp"
      leave-active-class="animated fadeOutDown"
    >
      <todo-item
        v-for="todo in todosFiltered"
        :key="todo.id"
        :todo="todo"
        :checkAll="!anyRemaining"
      ></todo-item>
    </transition-group>

    <div class="extra-container">
      <div>
        <todo-check-all :anyRemaining="anyRemaining"></todo-check-all>
      </div>
      <todo-items-remaining :remaining="remaining"></todo-items-remaining>
    </div>
    <div class="extra-container">
      <todo-filtered></todo-filtered>

    <transition name="fade">
      <todo-clear-completed
        :showClearCompletedButton="showClearCompletedButton"
      >
      </todo-clear-completed>
    </transition>
    </div>
  </div>
</template>

<script>
import TodoItem from './TodoItem';
import TodoItemsRemaining from './TodoItemsRemaining';
import TodoCheckAll from './TodoCheckAll';
import TodoFiltered from './TodoFiltered';
import TodoClearCompleted from './TodoClearCompleted';

export default {
  name: 'todo-list',
  components: {
    TodoItem,
    TodoItemsRemaining,
    TodoCheckAll,
    TodoFiltered,
    TodoClearCompleted,
  },

  data() {
    return {
        newTodo: '',
        idForTodo: 3,
        todos: [
            {
                'id': 1,
                'title': 'Finish Vue Screencast',
                'completed': false,
                'editing': false,
            },
            {
                'id': 2,
                'title': 'Take over world',
                'completed': false,
                'editing': false,
            }
        ],
        beforeEditCache: '',
        filter: 'all',
    }
  },


  created() {
      window.eventBus.$on('removedTodo', (index) => this.removeTodo(index));
      window.eventBus.$on('finishedEdit', (data) => this.finishedEdit(data));
      window.eventBus.$on('checkAllChanged', (checked) => this.checkAllTodos(checked));
      window.eventBus.$on('filterChanged', (filter) => this.filter = filter);
      window.eventBus.$on('clearCompletedTodos', () => this.clearCompleted());
  },

  beforeDestroy() {
      window.eventBus.$off('removedTodo', (index) => this.removeTodo(index));
      window.eventBus.$off('finishedEdit', (data) => this.finishedEdit(data));
      window.eventBus.$off('checkAllChanged', (checked) => this.checkAllTodos(checked));
      window.eventBus.$off('filterChanged', (filter) => this.filter = filter);
      window.eventBus.$off('clearCompletedTodos', () => this.clearCompleted());
  },

  computed: {
      remaining() {
          return this.todos.filter(todo => ! todo.completed).length;
      },

      anyRemaining() {
          return this.remaining != 0;
      },

      todosFiltered() {
          if (this.filter == 'all') {
              return this.todos;
          } else if (this.filter == 'active') {
              return this.todos.filter(todo => ! todo.completed);
          } else if (this.filter == 'completed') {
              return this.todos.filter(todo => todo.completed);
          }

          return this.todos;
      },

      showClearCompletedButton() {
          return this.todos.filter(todo => todo.completed).length > 0;
      },
  },

  methods: {
    addTodo() {
        if (this.newTodo.trim().length == 0) { return }

        this.todos.push({
            'id': this.idForTodo,
            'title': this.newTodo,
            'completed': false,
            'editing': false,
        });

        this.newTodo = '';
        this.idForTodo++;
    },

    removeTodo(id) {
        const index = this.todos.findIndex((item) => item.id == id)
        this.todos.splice(index, 1);
    },

    checkAllTodos() {
        this.todos.forEach(todo => { todo.completed = event.target.checked });
    },

    clearCompleted() {
        this.todos = this.todos.filter(todo => ! todo.completed);
    },

    finishedEdit(data) {
        const index = this.todos.findIndex((item) => item.id == data.id)
        this.todos.splice(index, 1, data)
    }
  }
}
</script>

<style lang="scss">
@import url("https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css");

.todo-item-left {
  display: flex;
  align-items: center;
}

.todo-input {
  width: 100%;
  padding: 10px 18px;
  font-size: 18px;
  margin-bottom: 16px;

  &:focus {
    outline: 0;
  }
}

.todo-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation-duration: 0.3s;
}

.remove-item {
  cursor: pointer;
  margin-left: 14px;
  &:hover {
    color: #000;
  }
}

.todo-item-edit {
  font-size: 24px;
  color: #2c3e50;
  margin-left: 12px;
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  font-family: "Avenir", Helvetica, Arial, sans-serif;

  &:focus {
    outline: none;
  }
}

.todo-item-label {
  padding: 10px;
  border: 1px solid white;
  margin-left: 12px;
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently */
}

.completed {
  text-decoration: line-through;
  color: grey;
}

.extra-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  border-top: 1px solid lightgrey;
  padding-top: 14px;
  margin-bottom: 14px;
}

button {
  font-size: 14px;
  background-color: #fff;
  appearance: none;

  &:hover {
    background: lightgreen;
  }

  &:focus {
    outline: none;
  }
}

.active {
  background: lightgreen;
}

// CSS Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
