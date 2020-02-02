
$(document).ready(function () {
    carregarLogs();
});

function carregarLogs() {
    try {
        $('#dtLog').dataTable().fnClearTable();
        $('#dtLog').dataTable().fnDestroy();
        $('#dtLog').DataTable({
            "scrollX": true,
            "lengthMenu": [[20, -1], [20, "All"]],
            "ajax": {
                "type": "GET",
                "url": 'http://177.190.150.12:5000/log/',
                "dataSrc": ""
            },
            "columns": [
                { "data": "user" },
                { "data": "datetime", type: 'date', targets: 1 },
                { "data": "action" },
                { "data": "instancename" },
                { "data": "cnpj" },
                { "data": "produto" },
                { "data": "image_tag_origem" },
                { "data": "image_tag_destino" },
                { "data": "status" }
            ],
            "order": [[1, "desc"]],
            "aaSorting": [[1,'desc']],
        });
    }
    catch (ex){
        console.log(ex);
    }
}


function addLog(action, instanceName, cnpj, produto, image_tag_origem, image_tag_destino, status) {

    var data = [];
    var user = $("#username").text();

    data.push({ name: "user", value: user});
    data.push({ name: "action", value: action});

    if (instanceName !== null && instanceName !== undefined)
        data.push({ name: "instancename", value: instanceName});

    if (cnpj !== null && cnpj !== undefined)
        data.push({ name: "cnpj", value: cnpj});

    if (produto !== null && produto !== undefined)
        data.push({ name: "produto", value: produto});

    if (image_tag_origem !== null && image_tag_origem !== undefined)
        data.push({ name: "image_tag_origem", value: image_tag_origem});

    if (image_tag_destino !== null && image_tag_destino !== undefined)
        data.push({ name: "image_tag_destino", value: image_tag_destino});

    if (status !== null && status !== undefined)
        data.push({ name: "status", value: status});

    $.ajax({
        type: "POST",
        url: "http://177.190.150.12:5000/log/",
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
