showMyFace();

$("#nav_profile, #nav_auth, #nav_video, #nav_contacts, #nav_about, #nav_logout").each(function () {
    $(this).click(function () {
        hideAll();
        viewController($(this).attr('id'));// .attr('id')
    })
})

function pageLoad() {
    let url = getId();
    if (url.length > 2) {

    } else {
        
    }
}

function getId() {
    let url = window.location.pathname;
    return url.substring(url.lastIndexOf('/') + 1);
}