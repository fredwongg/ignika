//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
    apiKey: "AIzaSyAeP0mIZv7syPdQDQf4tSklyW4xbR86Erg",
    authDomain: "ignika-79b0b.firebaseapp.com",
    databaseURL: "https://ignika-79b0b.firebaseio.com",
    projectId: "ignika-79b0b",
    storageBucket: "ignika-79b0b.appspot.com",
    messagingSenderId: "112520978396"
};
var app_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJXZWJjYW16QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFwcCIsImV4cCI6MTU3NTUyNjYwOSwiaXNzIjoiaHR0cDovL3d3dy5zZWN1cml0eS5vcmciLCJhdWQiOiJodHRwOi8vd3d3LnNlY3VyaXR5Lm9yZyJ9.ApvofMGzeZgG8PVPqViLWm69KA2db_Jv-N12mJspfyw";
firebase.initializeApp(config);
//stable build 0.3
var database = firebase.database();
var yourVideo = document.getElementById("yourVideo");
//var friendsVideo = document.getElementById("friendsVideo");
var yourId = Math.floor(Math.random() * 1000000000);
const servers = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
var myStream;
var lobbyId = 0;
var connection_list = [];
var user_list = [];
var logToken = null;
var parsedToken = null;

function createConnection(friendId) {
    let pc = new RTCPeerConnection(servers);
    let nodeId = getNodeId(friendId);
    //console.log(nodeId);
    createVideoFrame(friendId);
    createButton(user_list.length);
    pc.onicecandidate = (event => event.candidate ? sendMessage(friendId, yourId, JSON.stringify({ 'ice': event.candidate })) : console.log("Sent All Ice"));
    pc.onaddstream = (event => document.getElementById(friendId).srcObject = event.stream);
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
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
                .then(() => sendMessage(sender, yourId, JSON.stringify({ 'sdp': pc.localDescription })));
        else if (msg.sdp.type == "answer")
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
};


function showMyFace() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
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
            .then(offer => pc.setLocalDescription(offer))
            .then(() => sendMessage(workAround, yourId, JSON.stringify({ 'sdp': pc.localDescription })));
    }
    //console.log("catch");
}

function callFriend(id) {
    let pc = connection_list[id];
    //let nodeId = getNodeId(user_list[id]);
    //console.log("Show friends face " + nodeId + "try");
    workAround = user_list[id];
    pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => sendMessage(workAround, yourId, JSON.stringify({ 'sdp': pc.localDescription })));
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
        onclick: "callFriend(" + id + ")",
        class: "btn btn-info",
        text: "call"
    })
    button.appendTo($('#video_container'));
}



function cleanDb() {
    database.ref('lobby/' + lobbyId).remove();
}

function getId() {
    let url = window.location.href;
    console.log(url.split('#')[1]);
    return url.split('#')[1];
}


function pageLoad() {
    getId();
    getToken();
    let urlId = getId();
    let logToken = getToken();
    if (urlId) {
        //database = database.ref('lobby/'+ urlId);
        lobbyId = urlId;
        $("#reCAPTCHA_form").show();
    } else {
        if (!logToken) {
            $("#login_link").show();
        } else {
            //database = database.ref('lobby/'+ yourId);
            lobbyId = yourId;
            $("#get_link").show();
            $("#video_container").show();
            showMyFace();
            parsedToken = parseJwt(logToken);
            
            console.log(parsedToken);

        }
    }
    
    firebase.database().ref('/lobby/' + lobbyId + '/users/' + yourId).set(true);
    firebase.database().ref('/lobby/' + lobbyId + '/users/').on('child_added', function (snapshot) {
        //console.log(snapshot.key);
        if (snapshot.key != yourId) {
            //console.log("created:" + snapshot.key);
            createConnection(snapshot.key);
            postAjax(function(data){ console.log(data); });
        }
    });
}

function getLink() {
    let url = "https://fredwongg.github.io/ignika/#" + yourId;
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


function login() {
    window.location.href = "https://badgebookfront.azurewebsites.net/#/login/79f59896-fbdb-4c10-adae-29da10c510bc";
}

function submitreCAPTCHAForm() {
    var response = grecaptcha.getResponse();
    console.log(response.length);
    if(response.length == 0) {
        document.getElementById('g-recaptcha-error').innerHTML = '<span style="color:red;">This field is required.</span>';
        return false;
    }
    return true;
}

function verifyCaptcha() {
    console.log("verified");
    document.getElementById('g-recaptcha-error').innerHTML = '';
    $("#video_container").show();
    $("#reCAPTCHA_form").hide();
    showMyFace();
}

function getToken() {
    let url = window.location.href;
    return url.split('?t=')[1];
}

pageLoad();

window.onbeforeunload = function () {
    if (getId() == lobbyId) {
        cleanDb();
    }
}


function postAjax(success) {
    /*let data = {
        "UID": parsedToken['nameid'],
        "ImageURL": "https://lh5.ggpht.com/hyT1S5pScNMReR3JAMYU1g-j8kxSitvoO-PVFtEDNPxiWS_e9cdduOakHveY_rYcJbc",
        "BadgeName": "First time chatting",
        "BadgeDescription": "This badge is for users who successfully used the webcam app. Bonus karma included."
    }
    var params = typeof data == 'string' ? data : Object.keys(data).map(
            function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
        ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', "https://badgebookapi20181129125814.azurewebsites.net/api/badges");
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Authorization', 'Bearer ' + app_token);
    xhr.send(params);
    return xhr;*/
    var data = JSON.stringify({
        "UID": parsedToken['nameid'],
        "ImageURL": "https://lh5.ggpht.com/hyT1S5pScNMReR3JAMYU1g-j8kxSitvoO-PVFtEDNPxiWS_e9cdduOakHveY_rYcJbc",
        "BadgeName": "First time chatting",
        "BadgeDescription": "This badge is for users who successfully used the webcam app. Bonus karma included."
      });
      
      var xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      
      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          console.log(this.responseText);
        }
      });
      
      xhr.open("POST", "https://badgebookapi20181129125814.azurewebsites.net/api/badges");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJXZWJjYW16QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFwcCIsImV4cCI6MTU3NTUyNjYwOSwiaXNzIjoiaHR0cDovL3d3dy5zZWN1cml0eS5vcmciLCJhdWQiOiJodHRwOi8vd3d3LnNlY3VyaXR5Lm9yZyJ9.ApvofMGzeZgG8PVPqViLWm69KA2db_Jv-N12mJspfyw");
      xhr.setRequestHeader("Cache-Control", "no-cache");
      xhr.setRequestHeader("Postman-Token", "c3aad049-c389-4dab-ad97-1125f12b5881");
      
      xhr.send(data);
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

//createConnection();