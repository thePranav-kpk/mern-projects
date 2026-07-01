import { useState } from "react";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import "./App.css";

function App() {
  // Temporary local state for testing the UI
  const [todos, setTodos] = useState([
    { id: 1, title: "Learn MERN Stack", completed: false },
    { id: 2, title: "Build a Todo App", completed: true },
  ]);

  // Handler: Add a todo locally
  const addTodo = (title) => {
    const newTodo = {
      id: Date.now(), // Generate a temp local ID
      title,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  // Handler: Toggle complete status locally
  const toggleComplete = (id) => {
    const newTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
    setTodos(newTodos);
  };

  // Handler: Delete a todo locally
  const deleteTodo = (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id);
    setTodos(newTodos);
  };

  return (
    <div className="app-container">
      <h1>Task Manager</h1>
      <TodoForm addTodo={addTodo} />
      <TodoList
        todos={todos}
        toggleComplete={toggleComplete}
        deleteTodo={deleteTodo}
      />
    </div>
  );
}

export default App;
