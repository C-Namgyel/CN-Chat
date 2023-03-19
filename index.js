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
function askUsername() {
  let name = prompt("Please Enter Your Name")
  if (name.trim() == "") {
    askUsername()
  } else {
    localStorage.username = name
    username = name
  }
}
var username
if ("username" in localStorage == false || localStorage.username.trim() == "") {
  askUsername()
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
    type: "txtMessage"
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
function longPressed(val) {
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
        div.style.userSelect = "none"
        div.style.padding = "10px"
        animation(div, "floatIn", "0.5s")
        barrier.appendChild(div)
      if (JSON.parse(val.target.value).sender == username) {
        let unsend = document.createElement("button")
      unsend.innerHTML = "Unsend"
      unsend.value = val.target.value;
      unsend.className = "button"
      div.appendChild(unsend)
      unsend.onclick = function(unsender) {
        if (unsender.target.value != undefined && unsender.target.value != "undefined" && JSON.parse(unsender.target.value).sender == username) {
          if (confirm("Unsend this message?") == true) {
            let value = JSON.parse(unsender.target.value).id;
            firebase.database().ref('messages/'+value).remove()
            let storageRef = firebase.storage().ref();
            if (JSON.parse(unsender.target.value).type != "txtMessage") {
              let storageDel = storageRef.child(JSON.parse(unsender.target.value).sender+"/"+JSON.parse(unsender.target.value).fileName);
              storageDel.delete().then(() => {
              })
              unsender.target.value = undefined;
            }
          }
        }
        barrier.remove()
      }
      }
    let replyBtn = document.createElement("button")
    replyBtn.innerHTML = "Reply"
    replyBtn.value = val.target.value;
    replyBtn.className = "button"
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
  val.target.ontouchmove = function() {
      clearTimeout(longPress)
  }
  val.target.ontouchend = function() {
      clearTimeout(longPress)
  }
  }
function createMessage(messages, starting) {
  let div = document.createElement("div")
  div.style.userSelect = "none"
  div.style.padding = "15px"
  let msg = document.createElement("div")
  msg.id = "message"+messages.id;
  let msgType = ""
  if (messages.type == "txtMessage") {
    msgType = "txtMessage"
  } else {
    msgType = "file"
  }
  msg.value = JSON.stringify({id: messages.id, sender: messages.username, message: messages.message, fileName: messages.fileName, type: msgType})
  msg.style.padding = "10px"
  msg.style.color = "white"
  msg.style.borderRadius = "10px"
  if (messages.type == "txtMessage") {
    let isValidUrl = urlString=> {
	  	let urlPattern = new RegExp('^(https?:\\/\\/)?'+
	    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
	    '((\\d{1,3}\\.){3}\\d{1,3}))'+
	    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
	    '(\\?[;&a-z\\d%_.~+=-]*)?'+
	    '(\\#[-a-z\\d_]*)?$','i');
	    return !!urlPattern.test(urlString);
    }
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
      if (isValidUrl(messages.message) == false) {
        msg.innerHTML = messages.username + ":<br>" + censor(messages.message)
      } else {
        if (messages.message.slice(0, 2) == "ww") {
          msg.innerHTML = messages.username + ":<br><a href='https://"+messages.message+"' target='_blank' style='color: lightgrey'>" + censor(messages.message) + "</a>"
        } else {
          msg.innerHTML = messages.username + ":<br><a href='"+messages.message+"' target='_blank' style='color: lightgrey'>" + censor(messages.message) + "</a>"
        }
      }
    } else {
      if (document.getElementById("message"+messages.reply.id) != null) {
        if (isValidUrl(messages.message) == false) {
          msg.innerHTML = messages.username + " replied to " + messages.reply.to + ":<br><i>\"" + censor(messages.reply.message) + "\"</i><br>" + censor(messages.message)
        } else {
          if (messages.message.slice(0, 2) == "ww") {
            msg.innerHTML = messages.username + " replied to " + messages.reply.to + ":<br><i>\"" + censor(messages.reply.message) + "\"</i><br><a href='https://"+messages.message+"' target='_blank' style='color: lightgrey'>" + censor(messages.message) + "</a>"
          } else {
            msg.innerHTML = messages.username + " replied to " + messages.reply.to + ":<br><i>\"" + censor(messages.reply.message) + "\"</i><br><a href='"+messages.message+"' target='_blank' style='color: lightgrey'>" + censor(messages.message) + "</a>"
          }
        }
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
              if (isValidUrl(messages.message) == false) {
                document.getElementById("message"+thisMsg.id).innerHTML = thisMsg.username + ":<br>" + censor(messages.message)
              } else {
                if (messages.message.slice(0, 2) == "ww") {
                  document.getElementById("message"+thisMsg.id).innerHTML = thisMsg.username + ":<br><a href='https://"+messages.message+"' target='_blank' style='color: lightgrey'>" + censor(messages.message) + "</a>"
                } else {
                  document.getElementById("message"+thisMsg.id).innerHTML = thisMsg.username + ":<br><a href='"+messages.message+"' target='_blank' style='color: lightgrey'>" + censor(messages.message) + "</a>"
                }
              }
            }
        })
      } else {
        msg.innerHTML = messages.username + ":<br>" + messages.message
      }
    }
  } else {
    function isInViewport(element) {
        let conditionBottom = element.getBoundingClientRect().bottom <= document.getElementById("chat").getBoundingClientRect().height + document.getElementById("chat").getBoundingClientRect().top
        let conditionTop = element.getBoundingClientRect().top >= document.getElementById("chat").getBoundingClientRect().top
        if (conditionBottom == true && conditionTop == true) {
            return(true)
        } else {
            return(false)
        }
    }
    let imgHolder = document.createElement("div")
    imgHolder.style.width = "100%"
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
    msg.appendChild(imgHolder)
    imgHolder.value = msg.value;
    let imgLoading = document.createElement("label")
    imgLoading.innerHTML = "Loading "+messages.type;
    msg.appendChild(imgLoading)
    let img;
    if (messages.type == "image") {
      img = document.createElement("img")
    } else if (messages.type == "audio") {
      img = document.createElement("audio")
    } else if (messages.type == "video") {
      img = document.createElement("video")
      img.allowfullscreen = true
    } else {
      img = document.createElement("a")
    }
    img.style.width = "75%"
    if (messages.type == "image" || messages.type == "audio" || messages.type == "video") {
        function setSrc() {
            if (img.src == "" || img.src == undefined) {
                
                img.src = messages.message
                if (messages.type == "image") {
                    img.onclick = function(imgo) {
                        document.getElementById("imgPreview").style.width = "auto";
                        document.getElementById("imgPreview").style.height = "auto"
                        if (imgo.target.clientHeight - screen.height < imgo.target.clientWidth - screen.width) {
                            document.getElementById("imgPreview").style.width = "100%";
                            document.getElementById("imgPreview").style.height = "auto"
                        } else {
                            document.getElementById("imgPreview").style.width = "auto";
                            document.getElementById("imgPreview").style.height = "100%"
                        }
                        document.getElementById("vp").content = "width=device-width, initial-scale=1, user-scalable=yes"
                        document.getElementById("imgPreviewHolder").hidden = false;
                        document.getElementById("imgPreview").src = imgo.target.src;
                        document.getElementById("imgPreviewHolder").onclick = function() {
                            document.getElementById("imgPreviewHolder").hidden = true;
                            document.getElementById("vp").content = "width=device-width, initial-scale=1, user-scalable=no"
                        }
                    }
                }
            }
        }
        if (isInViewport(div) == true) {
                setSrc()
        }
        document.getElementById("chat").addEventListener('scroll', function() {
            if (isInViewport(div) == true) {
                setSrc()
                console.log("load")
            }
        })
      if (messages.type == "audio" || messages.type == "video") {
        img.oncanplaythrough = function() {
          imgHolder.appendChild(img)
          imgLoading.remove()
          img.controls = true;
        }
      } else {
        img.onload = function() {
          imgHolder.appendChild(img)
          imgLoading.remove()
        }
      }
    } else {
      msg.appendChild(img)
      imgLoading.remove()
      img.style.color = "lightgrey"
      img.href = messages.message;
      img.innerHTML = messages.fileName;
    }
  }
  let scrollable = (Math.abs(document.getElementById("chat").scrollHeight - document.getElementById("chat").scrollTop - document.getElementById("chat").clientHeight))
  div.appendChild(msg)
  document.getElementById("chat").appendChild(div);
  if (scrollable < 100) {
    document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight
  }
  msg.ontouchstart = function(func) {
      longPressed(func)
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
  document.getElementById("message-input").style.width = "85%";
  document.getElementById("message-btn").hidden = true;
}
document.getElementById("message-input").onkeydown = function(key) {
  setTimeout(function() {
    if (document.getElementById("message-input").value.trim() == "") {
      document.getElementById("message-input").style.width = "85%";
      document.getElementById("message-btn").hidden = true;
    } else {
      document.getElementById("message-input").style.width = "65%";
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
  document.getElementById("chat").innerHTML = ""
  if (snapshot.exists()) {
    for (r = 0; r < Object.keys(snapshot.val()).length; r++) {
      createMessage(Object.values(snapshot.val())[r], starting);
    }
  }
  starting = false
  //Notify
  let div = document.createElement("div")
  div.style.userSelect = "none"
  div.style.padding = "15px"
  div.id="systemMsg"
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
&nbsp;&nbsp;3. Click on the message with reply to jump to the replied message<br>
&nbsp;&nbsp;4. Type a link and send it. When users click the link, the link will open<br>
&nbsp;&nbsp;5. You can now send images, videos, audios, and files by clicking the button beside the message input<br>
&nbsp;&nbsp;6. Click on the online count to know who all are currently online or who all are typing`
  div.appendChild(msg)
  document.getElementById("chat").appendChild(div);
  document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight
  document.getElementById("chat").style.scrollBehavior = "smooth"
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
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
var online = []
var onlineStat = db.ref("online/"+username)
onlineStat.set('online');
onlineStat.onDisconnect().set('offline');
db.ref("online/").on('value', function(snapshot) {
  if (snapshot.val()) {
    online = []
    for (let ons in snapshot.val()) {
        online.push({name: ons, status: snapshot.val()[ons]});
    }
    online.sort(dynamicSort("-status"));
    let lab = "Online: "+online.filter(word => word.status == "online" || word.status == "typing...").length;
    if (online.filter(word => word.status == "typing...").length != 0) {
      lab += "<br>Typing: " + online.filter(word => word.status == "typing...").length
    }
    document.getElementById("online").innerHTML = lab;
  }
});
document.onIdle = function () {
  onlineStat.set('idle');
}
document.onAway = function () {
  onlineStat.set('away');
}
document.onBack = function (isIdle, isAway) {
  onlineStat.set('online');
}
document.getElementById("online").onclick = function() {
    let onlines = ""
    for (let on = 0; on < online.length; on++) {
        onlines += (on + 1) + ". " + online[on].name + ": " + online[on].status + "\n"
    }
    alert(onlines)
}
//Image Send
document.getElementById("file").oninput = function() {
    let file = document.getElementById("file").files[0]
    let filename = file.name;
    let storageRef = firebase.storage().ref();
    let imageRef = storageRef.child(username + "/" + filename);
    let uploadTask = imageRef.put(file)
    let div = document.createElement("div")
    div.style.userSelect = "none"
    div.style.padding = "15px"
    let msg;
    msg = document.createElement("div")
    msg.style.padding = "10px"
    msg.style.color = "white"
    msg.style.borderRadius = "10px"
    div.style.textAlign = "right"
    msg.style.backgroundColor = "blue"
    msg.innerHTML = "Sending File..."
    let scrollable = (Math.abs(document.getElementById("chat").scrollHeight - document.getElementById("chat").scrollTop - document.getElementById("chat").clientHeight))
    div.appendChild(msg)
    document.getElementById("chat").appendChild(div);
    if (scrollable < 100) {
      document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight
    }
    uploadTask.on('state_changed', (snapshot) => {
      let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      msg.innerHTML = filename + "<br>" + (parseFloat(snapshot.bytesTransferred) / 1048576).toFixed(2) + "mb /" + (parseFloat(snapshot.totalBytes) / 1048576).toFixed(2) + "mb<br>" + parseFloat(progress).toFixed(2) + "%";
    },(error) => {
      alert("Upload Failed")
      console.log(error)
      div.remove()
      // Handle unsuccessful uploads
    }, () => {
      div.remove()
      imageRef.getDownloadURL().then((Url) => {
        let timestamp = Date.now();
        db.ref("messages/" + timestamp).set({
            username: username,
            message: Url,
            id: timestamp,
            reply: reply,
            seen: false,
            fileName: filename,
            type: file.type.split("/")[0]
        });
      })
    }
  );

}
//Typing
var typing = false;
let typingTime = undefined;
document.getElementById("message-input").onkeydown = function() {
  if (typingTime != undefined) {
    clearTimeout(typingTime)
  }
  if (typing == false) {
    db.ref("online/" + username).set("typing...");
  }
  typing = true;
  typingTime = setTimeout(function() {
    typing = false;
    db.ref("online/" + username).set("online");
    typingTime = undefined
  }, 1000)
}