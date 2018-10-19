firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        userMenuView();
        $("#nav_profile").click();
        var displayName = user.displayName;
        var email = user.email;
        var uid = user.uid;
        
        console.log("you logged in");
    } else {
        // User is signed out.
        guestMenuView();
        
    }
});

var database = firebase.database().ref();

function writeUserData(userId, email) {
    firebase.database().ref('users/' + userId).set({
      email : email
    });
  }


// registration block
// ################################################################
function registerUser(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(errorMessage);
    }).then(function() {
        var user = firebase.auth().currentUser;
        if (user != null) {
            writeUserData(user.uid, user.email);
        }
    });
}

function processRegisterForm(e) {
    if (e.preventDefault) e.preventDefault();
    var remail = $("#r_email").val();
    var rpwd = $("#r_pwd").val();
    var rrpwd = $("#rr_pwd").val();
    /* do what you want with the form */
    
    registerUser(remail, rpwd);
    
    // You must return false to prevent the default form behavior
    return false;
}

var register_form = document.getElementById('register_form');
if (register_form.attachEvent) {
    register_form.attachEvent("submit", processRegisterForm);
} else {
    register_form.addEventListener("submit", processRegisterForm);
}
// ################################################################

// login block 
// ################################################################
function loginUser(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(errorMessage);
    });
}

function processLoginForm(e) {
    if (e.preventDefault) e.preventDefault();
    var lemail = $("#l_email").val();
    var lpwd = $("#l_pwd").val();
    /* do what you want with the form */
    loginUser(lemail, lpwd);
    // You must return false to prevent the default form behavior
    return false;
}

var login_form = document.getElementById('login_form');
if (login_form.attachEvent) {
    login_form.attachEvent("submit", processLoginForm);
} else {
    login_form.addEventListener("submit", processLoginForm);
}

// signout block
// 
function logOut () {
    firebase.auth().signOut().then(function() {
        //alert('Signed Out');
      }, function(error) {
        //alert('Sign Out Error', error);
      });
}
