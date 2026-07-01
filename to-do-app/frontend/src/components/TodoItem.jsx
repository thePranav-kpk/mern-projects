const TodoItem = ({ todo, toggleComplete, deleteTodo }) => {
  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <span onClick={() => toggleComplete(todo.id || todo._id)}>
        {todo.title}
      </span>
      <button
        onClick={() => deleteTodo(todo.id || todo._id)}
        className="delete-btn"
      >
        Delete
      </button>
    </div>
  );
};

export default TodoItem;
