//Firebase Setup
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
//Username
var username
if ("username" in localStorage == false) {
  username = prompt("Please Enter Your Name")
  localStorage.username = username
} else {
  username = localStorage.username
}
//Functions
function send(message, reply) {
  let timestamp = Date.now();
  db.ref("messages/" + timestamp).set({
    username: username,
    message: message,
    id: timestamp,
    reply: reply,
    seen: false,
    type: "text"
  });
}
function sound(sound) {
  let aud = document.createElement("audio")
  aud.src = sound;
  aud.play();
}
function animation(elem, animationName, duration) {
  elem.style.animationName=animationName;
  elem.style.animationDuration=duration
  elem.style.animationFillMode="forwards"
}
function findIndexes(arr, val) {
    let indexes = [];
    for (let i = 0; i <= arr.lastIndexOf(val); i++) {
        indexes.push(arr.indexOf(val, i))
        i = arr.indexOf(val, i)
    }
    return(indexes)
}
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}
function censor(txt) {
    let censorer = ["fuck", "dick", "pussy", "bitch"];
    let includes = false;
    let newTxt = txt;
    for (let c = 0; c < censorer.length; c++) {
        if (txt.toLowerCase().includes(censorer[c]) == true) {
            for (let e = 0; e < findIndexes(txt.toLowerCase(), censorer[c]).length; e++) {
                for (let n = 0; n < censorer[c].length; n++) {
                    newTxt = newTxt.replaceAt(parseInt(findIndexes(txt.toLowerCase(), censorer[c])[e]) + n, "*")
                }
            }
        }
    }
    return(newTxt)
}
function createMessage(messages, starting) {
  let div = document.createElement("div")
  div.style.userSelect = "none"
  div.style.padding = "15px"
  let msg;
  if (messages.type == "text") {
    console.log("text")
  msg = document.createElement("div")
  msg.id = "message"+messages.id;
  msg.value = JSON.stringify({id: messages.id, sender: messages.username, message: messages.message})
  msg.style.padding = "10px"
  msg.style.color = "white"
  msg.style.borderRadius = "10px"
  if (messages.username == username) {
      div.style.textAlign = "right"
      msg.style.backgroundColor = "blue"
  } else {
      div.style.textAlign = "left"
      msg.style.backgroundColor = "grey"
      if (starting == false) {
        sound("assets/notify.wav")
        navigator.vibrate(150, 150, 150)
      }
  }
  if (messages.reply == "")  {
    msg.innerHTML = messages.username + ":<br>" + censor(messages.message)
  } else {
    if (document.getElementById("message"+messages.reply.id) != null) {
      msg.innerHTML = messages.username + " replied to " + messages.reply.to + ":<br><i>\"" + censor(messages.reply.message) + "\"</i><br>" + censor(messages.message)
      msg.onclick = function show() {
          document.getElementById("message"+messages.reply.id).scrollIntoView(false)
          let bgc = document.getElementById("message"+messages.reply.id).style.backgroundColor;
          if (bgc == "blue") {
            document.getElementById("message"+messages.reply.id).style.backgroundColor = "cyan"
          } else {
              document.getElementById("message"+messages.reply.id).style.backgroundColor = "lightgray"
          }
          let bgres = setTimeout(function() {
              document.getElementById("message"+messages.reply.id).style.backgroundColor = bgc
          }, 1000)
          msg.onclick = function() {
              document.getElementById("message"+messages.reply.id).style.backgroundColor = bgc;
              clearTimeout(bgres)
              show()
          }
      }
      let thisMsg = messages
      db.ref("messages/").on("child_removed", function (snapshot) {
          if (snapshot.val().id == thisMsg.reply.id) {
              document.getElementById("message"+thisMsg.id).innerHTML = thisMsg.username + ":<br>" + censor(messages.message)
          }
      })
    } else {
      msg.innerHTML = messages.username + ":<br>" + messages.message
    }
  }
  } else {
      console.log("else")
  msg = document.createElement("div")
  msg.id = "message"+messages.id;
  msg.value = JSON.stringify({id: messages.id, sender: messages.username, message: messages.message})
  msg.style.padding = "10px"
  msg.style.color = "white"
  msg.style.borderRadius = "10px"
  msg.innerHTML = messages.username + ":"
  if (messages.username == username) {
      div.style.textAlign = "right"
      msg.style.backgroundColor = "blue"
  } else {
      div.style.textAlign = "left"
      msg.style.backgroundColor = "grey"
      if (starting == false) {
        sound("assets/notify.wav")
        navigator.vibrate(150, 150, 150)
      }
  }
  msg.appendChild(document.createElement("br"));
  let imgLoading = document.createElement("label")
  imgLoading.innerHTML = "Loading Image";
  msg.appendChild(imgLoading)
  let img = document.createElement("img")
  img.style.width = "90%"
  img.src = messages.message
  img.onload = function() {
      msg.appendChild(img)
      imgLoading.remove()
  }
  }
  let scrollable = (Math.abs(document.getElementById("chat").scrollHeight - document.getElementById("chat").scrollTop - document.getElementById("chat").clientHeight))
  div.appendChild(msg)
  document.getElementById("chat").appendChild(div);
  if (scrollable < 100) {
    document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight
  }
  msg.ontouchstart = function(val) {
    let longPress = setTimeout(function() {
    if (val.target.value != undefined) {
        let barrier = document.createElement("div")
        barrier.style.position = "fixed"
        barrier.style.width = "100%"
        barrier.style.height = "100%"
        barrier.style.left = "0px"
        barrier.style.top = "0px"
        barrier.style.zIndex = 1;
        document.body.appendChild(barrier)
        let div = document.createElement("div")
        div.style.position = "fixed"
        div.style.width = "100%"
        div.style.left = "0px"
        div.style.bottom = "0%"
        div.style.zIndex = 2;
        div.style.backgroundColor = "black"
        div.style.textAlign = "center"
        animation(div, "floatIn", "0.5s")
        barrier.appendChild(div)
      if (JSON.parse(val.target.value).sender == username) {
      let unsend = document.createElement("button")
      unsend.innerHTML = "Unsend"
      unsend.value = val.target.value;
      div.appendChild(unsend)
      unsend.onclick = function(unsender) {
        if (unsender.target.value != undefined && unsender.target.value != "undefined" && JSON.parse(unsender.target.value).sender == username) {
          if (confirm("Unsend this message?") == true) {
            let value = JSON.parse(unsender.target.value).id;
            firebase.database().ref('messages/'+value).remove()
            unsender.target.value = undefined;
          }
        }
        barrier.remove()
      }
      }
    let replyBtn = document.createElement("button")
    replyBtn.innerHTML = "Reply"
    replyBtn.value = val.target.value;
    div.appendChild(replyBtn)
    replyBtn.onclick = function(replyer) {
      let data = JSON.parse(replyer.target.value)
      reply = {
        id: data.id,
        to: data.sender,
        message: data.message
      }
      barrier.remove()
      document.getElementById("message-input").focus()
      document.getElementById("replyDiv").hidden = false;
      document.getElementById("replyTxt").innerHTML = "Replying to " + data.sender + "<br><i>" + censor(data.message) + "</i>"
    }
    barrier.onclick = function() {
      barrier.remove()
    }
    }
  }, 500)
  msg.ontouchmove = function(mov) {
      clearTimeout(longPress)
  }
  val.target.ontouchend = function() {
      clearTimeout(longPress)
  }
  }
  if (messages.seen == true) {
    let seenElem = document.createElement("img")
    seenElem.src = "assets/msgSeen.png"
    seenElem.style.height = "15px"
    document.getElementById("message"+messages.id).appendChild(document.createElement("br"))
    document.getElementById("message"+messages.id).appendChild(seenElem)
  } else {
    if (messages.username != username) {
      db.ref("messages/" + messages.id).update({
        id: messages.id,
        username: messages.username,
        message: messages.message,
        reply: messages.reply,
        seen: true
      })
    }
  }
}
//Dealing with messages and GUIs
var reply = "";
document.getElementById("message-btn").onclick = function() {
  send(document.getElementById("message-input").value, reply)
  document.getElementById("message-input").value = "";
  document.getElementById("message-input").focus()
  reply = "";
  document.getElementById("replyDiv").hidden = true;
  document.getElementById("message-input").style.width = "75%";
  document.getElementById("message-btn").hidden = true;
}
document.getElementById("message-input").onkeydown = function(key) {
  setTimeout(function() {
    if (document.getElementById("message-input").value.trim() == "") {
      document.getElementById("message-input").style.width = "75%";
      document.getElementById("message-btn").hidden = true;
    } else {
      document.getElementById("message-input").style.width = "55%";
      document.getElementById("message-btn").hidden = false;
    }
  }, 1)
  if (key.key == "Enter" && document.getElementById("message-btn").hidden == false) {
    send(document.getElementById("message-input").value, reply)
    document.getElementById("message-input").value = "";
    document.getElementById("message-input").focus()
    reply = "";
    document.getElementById("replyDiv").hidden = true;
    document.getElementById("message-input").style.width = "75%";
    document.getElementById("message-btn").hidden = true;
  }
}
document.getElementById("replyClose").onclick = function() {
    reply = "";
    document.getElementById("replyDiv").hidden = true;
}
//Messages
var starting = true;
firebase.database().ref().child("messages/").get().then((snapshot) => {
  if (snapshot.exists()) {
    for (r = 0; r < Object.keys(snapshot.val()).length; r++) {
      createMessage(Object.values(snapshot.val())[r], starting);
    }
  }
  starting = false
  document.getElementById("chat").style.scrollBehavior = "smooth"
  //Notify
  let div = document.createElement("div")
  div.style.userSelect = "none"
  div.style.padding = "15px"
  let msg = document.createElement("div")
  msg.style.padding = "10px"
  msg.style.color = "white"
  msg.style.borderRadius = "10px"
  div.style.textAlign = "left"
  msg.style.backgroundColor = "grey"
  msg.innerHTML = `<i>[System]</i>:<br>
Tips:<br>
&nbsp;&nbsp;1. Long press on the message to unsend it or to reply to the message<br>
&nbsp;&nbsp;2. The message may be marked as seen, but the user may not have actually seen it, but loaded in background which made the message seen<br>
&nbsp;&nbsp;3. Click on the message with reply to jump to the replied message`
  div.appendChild(msg)
  document.getElementById("chat").appendChild(div);
  document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight
}).catch((error) => {
  console.error(error);
});
//Handles changes in db
const fetchChat = db.ref("messages/");
fetchChat.on("child_added", function (snapshot) {
  if (starting == false) {
    let messages = snapshot.val();
    createMessage(messages, starting)
  }
});
fetchChat.on("child_removed", function (snapshot) {
  document.getElementById("message"+snapshot.val().id).innerHTML = "<i>"+snapshot.val().username+" unsent a message</i>"
  document.getElementById("message"+snapshot.val().id).value = undefined
});
fetchChat.on("child_changed", function (snapshot) {
  let seenElem = document.createElement("img")
  seenElem.src = "assets/msgSeen.png"
  seenElem.style.height = "15px"
  document.getElementById("message"+snapshot.val().id).appendChild(document.createElement("br"))
  document.getElementById("message"+snapshot.val().id).appendChild(seenElem)
})
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
var userPings = {}
setInterval(function() {
  db.ref("user/" + username).set({
    user: username,
    ping: getTime()
  });
  for (o = 0; o < Object.keys(userPings).length; o++) {
    userPings[Object.keys(userPings)[o]] = parseInt(userPings[Object.keys(userPings)[o]]) - 1 ;
    if (userPings[Object.keys(userPings)[o]] < 0) {
      Reflect.deleteProperty(userPings, Object.keys(userPings)[o]);
    }
  }
  document.getElementById("online").innerHTML = "Online: "+Object.keys(userPings).length;
}, 1000)
db.ref("user/").on("child_changed", function (snapshot) {
  userPings[snapshot.val().user] = 5;
})
//Image Send
document.getElementById("file").oninput = function() {
    alert("Sending Image")
    let file = document.getElementById("file").files[0]
    let storageRef = firebase.storage().ref();
    let imageRef = storageRef.child(file.name);
    imageRef.put(file).then((snapshot) => {
        imageRef.getDownloadURL().then((Url) => {
            let timestamp = Date.now();
            db.ref("messages/" + timestamp).set({
                username: username,
                message: Url,
                id: timestamp,
                reply: reply,
                seen: false,
                type: "image"
            });
        })
    });
}