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
let edit = "";
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
  // Reply (if exists)
  if (data.reply != "" && Object.keys(datas).includes(data.reply)) {
    const replyDiv = document.createElement('div');
    replyDiv.onclick = function () {
      document.getElementById(data.reply)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    replyDiv.className = 'message-reply';
    replyDiv.id = data.id + '.reply';

    const authorSpan = document.createElement('span');
    authorSpan.className = 'reply-author';
    authorSpan.innerHTML = `<strong>Replied to: ${datas[data.reply].name}</strong>`;

    const contentSpan = document.createElement('span');
    contentSpan.className = 'reply-content';
    contentSpan.innerHTML = `<br>${(datas[data.reply].msg || '').replace(/\n/g, '<br>')}`;

    replyDiv.appendChild(authorSpan);
    replyDiv.appendChild(contentSpan);

    messageBox.appendChild(replyDiv);
  }
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
  // Message Edited
  const editedSpan = document.createElement('span');
  editedSpan.id = data.id + '.edited';
  editedSpan.className = 'message-time';
  editedSpan.textContent = 'Edited';
  editedSpan.style.display = 'none';
  if (data.edit) {
    editedSpan.style.display = 'block';
  }
  metaDiv.appendChild(editedSpan);
  messageBox.appendChild(metaDiv);
  // Message status
  const statusSpan = document.createElement('span');
  statusSpan.id = data.id + '.stat';
  statusSpan.className = 'message-time';
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
    id: ts,
    msg: messageInput.value,
    name: localStorage.getItem('CN-Chat/Username'),
    reply: reply || null,
  };
  datas[ts] = data;
  createMessage(data);
  uploadData('Messages/' + ts, data, function () { });
  messageInput.value = '';
  messageInput.style.height = 'auto';
  reply = "";
  messageInput.focus();
}
// Send message
sendBtn.onclick = function () {
  if (messageInput.value.trim() !== '' && edit == "") {
    sendMessage();
    cancelExtraBtn.click();
  } else {
    if (edit !== "") {
      let data = {
        msg: messageInput.value,
        edit: true
      };
      datas[edit] = true;
      updateData('Messages/' + edit, data, function () { });
      messageInput.value = '';
      reply = "";
      edit = "";
      cancelExtraBtn.click();
    }
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
      if (val.stat == null) {
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
        if (data.stat == null) {
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
    if (data.stat == null) {
      document.getElementById(data.id + '.stat').textContent = 'Sent';
    } else {
      document.getElementById(data.id + '.stat').textContent = data.stat;
    }
    if (data.edit) {
      document.getElementById(data.id + '.edited').style.display = 'block';
    }
    document.getElementById(data.id + '.msg').innerHTML = data.msg.replace('\n', '<br>');
  });
  onDelete('Messages', function (data) {
    const repliedMessages = Object.values(datas).filter(msg => msg.reply === data.id.toString());
    // Delete the replied div
    repliedMessages.forEach(msg => {
      // document.getElementById(msg.id + '.reply').remove();
      document.getElementById(msg.id + '.reply').textContent = `This message has been unsent.`;
    });
    delete datas[data.id];
    document.getElementById(data.id).innerHTML = `<div class="message-content">This message has been unsent.</div>`;
    if (contextmenuTarget.id == data.id) {
      customMenu.style.display = 'none';
      cancelExtraBtn.click();
    }
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
  customMenu.style.display = 'none';
});
customMenu.addEventListener('click', (event) => {
  if (event.target.tagName === 'LI') {
    customMenu.style.display = 'none';
    switch (event.target.value) {
      case 1:
        reply = contextmenuTarget.id;
        edit = "";
        extraArea.style.display = 'block';
        extraText.innerHTML = `Replying to ${datas[contextmenuTarget.id]["name"]}:<br>${datas[contextmenuTarget.id]["msg"].replaceAll("\n", "<br>")}`;
        messageInput.focus();
        break;
      case 2:
        navigator.clipboard.writeText(datas[contextmenuTarget.id]["msg"])
          .then(() => {
          })
          .catch((err) => {
          });
        break;
      case 3:
        bg.innerHTML = '';
        let container = document.createElement('div');
        container.id = 'name-container';
        let label = document.createElement('label');
        label.textContent = 'Are you sure you want to unsend the message?';
        let cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.id = 'cancel-btn';
        let okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.id = 'ok-btn';
        container.appendChild(label);
        container.appendChild(okBtn);
        container.appendChild(cancelBtn);
        bg.appendChild(container);
        okBtn.onclick = function () {
          deleteData('Messages/' + contextmenuTarget.id, function () { });
          bg.innerHTML = '';
          bg.style.display = 'none';
        }
        cancelBtn.onclick = function () {
          bg.innerHTML = '';
          bg.style.display = 'none';
        }
        bg.style.display = 'block';
        break;
      case 4:
        edit = contextmenuTarget.id;
        reply = "";
        messageInput.value = datas[contextmenuTarget.id]["msg"];
        extraArea.style.display = 'block';
        extraText.innerHTML = `Editing: ${datas[contextmenuTarget.id]["msg"].replaceAll("\n", "<br>")}`;
        messageInput.focus();
        break;
    }
  }
});

// Extra area
cancelExtraBtn.onclick = function () {
  extraArea.style.display = 'none';
  reply = "";
  if (edit !== "") {
    messageInput.value = "";
  }
  edit = "";
  extraText.innerHTML = '';
  messageInput.focus();
}