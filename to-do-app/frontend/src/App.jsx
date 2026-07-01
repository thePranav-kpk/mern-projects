import { useState, useEffect } from "react";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import "./App.css";

const API_URL = "http://localhost:5000/api/v1/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all todos from the database when app loads
  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch todos");

      const data = await response.json();
      setTodos(data.todos);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTodos();
    }, 0);

    return () => clearTimeout(timer); // Clean up timer
  }, []);

  // Handler: Add a new todo to the database
  const addTodo = async (title) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Failed to create todo");

      const data = await response.json();
      setTodos([...todos, data.todo]); // Append new todo from backend to state
    } catch (err) {
      alert(err.message);
    }
  };

  // Handler: Toggle complete status in the database
  const toggleComplete = async (id) => {
    const todoToToggle = todos.find((todo) => (todo._id || todo.id) === id);
    if (!todoToToggle) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !todoToToggle.completed }),
      });
      if (!response.ok) throw new Error("Failed to update todo");

      const data = await response.json();

      setTodos(
        todos.map((todo) => ((todo._id || todo.id) === id ? data.todo : todo)),
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Handler: Delete a todo from the database
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete todo");

      setTodos(todos.filter((todo) => (todo._id || todo.id) !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container">
      <h1>Task Manager</h1>
      <TodoForm addTodo={addTodo} />

      {loading ? (
        <p className="empty-list">Loading tasks...</p>
      ) : error ? (
        <p className="empty-list" style={{ color: "var(--danger)" }}>
          Error: {error}
        </p>
      ) : (
        <TodoList
          todos={todos}
          toggleComplete={toggleComplete}
          deleteTodo={deleteTodo}
        />
      )}
    </div>
  );
}

export default App;
