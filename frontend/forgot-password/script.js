const BASE_URL = location.origin;
axios.defaults.baseURL = `${BASE_URL}/api/v1`;
axios.defaults.headers.common['api-key'] = 'mockKey987';

$('#resetform').submit(() => {
    $("#message").html("Sending...");
    axios.post('/getResetLink', {
        email: $('#email').val()
    })
        .then(res => {
            if (res.data.statusOk)
                $("#message").html("Password reset link successfully sent to email");
            else
                $("#message").html(res.data.statusString);
        })
        .catch(err => {
            $("#message").html("Some error ocurred");
        });

    return false;
})