const BASE_URL = location.origin;
axios.defaults.baseURL = `${BASE_URL}/api/v1`;
axios.defaults.headers.common['api-key'] = 'mockKey987';

$('#loginform').submit(() => {
    const email = $('#email').val();
    axios.post('/authenticateuser', {
        email: email,
        password: $('#pass').val()
    })
        .then(res => {
            if (res.data.statusOk) {
                console.log("Setting cookie")
                const EXP_DAYS = 180
                const d = new Date();
                d.setTime(d.getTime() + (EXP_DAYS * 24 * 60 * 60 * 1000));
                if ($('#check').is(":checked")) {
                    document.cookie = `sessionToken=${res.data.sessionToken}; expires=${d.toUTCString()}; path=/`;
                    document.cookie = `email=${email}; expires=${d.toUTCString()}; path=/`;
                    document.cookie = `user=${res.data._id}; expires=${d.toUTCString()}; path=/`;
                    document.cookie = `name=${res.data._name}; expires=${d.toUTCString()}; path=/`;
                }
                else {
                    document.cookie = `sessionToken=${res.data.sessionToken}; path=/`;
                    document.cookie = `name=${res.data._name}; path=/`;
                    document.cookie = `user=${res.data._id}; path=/`;
                    document.cookie = `email=${email}; path=/`;
                }
                window.location.href = BASE_URL;
            } else
                alert(res.data.statusString);
        })
        .catch(err => {
            alert("Some error ocurred\n" + err);
        });

    return false;
})