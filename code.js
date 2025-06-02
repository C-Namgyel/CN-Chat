// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getDatabase, ref, set, child, get, update, onChildAdded, onChildChanged, onChildRemoved, onDisconnect, onValue } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyDkAhgKQNe7OaVT5P0wFg7h98rZT8v22Q0",
  authDomain: "cn-chat-7ac19.firebaseapp.com",
  databaseURL: "https://cn-chat-7ac19-default-rtdb.firebaseio.com",
  projectId: "cn-chat-7ac19",
  storageBucket: "cn-chat-7ac19.appspot.com",
  messagingSenderId: "253710320513",
  appId: "1:253710320513:web:eeab710e0f93a3277f9e80",
  measurementId: "G-TVJ89QCVYC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Functions for Firebase
function uploadData(path, data, callback) {
  set(ref(database, path), data)
    .then(() => {
      callback();
    }).catch((error) => {
      console.error("Error uploading data:", error);
    });
}
function getData(path, callback) {
  get(child(ref(database), path))
    .then((snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback({});
      }
    }).catch((error) => {
      console.error("Error getting data:", error);
    });
}
function updateData(path, data, callback) {
  update(ref(database, path), data)
    .then(() => {
      callback();
    }).catch((error) => {
      console.error("Error updating data:", error);
    });
}
function deleteData(path, callback) {
  set(ref(database, path), null)
    .then(() => {
      callback();
    }).catch((error) => {
      console.error("Error deleting data:", error);
    });
}
function onAdd(path, callback) {
  onChildAdded(ref(database, path), (snapshot) => {
    callback(snapshot.val());
  });
}
function onDelete(path, callback) {
  onChildRemoved(ref(database, path), (snapshot) => {
    callback(snapshot.val());
  });
}
function onUpdate(path, callback) {
  onChildChanged(ref(database, path), (snapshot) => {
    callback(snapshot.val());
  });
}
function onChange(path, callback) {
  onValue(ref(database, path), (snapshot) => {
    callback(snapshot.val());
  });
}
function onDisconnected(path, message) {
  onDisconnect(ref(database, path)).set(message);
}

// Responsive design for the chat container
if (messageInput) {
  messageInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 90) - 16 + 'px';
  });
}

// Global Variables
let starting = true;
let username;
let datas = {};
let onlines = {};
let contextmenuTarget;
let reply = "";
let menuWidth = customMenu.offsetWidth;
let menuHeight = customMenu.offsetHeight;
customMenu.style.display = 'none';

