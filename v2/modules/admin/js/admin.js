var countdown = 0;
var timer;

function initLoginChecks() {
    $('#login form').submit( function(e) {

        if (countdown == 0) {

            $.post('/admin', $('#login form').serialize(), function(data) {

                var code;

                if ($(data).length != 0) {
                    code = $(data)[0].nodeName.toLowerCase();
                } else {
                    code = "";
                }

                if (code == "error") {
                    $('#login').effect("shake", {times: 3}, 95);

                    if ( $('#login .err').length == 0 ) {
                        $('#login .ok').attr("class", "err");
                    }

                    $('#login .err').text("");
                    $('#login .err').append("Wrong username or password. Login disabled for <span id=\"timer\">" + $(data)[0].id + "</span> seconds");
                    countdown = $(data)[0].id;

                    timer = setInterval(function () {
                        if (countdown == 0) {
                            clearInterval(timer);
                            $("#timer").text(countdown);

                            $('#login .err').text("You may try again");
                            $('#login .err').attr("class", "ok");
                        } else {
                            countdown = countdown - 1;
                            $("#timer").text(countdown);
                        }
                    }, 1000);

                } else if (code == "success") {
                    $(window.location).attr('href', '/admin/overview');
                }
            });
        }

        return e.preventDefault();
    });
}

function formCheck() {
    //Validate inputs first
    var allOk = true;

    //Get input values
    var username = $('#login #username').val().trim();
    var password = $('#login #password').val();

    //Perform checking
    if ( username.length == 0 ) {
        allOk = false;
        $('#login .err').text("Username missing");
    }

    if ( password.length == 0 ) {
        allOk = false;
        $('#login .err').text("Password missing");
    }

    if ( username.length == 0 && password.length == 0 ) {
        allOk = false;
        $('#login .err').text("Username and Password missing");
    }

    //if (allOk) return initLoginChecks();
    //else return false;
    if (!allOk) {
        $('#login').effect("shake", {times: 3}, 95);
    }

    return allOk;
}

$(document).ready(function() {
    if ( $('#login').length > 0)  {
        $("#login #username").focus();
        initLoginChecks();
    }
});
