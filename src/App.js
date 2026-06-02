// src/App.js - Main application component
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // STATE MANAGEMENT
  // useState creates a piece of state. Returns [currentValue, functionToUpdateIt]
  const [todos, setTodos] = useState([]); // Array of todo objects
  const [inputValue, setInputValue] = useState(""); // Current input field text
  const [filter, setFilter] = useState("all"); // 'all', 'active', or 'completed'
  const [editingId, setEditingId] = useState(null); // Which todo is being edited
  const [editText, setEditText] = useState(""); // What text is being typed
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all"); // NEW: filter by priority

  // LOAD DATA FROM LOCALSTORAGE WHEN APP FIRST OPENS
  // useEffect runs code at specific times. Empty [] means "run once when component mounts"
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos)); // Convert string back to array
    }
  }, []); // Empty dependency array = run only once

  // SAVE DATA TO LOCALSTORAGE WHENEVER TODOS CHANGE
  // [todos] means "run this effect whenever 'todos' changes"
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos)); // Convert array to string
  }, [todos]); // Run every time 'todos' changes

  // Add this useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(debouncedSearch);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [debouncedSearch]);
  // FUNCTION TO ADD A NEW TODO
  const addTodo = () => {
    if (inputValue.trim() === "") return;

    const newTodo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      priority: "medium", // NEW: default priority (high, medium, low)
      createdAt: new Date().toISOString(),
    };

    setTodos([newTodo, ...todos]);
    setInputValue("");
  };
  const editTodo = (id, newText) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo)),
    );
  };

  // ADD THIS NEW FUNCTION
  const updatePriority = (id, newPriority) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, priority: newPriority } : todo,
      ),
    );
  };
  // FUNCTION TO TOGGLE TODO COMPLETION (check/uncheck)
  const toggleTodo = (id) => {
    // Map through all todos, if id matches, toggle completed property
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };
  // FUNCTION TO DELETE A TODO
  const deleteTodo = (id) => {
    // Filter out the todo with matching id
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Start editing a todo
  const startEditing = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  // Save the edited todo
  const saveEdit = (id) => {
    if (editText.trim() !== "") {
      editTodo(id, editText.trim());
    }
    setEditingId(null);
    setEditText("");
  };

  // Cancel editing (press Escape)
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  // FUNCTION TO DELETE ALL COMPLETED TODOS
  const clearCompleted = () => {
    // Keep only todos that are NOT completed
    setTodos(todos.filter((todo) => !todo.completed));
  };

  // FILTER TODOS BASED ON CURRENT FILTER
  const getFilteredTodos = () => {
    // First filter by status (active/completed/all)
    let filtered = todos;
    if (filter === "active") {
      filtered = todos.filter((todo) => !todo.completed);
    } else if (filter === "completed") {
      filtered = todos.filter((todo) => todo.completed);
    }

    // Then filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter((todo) => todo.priority === priorityFilter);
    }

    // Then filter by search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((todo) =>
        todo.text.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort by priority (High first, then Medium, then Low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    filtered.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );

    return filtered;
  };
  // Add this function
  const highlightText = (text, search) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      ),
    );
  };
  // CALCULATE STATISTICS
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const activeTodos = totalTodos - completedTodos;

  return (
    <div className="app-container">
      <h1>✅ My Awesome Todo App</h1>

      {/* INPUT FORM */}
      <div className="todo-form">
        <input
          type="text"
          className="todo-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          placeholder="What needs to be done?"
        />
        <button className="add-btn" onClick={addTodo}>
          Add Task
        </button>
      </div>

      {/* STATISTICS */}
      <div className="stats">
        <span>📊 Total: {totalTodos}</span>
        <span>✅ Completed: {completedTodos}</span>
        <span>⏳ Active: {activeTodos}</span>
      </div>
      {/* NEW: Priority Stats */}
      <div className="priority-stats">
        <span>
          🔴 High: {todos.filter((t) => t.priority === "high").length}
        </span>
        <span>
          🟡 Medium: {todos.filter((t) => t.priority === "medium").length}
        </span>
        <span>🟢 Low: {todos.filter((t) => t.priority === "low").length}</span>
      </div>
      {/* SEARCH BOX SECTION */}
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search todos..."
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
        />
        {searchTerm && (
          <button
            className="clear-search-btn"
            onClick={() => setSearchTerm("")}
          >
            ✕
          </button>
        )}
      </div>
      {/* After the search section, add this */}
      {searchTerm && (
        <div className="search-info">
          Found {getFilteredTodos().length} result(s) for "{searchTerm}"
        </div>
      )}
      {/* FILTER BUTTONS */}
      <div className="filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === "active" ? "active" : ""}`}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>
      {/* NEW: Priority Filter Section */}
      <div className="priority-filters">
        <span className="filter-label">Priority: </span>
        <button
          className={`priority-filter-btn ${priorityFilter === "all" ? "active" : ""}`}
          onClick={() => setPriorityFilter("all")}
        >
          All
        </button>
        <button
          className={`priority-filter-btn high ${priorityFilter === "high" ? "active" : ""}`}
          onClick={() => setPriorityFilter("high")}
        >
          🔴 High
        </button>
        <button
          className={`priority-filter-btn medium ${priorityFilter === "medium" ? "active" : ""}`}
          onClick={() => setPriorityFilter("medium")}
        >
          🟡 Medium
        </button>
        <button
          className={`priority-filter-btn low ${priorityFilter === "low" ? "active" : ""}`}
          onClick={() => setPriorityFilter("low")}
        >
          🟢 Low
        </button>
      </div>
      {/* TODO LIST */}
      <ul className="todo-list">
        {getFilteredTodos().map((todo) => (
          <li key={todo.id} className={`todo-item priority-${todo.priority}`}>
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />

            {editingId === todo.id ? (
              <input
                type="text"
                className="todo-edit-input"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(todo.id);
                  if (e.key === "Escape") cancelEdit();
                }}
                onBlur={() => saveEdit(todo.id)}
                autoFocus
              />
            ) : (
              <>
                <span
                  className={`todo-text ${todo.completed ? "completed" : ""}`}
                  onDoubleClick={() => startEditing(todo.id, todo.text)}
                >
                  {highlightText(todo.text, searchTerm)}
                </span>

                {/* NEW: Priority Selector Dropdown */}
                <select
                  className="priority-select"
                  value={todo.priority}
                  onChange={(e) => updatePriority(todo.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </>
            )}

            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* CLEAR COMPLETED BUTTON - only shows if there are completed todos */}
      {completedTodos > 0 && (
        <button className="clear-btn" onClick={clearCompleted}>
          Clear Completed ({completedTodos})
        </button>
      )}
    </div>
  );
}

export default App;