// Functions
function createContextMenu(x, y, exists) {
  if (exists) {
    customMenu.style.left = `${x}px`;
    if (x + menuWidth > document.documentElement.clientWidth) {
      customMenu.style.left = `${window.innerWidth - menuWidth}px`;
    }
    customMenu.style.top = `${y}px`;
    if (y + menuHeight > window.innerHeight) {
      customMenu.style.top = `${window.innerHeight - menuHeight}px`;
    }
    customMenu.style.display = 'block';
    if (datas[contextmenuTarget.id]["name"] == localStorage.getItem('CN-Chat/Username')) {
      customMenuUl.innerHTML = `<li value="1">Reply</li>
            <li value="2">Copy</li>
            <li value="3">Unsend</li>
            <li value="4">Edit</li>`;
    } else {
      customMenuUl.innerHTML = `<li value="1">Reply</li>
            <li value="2">Copy</li>`;
    }
  }
}
function playSound(url) {
  const audio = new Audio(url);
  audio.play()
    .then(() => { })
    .catch(error => console.error("Error playing sound:", error));
}
function createMessage(data) {
  // Create message box
  const messageBox = document.createElement('div');
  messageBox.id = data.id;
  if (data.name == localStorage.getItem('CN-Chat/Username')) {
    messageBox.className = 'message-box-self';
  } else {
    messageBox.className = 'message-box-other';
  }
  // Name
  const nameDiv = document.createElement('div');
  nameDiv.className = 'message-name';
  nameDiv.textContent = data.name || 'Unknown';
  messageBox.appendChild(nameDiv);
  // Content
  const contentDiv = document.createElement('div');
  contentDiv.id = data.id + '.msg';
  contentDiv.className = 'message-content';
  contentDiv.innerHTML = (data.msg || 'No message content').replace(/\n/g, '<br>');
  messageBox.appendChild(contentDiv);
  // Meta (time)
  const metaDiv = document.createElement('div');
  metaDiv.className = 'message-meta';
  const timeSpan = document.createElement('span');
  timeSpan.className = 'message-time';
  // Show current time for now (could be improved with server timestamp)
  const now = new Date();
  timeSpan.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  metaDiv.appendChild(timeSpan);
  // Message status
  const statusSpan = document.createElement('span');
  statusSpan.id = data.id + '.stat';
  statusSpan.className = 'message-status';
  if (data.name == localStorage.getItem('CN-Chat/Username')) {
    statusSpan.textContent = 'Sending...';
  } else {
    statusSpan.textContent = 'Seen';
  }
  metaDiv.appendChild(statusSpan);
  messageBox.appendChild(metaDiv);
  // Append to chatMessages area
  chatMessages.appendChild(messageBox);
  if (chatMessages.scrollTop + chatMessages.clientHeight >= chatMessages.scrollHeight - 150) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  let to;
  messageBox.ontouchstart = function (event) {
    event.preventDefault();
    customMenu.style.display = 'none';
    to = setTimeout(function () {
      contextmenuTarget = messageBox;
      console.log(contextmenuTarget.id)
      createContextMenu(event.changedTouches[0].pageX, event.changedTouches[0].pageY, Object.keys(datas).includes(contextmenuTarget.id));
    }, 250);
  };
  messageBox.ontouchmove = function (event) {
    event.preventDefault();
    clearTimeout(to);
  };
  messageBox.ontouchend = function (event) {
    event.preventDefault();
    clearTimeout(to);
  };
  messageBox.oncontextmenu = function (event) {
    event.preventDefault();
    contextmenuTarget = messageBox;
    createContextMenu(event.pageX, event.pageY, Object.keys(datas).includes(contextmenuTarget.id));
  }
}

// Initialize
if (localStorage.getItem('CN-Chat/Username')) {
  username = localStorage.getItem('CN-Chat/Username');
} else {
  let container = document.createElement('div');
  container.id = 'name-container';
  let label = document.createElement('label');
  label.textContent = 'Enter your name:';
  label.htmlFor = 'name-input';
  let input = document.createElement('input');
  input.type = 'text';
  input.id = 'name-input';
  let okBtn = document.createElement('button');
  okBtn.textContent = 'OK';
  okBtn.id = 'ok-btn';
  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(okBtn);
  bg.appendChild(container);
  okBtn.onclick = function () {
    username = input.value.trim();
    if (username === '') {
      label.textContent = "Please enter a valid name:";
      return;
    } else if (username.length > 20) {
      label.textContent = "Name too long! Max 20 characters.";
      return;
    } else {
      localStorage.setItem('CN-Chat/Username', username);
      bg.innerHTML = '';
      location.reload();
    }
  }
}
function sendMessage() {
  let ts = Date.now();
  let data = {
    stat: "",
    id: ts,
    msg: messageInput.value,
    name: localStorage.getItem('CN-Chat/Username'),
    reply: reply || "",
  };
  datas[ts] = data;
  createMessage(data);
  uploadData('Messages/' + ts, data, function () { });
  messageInput.value = '';
  messageInput.style.height = 'auto';
  reply = "";
}
// Send message
// messageInput.onkeydown = function (event) {
//   if (event.key === 'Enter' && !event.shiftKey) {
//     event.preventDefault();
//     if (messageInput.value.trim() !== '') {
//       sendMessage();
//     }
//   }
// }
sendBtn.onclick = function () {
  if (messageInput.value.trim() !== '') {
    sendMessage();
  }
}
messageInput.oninput = function () {
  if (messageInput.value.trim() !== '') {
    sendBtn.disabled = false;
  } else {
    sendBtn.disabled = true;
  }
}

