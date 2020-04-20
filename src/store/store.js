import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import db from '../firebase';

Vue.use(Vuex);

axios.defaults.baseURL = 'http://todo-vue-laravel.test/api';

export const store = new Vuex.Store({
    state: {
        token: localStorage.getItem('access_token') || null,
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

        loggedIn(state) {
            return state.token != null;
        }
    },

    mutations: {
        addTodo(state, todo) {
            state.todos.push({
                id: todo.id,
                title: todo.title,
                completed: false,
                timestamp: new Date(),
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

            if (todoIndex >= 0) {
                state.todos.splice(todoIndex, 1);
            }
        },

        retrieveTodos(state, todos) {
            state.todos = todos;
        },

        retrieveToken(state, token) {
            state.token = token;
        },

        destroyToken(state) {
            state.token = null;
        },
    },

    actions: {
        retrieveName(context) {
            const token = context.state.token;
            const headers = { headers: { 'Authorization': `Bearer ${token}` } };

            return new Promise((resolve, reject) => {
                axios.get('/user/', headers)
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
            });
        },

        register(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/register/', {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
            });
        },

        destroyToken(context) {
            if (context.getters.loggedIn) {
                const token = context.state.token;
                const headers = { headers: { 'Authorization': `Bearer ${token}` } };

                return new Promise((resolve, reject) => {
                    axios.post('/logout/', {}, headers)
                    .then(response => {
                        localStorage.removeItem('access_token');
                        context.commit('destroyToken');

                        resolve(response);
                    })
                    .catch(error => {
                        localStorage.removeItem('access_token');
                        context.commit('destroyToken');

                        reject(error);
                    });
                });
            }
        },

        retrieveToken(context, credentials) {
            return new Promise((resolve, reject) => {
                axios.post('/login', {
                    username: credentials.username,
                    password: credentials.password,
                })
                .then(response => {
                    const token = response.data.access_token;
    
                    localStorage.setItem('access_token', token);
                    context.commit('retrieveToken', token);
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
            });
        },

        initRealtimeListeners(context) {
            db.collection("todos").onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        const source = change.doc.metadata.hasPendingWrites ? "Local" : "Server";

                        if (source == 'Server') {
                            context.commit('addTodo', {
                                id: change.doc.id,
                                title: change.doc.data().title,
                                completed: false,
                            });
                        }
                    }
                    if (change.type === "modified") {
                        context.commit('updateTodo', {
                            id: change.doc.id,
                            title: change.doc.data().title,
                            completed: change.doc.data().completed,
                        });
                    }
                    if (change.type === "removed") {
                        context.commit('deleteTodo', change.doc.id);
                    }
                });
            });
        },

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
            }, { merge: true })
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