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
const servers = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }, { 'urls': 'turn:numb.viagenie.ca', 'credential': 'beaver', 'username': 'webrtc.websitebeaver@gmail.com' }] };

var userVideo;
var yourVideo = document.getElementById("yourVideo");
var lobbyId = 0;
var friendsVideo = document.getElementById("friendsVideo");
var yourId = Math.floor(Math.random() * 1000000000); // put firebase uid, huh?

var connection_list = [];
var user_list = [];


var yourStream;
pageLoad();
function createConnection(friendId) {
    var pc = new RTCPeerConnection(servers);
    pc.onicecandidate = (event => event.candidate ? sendMessage(getNodeId(friendId), yourId, JSON.stringify({ 'ice': event.candidate })) : console.log("Sent All Ice"));
    console.log("createConnection");
    pc.onaddstream = (event => document.getElementById("v0" + user_list.indexOf[friendId]).srcObject = event.stream);
    pc.oniceconnectionstatechange = function () {
        if (pc.iceConnectionState == 'disconnected') {
            console.log('Disconnected');
        }
    }
    pc.addStream(yourStream);
    firebase.database().ref('/lobby/' + lobbyId + '/connections/' + getNodeId(friendId)).on('child_added', readMessage);
    connection_list.push(pc);
    user_list.push(friendId);
}

function getConnection(friendId) {
    let x = user_list.indexOf(friendId);
    if (x >= 0) {
        return connection_list[x];
    }
}

firebase.database().ref('/lobby/' + lobbyId +'/users/' + yourId).set(true);
firebase.database().ref('/lobby/' + lobbyId +'/users/').on('child_added', function (snapshot) {
    console.log(snapshot.key);
    if (snapshot.key != yourId) {
        createConnection(snapshot.key);
    }

});

function getNodeId(friendId) {
    if (yourId > friendId) {
        return "" + friendId + yourId;
    } else {
        return "" + yourId + friendId;
    }
}

function callFriends() {
    
    for (i = 0; i < user_list.length; i++) {
        console.log("called a friend: " + user_list[i]);
        callFriend(user_list[i]);
    }
}

window.onbeforeunload = function () {
    firebase.database().ref('/lobby/' + lobbyId + '/users/' + yourId).remove();
}

$('#start_chat').show();

function sendMessage(nodeId, senderId, data) {
    console.log(nodeId);
    firebase.database().ref('/lobby/' + lobbyId + '/connections/' + nodeId).push({ sender: senderId, message: data });
    //firebase.database().ref('/lobby/' + lobbyId + '/connections/' + nodeId).remove();
}

function readMessage(data) {
    //console.log(data);
    let msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if (sender != yourId) {
        let pc = getConnection(sender);
        if (msg.ice != undefined) {
            console.log("got candidate");
            pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type == "offer") {
            console.log("got offer");
            console.log(msg.sdp);
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
                .then(() => pc.createAnswer())
                .then(answer => pc.setLocalDescription(answer))
                .then(() => sendMessage(getNodeId(sender), yourId, JSON.stringify({ 'sdp': pc.localDescription })));
        }
        else if (msg.sdp.type == "answer") {
            console.log("got answer");
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
};

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

function showMyFace() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => yourVideo.srcObject = stream)
        .then(stream => yourStream = stream);
}

function callFriend(friendId) {
    let pc = getConnection(friendId);
    console.log("called friend: " + friendId);
    pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => sendMessage(getNodeId(friendId), yourId, JSON.stringify({ 'sdp': pc.localDescription })));
}



function getLink() {
    let url = "https://ignika.azurewebsites.net/#" + yourId;
    // show and attempt to copy to clipboard
    console.log(url);
}

function getId() {
    let url = window.location.href;
    return url.split('#')[1];
}


function pageLoad() {
    let urlId = getId();
    showMyFace();
    if (urlId) {
        // $("#start_chat").show();
    } else {
        //$("#get_link").show();
    }
}

function copyLink() {
    const copyToClipboard = getLink => {
        const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };
}



//showMyFace();
