import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

axios.defaults.baseURL = 'http://todo-vue-laravel.test/api';

export const store = new Vuex.Store({
    state: {
        filter: 'all',

        todos: [
            // {
            //     'id': 1,
            //     'title': 'Finish Vue Screencast',
            //     'completed': false,
            //     'editing': false,
            // },
            // {
            //     'id': 2,
            //     'title': 'Take over world',
            //     'completed': false,
            //     'editing': false,
            // }
        ],
    },
    getters: {
        remaining(state) {
            return state.todos.filter(todo => ! todo.completed).length;
        },
  
        anyRemaining(state, getters) {
            return getters.remaining != 0;
        },
  
        todosFiltered(state) {
            if (state.filter == 'all') {
                return state.todos;
            } else if (state.filter == 'active') {
                return state.todos.filter(todo => ! todo.completed);
            } else if (state.filter == 'completed') {
                return state.todos.filter(todo => todo.completed);
            }
  
            return state.todos;
        },
  
        showClearCompletedButton(state) {
            return state.todos.filter(todo => todo.completed).length > 0;
        },
    },

    mutations: {
        addTodo(state, todo) {
            state.todos.push({
                id: todo.id,
                title: todo.title,
                completed: false,
                editing: false,
            });
        },

        updateFilter(state, filter) {
            state.filter = filter;
        },

        clearCompleted(state) {
            state.todos = state.todos.filter(todo => ! todo.completed);
        },

        checkAll(state, checked) {
            state.todos.forEach(todo => { todo.completed = checked });
        },

        updateTodo(state, todo) {
            const todoIndex = state.todos.findIndex(todoLocal => {
                return todoLocal.id == todo.id;
            });
            
            state.todos.splice(todoIndex, 1, {
                'id': todo.id,
                'title': todo.title,
                'completed': todo.completed,
                'editing': todo.editing,
            });
        },

        deleteTodo(state, id) {
            const todoIndex = state.todos.findIndex(todoLocal => {
                return todoLocal.id == id;
            });
            
            state.todos.splice(todoIndex, 1);
        },

        retrieveTodos(state, todos) {
            state.todos = todos;
        },
    },

    actions: {
        retrieveTodos(context) {
            axios.get('/todos')
                .then(response => {
                    context.commit('retrieveTodos', response.data);
                })
                .catch(error => {
                    console.log(error);
                });
        },

        addTodo(context, todo) {
            axios.post('todos', {
                'title': todo.title,
                'completed': false
            })
                .then(response => {
                    context.commit('addTodo', response.data);
                })
                .catch(error => {
                    console.log(error);
                });
        },

        updateTodo(context, todo) {
            axios.patch('todos/' + todo.id, {
                'title': todo.title,
                'completed': todo.completed,
            })
                .then(response => {
                    context.commit('updateTodo', response.data);
                })
                .catch(error => {
                    console.log(error);
                });
        },

        checkAll(context, checked) {
            axios.patch('todos-check-all/', {
                'completed': checked,
            })
                .then(() => {
                    context.commit('checkAll', checked);
                })
                .catch(error => {
                    console.log(error);
                });

            context.commit('checkAll', checked);
        },

        deleteTodo(context, id) {
            axios.delete('/todos/' + id)
                .then(() => {
                    context.commit('deleteTodo', id);
                })
                .catch(error => {
                    console.log(error);
                });
        },

        clearCompleted(context) {
            const completed = store.state.todos
                    .filter(todo => {
                        return todo.completed;
                    })
                    .map(todo => {
                        return todo.id;
                    });

            axios.delete('/todos-delete-completed', {
                data: {
                    'todos': completed,
                }
            })
                .then(() => {
                    context.commit('clearCompleted');
                })
                .catch(error => {
                    console.log(error);
                });
        },

        updateFilter(context, filter) {
            context.commit('updateFilter', filter)
        },
    },
});