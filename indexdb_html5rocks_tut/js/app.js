var html5rocks = {};
html5rocks.indexedDB = {};

html5rocks.indexedDB.db = null;

html5rocks.indexedDB.open = function() {
  var version = 1;
  var request = indexedDB.open("todos", version);

  // We can only create Object stores in a versionchange transaction.
  request.onupgradeneeded = function(e) {
    var db = e.target.result;

    // A versionchange transaction is started automatically.
    e.target.transaction.onerror = html5rocks.indexedDB.onerror;

    if(db.objectStoreNames.contains("todo")) {
      db.deleteObjectStore("todo");
    }

    var store = db.createObjectStore("todo",
      {keyPath: "timeStamp"});
  };

  request.onsuccess = function(e) {
    html5rocks.indexedDB.db = e.target.result;
    html5rocks.indexedDB.getAllTodoItems();
  };

  request.onerror = html5rocks.indexedDB.onerror;
};

html5rocks.indexedDB.addTodo = function(todoText) {
  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");
  var request = store.put({
    "text": todoText,
    "timeStamp" : new Date().getTime()
  });

  request.onsuccess = function(e) {
    // Re-render all the todo's
    html5rocks.indexedDB.getAllTodoItems();
  };

  request.onerror = function(e) {
    console.log(e.value);
  };
};

html5rocks.indexedDB.getAllTodoItems = function() {
  var todos = document.getElementById("todoItems");
  todos.innerHTML = "";

  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");

  // Get everything in the store;
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(!!result == false)
      return;

    renderTodo(result.value);
    result.continue();
  };

  cursorRequest.onerror = html5rocks.indexedDB.onerror;
};

function renderTodo(row) {
  var todos = document.getElementById("todoItems");
  var li = document.createElement("li");
  var a = document.createElement("a");
  var t = document.createTextNode();
  t.data = row.text;

  a.addEventListener("click", function(e) {
    html5rocks.indexedDB.deleteTodo(row.text);
  });

  a.textContent = " [Delete]";
  li.appendChild(t);
  li.appendChild(a);
  todos.appendChild(li);
}

html5rocks.indexedDB.deleteTodo = function(id) {
  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");

  var request = store.delete(id);

  request.onsuccess = function(e) {
    html5rocks.indexedDB.getAllTodoItems();  // Refresh the screen
  };

  request.onerror = function(e) {
    console.log(e);
  };
};

function init() {
  html5rocks.indexedDB.open(); // open displays the data previously saved
}

window.addEventListener("DOMContentLoaded", init, false);

function addTodo() {
  var todo = document.getElementById('todo');

  html5rocks.indexedDB.addTodo(todo.value);
  todo.value = '';
}