// Check online users
onlineCount.onclick = function () {
  let onlineUsers = Object.keys(onlines).filter(key => onlines[key] === "Online");
  let list = onlineUsers.map((user, idx) => `${idx + 1}. ${user}`).join("\n");
  alert("Online Users:\n" + list);
}

// Chat Messages scroll behavior
let showSpecialBtn = true;
chatMessages.onscroll = function () {
  if (chatMessages.scrollTop + chatMessages.clientHeight >= chatMessages.scrollHeight - 150) {
    specialBtn.style.display = 'none';
    showSpecialBtn = true;
  } else {
    if (showSpecialBtn) {
      specialBtn.style.display = 'block';
    }
  }
}
specialBtn.onclick = function () {
  showSpecialBtn = false;
  chatMessages.scrollTop = chatMessages.scrollHeight;
  specialBtn.style.display = 'none';
}

// Listen for data changes
if (localStorage.getItem('CN-Chat/Username')) {
  uploadData('Users/' + localStorage.getItem('CN-Chat/Username'), "Online", function () { });
  getData('Messages', function (data) {
    datas = data;
    bg.innerHTML = '';
    bg.style.display = 'none';
    for (let val of Object.values(data)) {
      createMessage(val);
      if (val.stat == "") {
        if (val.name == localStorage.getItem('CN-Chat/Username')) {
          document.getElementById(val.id + '.stat').textContent = 'Sent';
        } else {
          document.getElementById(val.id + '.stat').textContent = 'Seen';
          updateData('Messages/' + val.id, { stat: 'Seen' }, function () { });
        }
      } else {
        document.getElementById(val.id + '.stat').textContent = val.stat;
      }
    }
    starting = false;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatMessages.style.scrollBehavior = 'smooth';
  })
  onAdd('Messages', function (data) {
    if (!starting) {
      if (data.name != localStorage.getItem('CN-Chat/Username')) {
        createMessage(data);
        if (data.stat == "") {
          updateData('Messages/' + data.id, { stat: 'Seen' }, function () { });
        }
        datas[data.id] = data;
        playSound('./assets/notify.wav');
      } else {
        if (Object.keys(datas).includes(String(data.id)) == false) {
          createMessage(data);
        }
        document.getElementById(data.id + '.stat').textContent = 'Sent';
      }
      if (chatMessages.scrollTop + chatMessages.clientHeight <= chatMessages.scrollHeight - 150) {
        specialBtn.style.display = 'block';
      }
    }
  });
  onUpdate('Messages', function (data) {
    datas[data.id] = data;
    document.getElementById(data.id + '.stat').textContent = data.stat;
  });
  onDelete('Messages', function (data) {
    delete datas[data.id];
    document.getElementById(data.id).innerHTML = `<div class="message-content">This message has been unsent.</div>`;
  });
  onDisconnected('Users/' + localStorage.getItem('CN-Chat/Username'), "Offline");
  onChange('Users', function (data) {
    onlines = data;
    let num = 0;
    for (let key of Object.keys(onlines)) {
      if (onlines[key] === "Online") {
        num++;
      }
    }
    onlineCount.textContent = `Online Users: ${num}`;
  });
}

// Contextmenu
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});
document.addEventListener('click', () => {
  console.log("Click detected, hiding custom menu");
  customMenu.style.display = 'none';
});
customMenu.addEventListener('click', (event) => {
  if (event.target.tagName === 'LI') {
    customMenu.style.display = 'none';
    switch (event.target.value) {
      case 1:
        alert("Under development");
        break;
      case 2:
        navigator.clipboard.writeText(datas[contextmenuTarget.id]["msg"])
          .then(() => {
          })
          .catch((err) => {
          });
        break;
      case 3:
        deleteData('Messages/' + contextmenuTarget.id, function () { });
        break;
      case 4:
        alert("Under development");
        break;
    }
  }
});