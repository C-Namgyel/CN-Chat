// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getDatabase, ref, set, child, get, update, onChildAdded, onChildChanged, onChildRemoved, onDisconnect, onValue, query, orderByKey, limitToLast } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import { getStorage, ref as stRef, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-storage.js";
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
const storage = getStorage(app);

// Functions for Firebase Realtime Database
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
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
}
function onDelete(path, callback) {
  onChildRemoved(ref(database, path), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
}
function onUpdate(path, callback) {
  onChildChanged(ref(database, path), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
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
function getLimitedData(path, limit, callback) {
  const dataQuery = query(ref(database, path), orderByKey(), limitToLast(limit));

  return get(dataQuery)
    .then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (callback && typeof callback === "function") {
          callback(data);
        }
        return data;
      } else {
        return {};
      }
    })
    .catch(error => {
      console.error("Error fetching recent messages:", error);
      return {};
    });
}
// Functions for Firebase Storage
function uploadFile(path, file, onProgress, onComplete, onError) {
  const storageRef = stRef(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed',
    (snapshot) => {
      // Track progress
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    },
    (error) => {
      // Handle errors
      if (onError) onError(error);
    },
    () => {
      // Upload complete
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        onComplete(downloadURL);
      });
    }
  );
}
function deleteFile(filePath, onSuccess, onError) {
  const fileRef = stRef(storage, filePath);

  deleteObject(fileRef)
    .then(() => {
      onSuccess();
    })
    .catch((error) => {
      if (onError) onError(error);
    });
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
let limit = 50;
let fullData = false;
let firstVisibleMsg = null;
let foreground = true;
let bgData = [];

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
      if (datas[contextmenuTarget.id]["type"] == "img") {
        customMenuUl.innerHTML = `<li value="1">Reply</li>
            <li value="3">Unsend</li>`;
      } else {
        customMenuUl.innerHTML = `<li value="1">Reply</li>
            <li value="2">Copy</li>
            <li value="3">Unsend</li>
            <li value="4">Edit</li>`;
      }
    } else {
      if (datas[contextmenuTarget.id]["type"] == "img") {
        customMenuUl.innerHTML = `<li value="1">Reply</li>`;
      } else {
        customMenuUl.innerHTML = `<li value="1">Reply</li>
              <li value="2">Copy</li>`;
      }
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
  if (data.type == "img") {
    // Show a temporary placeholder while the image loads
    const placeholder = document.createElement('div');
    placeholder.className = 'img-placeholder';
    placeholder.style.width = '200px';
    placeholder.style.height = '200px';
    placeholder.style.aspectRatio = '1/1';
    placeholder.style.background = 'url("./assets/loading.webp") center center no-repeat';
    placeholder.style.backgroundSize = '25%';
    placeholder.style.display = 'block';
    placeholder.style.borderRadius = '8px';
    placeholder.style.margin = data.name == localStorage.getItem('CN-Chat/Username')
      ? '0 0 0 auto'
      : '0 auto 0 0';
    contentDiv.appendChild(placeholder);

    const img = document.createElement('img');
    img.src = data.msg;
    img.alt = 'Image';
    img.style.maxWidth = '50%';
    img.style.cursor = 'pointer';
    img.style.display = 'block';
    img.style.margin = data.name == localStorage.getItem('CN-Chat/Username')
      ? '0 0 0 auto'
      : '0 auto 0 0';

    img.onload = function () {
      placeholder.remove();
      contentDiv.appendChild(img);
    };
    img.onerror = function () {
      placeholder.textContent = "Failed to load image.";
      placeholder.style.background = "#eee";
    };
    img.onclick = function () {
      window.open(data.msg, '_blank');
    };
  } else {
    contentDiv.innerHTML = formatLink(data.msg);;
  }
  messageBox.appendChild(contentDiv);
  // Meta (time)
  const metaDiv = document.createElement('div');
  metaDiv.className = 'message-meta';
  const timeSpan = document.createElement('span');
  timeSpan.className = 'message-time';
  // Show current time for now (could be improved with server timestamp)
  const now = new Date(Number(data.id));
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
  messageBox.oncontextmenu = function (event) {
    event.preventDefault();
    contextmenuTarget = messageBox;
    createContextMenu(event.pageX, event.pageY, Object.keys(datas).includes(contextmenuTarget.id));
  }
}
function sendMessage() {
  let ts = Date.now();
  let data = {
    id: ts,
    msg: messageInput.value.trim(),
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
function checkState() {
  if (document.hidden) {
    foreground = false;
  } else if (document.hasFocus()) {
    foreground = true;
    for (let id of bgData) {
      if (Object.keys(datas).includes(id.toString())) {
        updateData('Messages/' + id, { stat: 'Seen' }, function () {
          bgData.splice(bgData.indexOf(id), 1);
        });
      }
    }
  } else {
    foreground = false;
  }
}
function formatLink(text) {
  const urlRegex = /((https?:\/\/|www\.)[^\s<]+)/gi;
  let msgHtml = (text || '').replace(/\n/g, '<br>');
  msgHtml = msgHtml.replace(urlRegex, function (url) {
    let href = url;
    if (!/^https?:\/\//i.test(url)) {
      href = 'http://' + url;
    }
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
  return msgHtml;
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
  if (chatMessages.scrollTop == 0) {
    if (fullData) {
      return;
    }
    limit += 50;
    getLimitedData('Messages', limit, function (data) {
      datas = data;
      if (Object.keys(datas).length < limit) {
        fullData = true;
      }
      bg.innerHTML = '';
      bg.style.display = 'none';
      chatMessages.innerHTML = '';
      if (!fullData) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-messages';
        loadingDiv.textContent = 'Loading more messages';
        chatMessages.appendChild(loadingDiv);
      }
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
      if (firstVisibleMsg && document.getElementById(firstVisibleMsg)) {
        chatMessages.style.scrollBehavior = 'auto';
        document.getElementById(firstVisibleMsg).scrollIntoView({ block: 'start' });
        setTimeout(() => {
          chatMessages.style.scrollBehavior = 'smooth';
        }, 0);
      } else {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
      firstVisibleMsg = Object.values(data)[0].id;
    });
  };
}
specialBtn.onclick = function () {
  showSpecialBtn = false;
  chatMessages.scrollTop = chatMessages.scrollHeight;
  specialBtn.style.display = 'none';
}

// Listen for data changes
if (localStorage.getItem('CN-Chat/Username')) {
  username = localStorage.getItem('CN-Chat/Username');
  uploadData('Users/' + localStorage.getItem('CN-Chat/Username'), "Online", function () { });
  getLimitedData('Messages', 50, function (data) {
    datas = data;
    if (Object.keys(datas).length < limit) {
      fullData = true;
    }
    bg.innerHTML = '';
    bg.style.display = 'none';
    if (!fullData) {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'loading-messages';
      loadingDiv.textContent = 'Loading more messages';
      chatMessages.appendChild(loadingDiv);
    }
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
    firstVisibleMsg = Object.values(data)[0].id;
    starting = false;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatMessages.style.scrollBehavior = 'smooth';
  })
  onAdd('Messages', function (data) {
    if (!starting) {
      if (data.name != localStorage.getItem('CN-Chat/Username')) {
        datas[data.id] = data;
        createMessage(data);
        if (data.stat == null) {
          if (foreground == true) {
            updateData('Messages/' + data.id, { stat: 'Seen' }, function () { });
          } else {
            bgData.push(data.id);
            updateData('Messages/' + data.id, { stat: 'Delivered' }, function () { });
          }
        }
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
    if (data.type != "img") {
      document.getElementById(data.id + '.msg').innerHTML = formatLink(data.msg.replace('\n', '<br>'));
    }
  });
  onDelete('Messages', function (data) {
    const repliedMessages = Object.values(datas).filter(msg => msg.reply === data.id.toString());
    repliedMessages.forEach(msg => {
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
  onChange('Users/', function (data) {
    onlines = data;
    let num = 0;
    for (let key of Object.keys(onlines)) {
      if (onlines[key] === "Online") {
        num++;
      }
    }
    onlineCount.textContent = `Online Users: ${num}`;
    if (onlines[localStorage.getItem('CN-Chat/Username')] == "Offline") {
      uploadData('Users/' + localStorage.getItem('CN-Chat/Username'), "Online", function () { });
    }
  });
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

// Contextmenu
document.addEventListener('contextmenu', (event) => {
  if (event.target.id != 'messageInput') {
    event.preventDefault();
  }
});
document.addEventListener('click', () => {
  customMenu.style.display = 'none';
});
customMenu.addEventListener('click', (event) => {
  if (event.target.tagName === 'LI') {
    customMenu.style.display = 'none';
    let scrollAmount = 0;
    switch (event.target.value) {
      case 1:
        reply = contextmenuTarget.id;
        edit = "";
        extraArea.style.display = 'block';
        extraText.innerHTML = `Replying to ${datas[contextmenuTarget.id]["name"]}:<br>${datas[contextmenuTarget.id]["msg"].replaceAll("\n", "<br>")}`;
        messageInput.focus();
        scrollAmount = extraArea.offsetHeight;
        chatMessages.scrollTop = Math.max(0, chatMessages.scrollTop + scrollAmount);
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
          let toDeleteData = datas[contextmenuTarget.id];
          deleteData('Messages/' + toDeleteData.id, function () {
            if (toDeleteData.type == "img") {
              deleteFile(toDeleteData.id + "/", function () { }, function (error) {
                console.error("Error deleting file:", error);
              });
            }
          });
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
        scrollAmount = extraArea.offsetHeight;
        chatMessages.scrollTop = Math.max(0, chatMessages.scrollTop + scrollAmount);
        break;
    }
  }
});

// File upload
function fileUploadFunction(file) {
  const ts = Date.now();
  if (file.size > 25 * 1024 * 1024) { // 10 MB limit
    alert("File size exceeds 10 MB limit.");
    return;
  }
  // Create a simple upload progress message box
  const progressDiv = document.createElement('div');
  progressDiv.id = ts + '.upload';
  progressDiv.className = 'message-box-self';
  progressDiv.textContent = `Uploading image: 0%`;
  chatMessages.appendChild(progressDiv);
  if (chatMessages.scrollTop + chatMessages.clientHeight >= chatMessages.scrollHeight - 150) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  uploadFile(ts + "/", file,
    (progress) => {
      document.getElementById(ts + ".upload").innerHTML = `Uploading image: ${Math.round(progress)}%`;
    },
    (downloadURL) => {
      document.getElementById(ts + ".upload").remove();
      let data = {
        id: ts,
        msg: downloadURL,
        name: localStorage.getItem('CN-Chat/Username'),
        reply: reply || null,
        type: "img"
      };
      datas[ts] = data;
      createMessage(data);
      uploadData('Messages/' + ts, data, function () { });
      messageInput.value = '';
      messageInput.style.height = 'auto';
      reply = "";
      messageInput.focus();
    },
    (error) => {
      console.error("Error uploading file:", error);
    }
  );
}
fileInput.oninput = (files) => {
  if (files.target.files.length > 0) {
    const file = files.target.files[0];
    fileUploadFunction(file);
  }
}
messageInput.addEventListener('paste', function (event) {
  const items = event.clipboardData.items;
  let handled = false;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const fileData = items[i].getAsFile();
      fileUploadFunction(fileData);
      handled = true;
      break;
    }
  }
  if (handled) {
    event.preventDefault(); // Only prevent default if an image was pasted
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

// Track focus changes
document.addEventListener("visibilitychange", checkState);
window.addEventListener("focus", checkState);
window.addEventListener("blur", checkState);

// Check for internt connectivity
function updateConnectionStatus(isOnline) {
  if (isOnline == true) {
    bg.style.display = 'none';
    bg.innerHTML = '';
  } else {
    bg.style.display = 'block';
    bg.innerHTML = '<div class="offline-message">You are offline. Please check your internet connection.</div>';
  }
}

window.addEventListener('online', () => updateConnectionStatus(true));
window.addEventListener('offline', () => updateConnectionStatus(false));

// Only enable Enter-to-send on desktop (not on phones/tablets)
function isDesktop() {
  return !/Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
}

if (isDesktop()) {
  messageInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendBtn.click();
    }
  });
}