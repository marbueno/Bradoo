
$(document).ready(function () {
    carregarLogs();
});

function carregarLogs() {
    try {
        $('#dtLog').dataTable().fnClearTable();
        $('#dtLog').dataTable().fnDestroy();
        $('#dtLog').DataTable({
            "lengthMenu": [[20, -1], [20, "All"]],
            "ajax": {
                "type": "GET",
                "url": 'http://18.219.63.233:5000/log/',
                "dataSrc": ""
            },
            "columns": [
                { "data": "user" },
                { "data": "datetime", type: 'date', targets: 1 },
                { "data": "action" }
            ],
            "order": [[1, "desc"]],
            "aaSorting": [[1,'desc']],
        });
    }
    catch (ex){
        console.log(ex);
    }
}


function addLog(action) {

    var data = [];
    var user = $("#username").text();

    data.push({ name: "user", value: user})
    data.push({ name: "action", value: action})

    $.ajax({
        type: "POST",
        url: "http://18.219.63.233:5000/log/",
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
