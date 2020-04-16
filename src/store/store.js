import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import db from '../firebase';

Vue.use(Vuex);

axios.defaults.baseURL = 'http://todo-vue-laravel.test/api';

export const store = new Vuex.Store({
    state: {
        loading: true,
        filter: 'all',

        todos: [],
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
            context.state.loading = true;

            db.collection('todos').get()
            .then(querySnapshot => {
                let tempTodos = [];

                querySnapshot.forEach(doc => {
                    const data = {
                        id: doc.id,
                        title: doc.data().title,
                        completed: doc.data().completed,
                        timestamp: doc.data().timestamp,
                    };

                    tempTodos.push(data);
                });

                context.state.loading = false;
                
                const tempTodosSorted = tempTodos.sort((a, b) => {
                    return a.timestamp.seconds - b.timestamp.seconds;
                });

                context.commit('retrieveTodos', tempTodosSorted);

            })
            .catch(error => {
                console.log(error)
            });
        },

        addTodo(context, todo) {
            db.collection('todos').add({
                title: todo.title,
                completed: false,
                timestamp: new Date(),
            })
            .then(docRef => {
                context.commit('addTodo', {
                    id: docRef.id,
                    title: todo.title,
                    completed: false,
                });
            })
            .catch(error => {
                console.log(error);
            });
        },

        updateTodo(context, todo) {
            db.collection('todos').doc(todo.id).set({
                id: todo.id,
                title: todo.title,
                completed: todo.completed,
                timestamp: new Date(),
            })
            .then(() => {
                context.commit('updateTodo', todo);
            })
            .catch(error => {
                console.log(error);
            });
        },

        checkAll(context, checked) {
            db.collection('todos').get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        doc.ref.update({
                           completed: checked 
                        })
                        .then(() => {
                            context.commit('checkAll', checked);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                    });
                });

            context.commit('checkAll', checked);
        },

        deleteTodo(context, id) {
            db.collection('todos').doc(id).delete()
                .then(() => {
                    context.commit('deleteTodo', id);
                })
                .catch(error => {
                    console.log(error)
                });
        },

        clearCompleted(context) {
            db.collection('todos').where('completed', '==', true).get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        doc.ref.delete()
                        .then(() => {
                            context.commit('clearCompleted');
                        })
                        .catch(error => {
                            console.log(error);
                        })
                    });
                })
        },

        updateFilter(context, filter) {
            context.commit('updateFilter', filter)
        },
    },
});