$('form[id^="log-pod-"]').on('submit', function (event) {
    event.preventDefault();
    var data = $( this ).serializeJSON();
    var url = 'http://' + ipServer + ':5000/log/';
    debugger;
    $.ajax({
        url: url,
        data:JSON.stringify(data),
        type: "POST",
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            $("#contexlog").text(result);
            $('#logPod').modal('show');

        },
        error: function () {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: "Falha ao visualizar Log!",
            });
        }

    })

});