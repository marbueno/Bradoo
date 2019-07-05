function addLog(action) {

    var data = [];
    var user = $("#username").text();

    data.push({ name: "user", value: user})
    data.push({ name: "action", value: action})

    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/log/",
        data :  JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        error: function (ex) {
            console.log('Erro ao salvar log');
            console.log(ex);
        }
    });
    return false;
};
