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
    id: timestamp,
    seen: false
  });
  document.getElementById("message-input").value = "";
  document.getElementById("message-input").focus()
}
function sound(sound) {
  let aud = document.createElement("audio")
  aud.src = sound;
  aud.play();
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
  msg.id = "message"+messages.id;
  msg.value = JSON.stringify({id: messages.id, sender: messages.username})
  msg.style.padding = "10px"
  msg.style.color = "white"
  msg.style.borderRadius = "10px"
  if (messages.username == username) {
      div.style.textAlign = "right"
      msg.style.backgroundColor = "blue"
  } else {
      div.style.textAlign = "left"
      msg.style.backgroundColor = "grey"
      sound("assets/notify.wav")
      navigator.vibrate(150, 150, 150)
  }
  msg.innerHTML = messages.username + ": " + messages.message
  div.appendChild(msg)
  document.getElementById("chat").appendChild(div);
  document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight
  msg.onclick = function(val) {
    if (val.target.value != undefined && JSON.parse(val.target.value).sender == username) {
      if (confirm("Unsend this message?") == true) {
        let value = JSON.parse(val.target.value).id;
        firebase.database().ref('messages/'+value).remove()
        val.target.value = undefined;
      }
    }
  }
  if (messages.seen == true) {
    let seenElem = document.createElement("i")
    seenElem.innerHTML = "Seen"
    document.getElementById("message"+snapshot.val().id).appendChild(document.createElement("br"))
    document.getElementById("message"+snapshot.val().id).appendChild(seenElem)
  } else {
    if (messages.username != username) {
      db.ref("messages/" + messages.id).update({
        id: messages.id,
        username: messages.username,
        message: messages.message,
        seen: true
      })
    }
  }
});
fetchChat.on("child_removed", function (snapshot) {
  document.getElementById("message"+snapshot.val().id).innerHTML = "<i>"+snapshot.val().username+" unsent a message</i>"
});
fetchChat.on("child_changed", function (snapshot) {
  let seenElem = document.createElement("i")
  seenElem.innerHTML = "Seen"
  document.getElementById("message"+snapshot.val().id).appendChild(document.createElement("br"))
  document.getElementById("message"+snapshot.val().id).appendChild(seenElem)
})
//Notice
setTimeout(function() {
  let div = document.createElement("div")
  div.style.padding = "15px"
  let msg = document.createElement("div")
  msg.style.padding = "10px"
  msg.style.color = "white"
  msg.style.borderRadius = "10px"
  div.style.textAlign = "left"
  msg.style.backgroundColor = "grey"
  msg.innerHTML = "<i>[System]</i>:<br>Tips:<br>&nbsp;&nbsp;1. Click on the message you sent to unsend it<br>&nbsp;&nbsp;2. The message may be marked as seen, but the user may not have actually seen it, but loaded in background which made the message seen"
  div.appendChild(msg)
  document.getElementById("chat").appendChild(div);
  document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight
}, 3000)
//Online status
function getTime() {
  function str(int) {
    return(""+int)
  }
  let t = new Date()
  let year = t.getUTCFullYear()
  let month = t.getUTCMonth()  + 1;
  let date = t.getUTCDate()
  let hour = t.getUTCHours()
  let minute = t.getUTCMinutes()
  let second = t.getUTCSeconds()
  if (month < 10) {
    month = "0"+month
  }
  if (date < 10) {
    date = "0"+date
  }
  if (hour < 10) {
    hour = "0"+hour
  }
  if (minute < 10) {
    minute = "0"+minute
  }
  if (second < 10) {
    second = "0"+second
  }
  return(str(year)+str(month)+str(date)+str(hour)+str(minute)+str(second))
}
setInterval(function() {
  db.ref("user/" + username).set({
    ping: getTime()
  });
  firebase.database().ref().child("user").get().then((snapshot) => {
    if (snapshot.exists()) {
      let online = 0;
      for (o = 0; o < Object.keys(snapshot.val()).length; o++) {
        if (parseInt(Object.values(snapshot.val())[o].ping) >= parseInt(getTime()) - 5) {
          online += 1;
        } else {
          firebase.database().ref('user/'+Object.keys(snapshot.val())[o]).remove()
        }
      }
      document.getElementById("online").innerHTML = "Online: "+online
    }
  })
}, 3000)