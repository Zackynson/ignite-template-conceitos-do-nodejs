const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(u => u.username === username)
  
  if(!user) return response.status(404).json({error: 'user not found'})
  request.user = user;

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if(users.some(u => u.username === username)) return response.status(400).json({error: 'user already exists'})
  
  const user = { 
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const todos = request.user.todos;

  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { todos } = request.user;
  
  if( !title ) return response.status(400).json({error: 'invalid title'})
  if( !deadline ) return response.status(400).json({error: 'invalid deadline'})

  const todo = { 
      id: uuidv4(), // precisa ser um uuid
      title,
      done: false, 
      deadline: new Date(deadline), 
      created_at: new Date()
    }

  todos.push(todo)

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { todos } = request.user;

  if( !title ) return response.status(400).json({error: 'invalid title'})
  if( !deadline ) return response.status(400).json({error: 'invalid deadline'})

  const todo = todos.find(t => t.id === id)

  if( !todo ) return response.status(404).json({error: 'todo not found'})

  todo.title = title;
  todo.deadline = deadline;


  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;

  const todo = todos.find(t => t.id === id)

  if( !todo ) return response.status(404).json({error: 'todo not found'})

  todo.done = true;

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;

  const todo = todos.find(t => t.id === id)

  if( !todo ) return response.status(404).json({error: 'todo not found'})

  todos.splice(todo, 1);

  return response.status(204).json(todos)
});

module.exports = app;