//showMyFace();

$("#nav_profile, #nav_auth, #nav_video, #nav_contacts, #nav_about, #nav_logout").each(function () {
    $(this).click(function () {
        hideAll();
        viewController($(this).attr('id'));// .attr('id')
    })
})

function addFriend(email) {
    //var userId = firebase.auth().currentUser.uid;

    
    datas = firebase.database().ref('users').orderByChild('email').equalTo(email);
    datas.on('child_added', function(data) {
        console.log(data)
    })
    //console.log(data);
}