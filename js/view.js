function hideAll() {
    $("#profile_container,#auth_container,#video_container,#contacts_container,#about_container").each(function () {
        $(this).hide();
    });
}

function hideMenu() {
    $("#nav_profile, #nav_auth, #nav_video, #nav_contacts, #nav_about, #nav_logout").each(function () {
        $(this).hide();
    });
}

function guestMenuView() {
    hideMenu();
    $("#nav_auth, #nav_about").each(function () {
        $(this).show();
    });
}

function userMenuView() {
    hideMenu();
    $("#nav_profile, #nav_video, #nav_contacts, #nav_about, #nav_logout").each(function () {
        $(this).show();
    });
}

function viewController(vPath) {
    hideAll();
    switch (vPath) {
        case "nav_profile":
            $("#profile_container").show();
            break;
        case "nav_auth":
            $("#auth_container").show();
            break;
        case "nav_video":
            $("#video_container").show();
            break;
        case "nav_contacts":
            $("#contacts_container").show();
            break;
        case "nav_about":
            $("#about_container").show();
            break;
        case "nav_logout":
            // logout, 
            logOut();
            $("#auth_container").show();
            break;
        default:
            $("#about_container").show();
    }
}