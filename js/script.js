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

var database;
var yourVideo = document.getElementById("yourVideo");
var friendsVideo = document.getElementById("friendsVideo");
var yourId = Math.floor(Math.random()*1000000000); // put firebase uid, huh?
//Create an account on Viagenie (http://numb.viagenie.ca/), and replace {'urls': 'turn:numb.viagenie.ca','credential': 'websitebeaver','username': 'websitebeaver@email.com'} with the information from your account
var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'beaver','username': 'webrtc.websitebeaver@gmail.com'}]};
var pc = new RTCPeerConnection(servers);
pc.onicecandidate = (event => event.candidate?sendMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc.onaddstream = (event => friendsVideo.srcObject = event.stream);

pageLoad();
function sendMessage(senderId, data) {
    var msg = database.push({ sender: senderId, message: data });
    msg.remove();
}

function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if (sender != yourId) {
        if (msg.ice != undefined)
            pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        else if (msg.sdp.type == "offer")
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc.createAnswer())
              .then(answer => pc.setLocalDescription(answer))
              .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
        else if (msg.sdp.type == "answer")
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
};


function showMyFace() {
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
    .then(stream => yourVideo.srcObject = stream)
    .then(stream => pc.addStream(stream));
}

function showFriendsFace() {
  pc.createOffer()
    .then(offer => pc.setLocalDescription(offer) )
    .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})) );
}

function listenTo(id) {
    database = firebase.database().ref('video/' + id);
    database.on('child_added', readMessage);
}

function getLink() {
    let url = "https://ignika.azurewebsites.net/#" + yourId;
    // show and attempt to copy to clipboard
    console.log(url);
}

function getId() {
    let url = window.location.href;
        return url.split('#')[1];
    ;
}  


function pageLoad() {
    let urlId = getId();
    showMyFace();
    if (urlId) {
        database = firebase.database().ref('video/' + urlId);
        database.on('child_added', readMessage);
        $("#start_chat").show();
    } else {
        database = firebase.database().ref('video/' + yourId);
        database.on('child_added', readMessage);
        $("#get_link").show();
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