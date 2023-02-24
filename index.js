const firebaseConfig = {
  apiKey: "AIzaSyDkAhgKQNe7OaVT5P0wFg7h98rZT8v22Q0",
  authDomain: "cn-chat-7ac19.firebaseapp.com",
  projectId: "cn-chat-7ac19",
  storageBucket: "cn-chat-7ac19.appspot.com",
  messagingSenderId: "253710320513",
  appId: "1:253710320513:web:eeab710e0f93a3277f9e80",
  measurementId: "G-TVJ89QCVYC",
  databaseURL: "https://cn-chat-7ac19-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

var username 
if ("username" in localStorage == false) {
    username = prompt("Please Enter Your Name")
    localStorage.username = username
} else {
    username = localStorage.username
}
function send() {
  let timestamp = Date.now();
  db.ref("messages/" + timestamp).set({
    username: username,
    message: document.getElementById("message-input").value,
  });
  document.getElementById("message-input").value = "";
  document.getElementById("message-input").focus()
}
document.getElementById("message-btn").onclick = function() {
    send()
}
document.getElementById("message-input").onkeydown = function(key) {
    if (key.key == "Enter") {
        send()
    }
}
const fetchChat = db.ref("messages/");
fetchChat.on("child_added", function (snapshot) {
  let messages = snapshot.val();
  let div = document.createElement("div")
  div.style.padding = "15px"
  let msg = document.createElement("div")
  msg.style.padding = "10px"
  msg.style.color = "white"
  msg.style.borderRadius = "10px"
  if (messages.username == username) {
      div.style.textAlign = "right"
      msg.style.backgroundColor = "blue"
  } else {
      div.style.textAlign = "left"
      msg.style.backgroundColor = "grey"
  }
  msg.innerHTML = messages.username + ": " + messages.message
  
  // append the message on the page
  div.appendChild(msg)
  document.getElementById("chat").appendChild(div);
  document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight
});