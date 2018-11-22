//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
    apiKey: "AIzaSyAeP0mIZv7syPdQDQf4tSklyW4xbR86Erg",
    authDomain: "ignika-79b0b.firebaseapp.com",
    databaseURL: "https://ignika-79b0b.firebaseio.com",
    projectId: "ignika-79b0b",
    storageBucket: "ignika-79b0b.appspot.com",
    messagingSenderId: "112520978396"
  };
firebase.initializeApp(config);
//stable build 0.3
var database = firebase.database();
var yourVideo = document.getElementById("yourVideo");
//var friendsVideo = document.getElementById("friendsVideo");
var yourId = Math.floor(Math.random()*1000000000);
const servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}]};
var myStream;
var lobbyId = 0;
var connection_list = [];
var user_list = [];



function createConnection(friendId) {
    let pc = new RTCPeerConnection(servers);
    let nodeId = getNodeId(friendId);
    //console.log(nodeId);
    createVideoFrame(friendId);
    createButton(user_list.length);
    pc.onicecandidate = (event => event.candidate?sendMessage(friendId, yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
    pc.onaddstream = (event => document.getElementById(friendId).srcObject = event.stream);
    navigator.mediaDevices.getUserMedia({audio:true, video:true})
    .then(stream => pc.addStream(stream));
    database.ref('/lobby/' + lobbyId + '/connections/' + nodeId).on('child_added', readMessage);
    user_list.push(friendId);
    connection_list.push(pc);
}

function sendMessage(friendId, senderId, data) {
    console.log(getNodeId(friendId) + "|" + data);
    var msg = database.ref('/lobby/' + lobbyId + '/connections/' + getNodeId(friendId)).push({ sender: senderId, message: data });
    msg.remove();
}

function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    //pc = getConnection(sender);
    pc = connection_list[user_list.indexOf("" + sender)];
    console.log("sender: " + sender);
    console.log("pc: " + pc);

    if (sender != yourId) {
        let nodeId = getNodeId(sender);
        //console.log("readMessage" + nodeId);
        if (msg.ice != undefined)
            pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        else if (msg.sdp.type == "offer")
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc.createAnswer())
              .then(answer => pc.setLocalDescription(answer))
              .then(() => sendMessage(sender, yourId, JSON.stringify({'sdp': pc.localDescription})));
        else if (msg.sdp.type == "answer")
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
};


function showMyFace() {
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
    .then(stream => yourVideo.srcObject = stream);
}

function showFriendsFace() {
    //console.log(user_list);
    var workAround;
    for (i = 0; i < user_list.length; i++) {
        console.log(user_list[i]);
        let pc = connection_list[i];
        let nodeId = getNodeId(user_list[i]);
        //console.log("Show friends face " + nodeId + "try");
        workAround = user_list[i];
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer) )
          .then(() => sendMessage(workAround, yourId, JSON.stringify({'sdp': pc.localDescription})) );
    }
    //console.log("catch");
}

function callFriend (id) {
    let pc = connection_list[id];
        //let nodeId = getNodeId(user_list[id]);
        //console.log("Show friends face " + nodeId + "try");
        workAround = user_list[id];
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer) )
          .then(() => sendMessage(workAround, yourId, JSON.stringify({'sdp': pc.localDescription})) );
}


function getNodeId(friendId) {
    //return 'xxx';
    if (yourId > friendId) {
        //console.log("" + friendId + yourId);
        return "" + friendId + yourId;
    } else {
        //console.log("" + yourId + friendId);
        return "" + yourId + friendId;
    }
}

function getConnection(friendId) {
    let x = user_list.indexOf(friendId);
    if (x >= 0) {
        return connection_list[x];
    }
}

function createVideoFrame(id) {
    var video = $('<video />', {
        id: id,
        autoplay: true
    });
    video.appendTo($('#video_container'));
    userVideo = document.getElementById(id);
    userVideo.setAttribute('autoplay', true);
    //return $("#" + id);
    //video.srcObject = src;
}

function createButton(id) {
    var button = $('<button />', {
        onclick : "callFriend("+id + ")",
        class : "btn btn-info",
        text: "call"
    })
    button.appendTo($('#video_container'));
}

showMyFace();
firebase.database().ref('/lobby/' + lobbyId +'/users/' + yourId).set(true);
firebase.database().ref('/lobby/' + lobbyId +'/users/').on('child_added', function (snapshot) {
    //console.log(snapshot.key);
    if (snapshot.key != yourId) {
        //console.log("created:" + snapshot.key);
        createConnection(snapshot.key);
    }

});

function cleanDb() {
    database.ref('/').remove();
}

function pageLoad() {
    let urlId = getId();
    showMyFace();
    if (urlId) {
        database = database.ref('lobby/'+ urlId);
    } else {
        database = database.ref('lobby/'+ yourId);
        $("#get_link").show();
    }
    database.on('child_added', readMessage);
}

function getLink() {
    let url = "https://ignika.azurewebsites.net/#" + yourId;
    // show and attempt to copy to clipboard
    var copyText = document.getElementById("myInput");
    copyText.value = url;
    /* Select the text field */
    copyText.select();
  
    /* Copy the text inside the text field */
    document.execCommand("copy");
  
    lobbyId = yourId;

    /* Alert the copied text */
    alert("Copied the text: " + copyText.value);
    console.log(url);

}

pageLoad();

onbeforeunload=function() {
    cleanDb();
}

//createConnection();