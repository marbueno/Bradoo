$('#registry-product').submit(function (event) {
    event.preventDefault(); //prevent default action
    var data = $( this ).serializeArray();
    debugger;
    var url = "http://18.219.63.233:5000/produto/";
    var typeStr = "POST";
    var productId = $("#produtoId").val();
    var msg = "Produto Cadastrado!"
    var msgLog = "Criação do Produto: " + $('#id_product').val();

    if (productId !== "" && productId !== null){
        url = "http://18.219.63.233:5000/produto/" + productId + "/";
        typeStr = "PUT";
        msg = "Produto Alterado!";
        msgLog = "";
    }

    $.ajax({
        type: typeStr,
        url: url,
        data :  JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success:function () {

            if (msgLog !== ""){
                addLog(msgLog);
            }

            $('#createproduct').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            Swal.fire({
                type:'success',
                title:'Sucesso!',
                text: msg
            }).then(function () {
                window.location.href= '/produto';

            });
        },
        error: function (ex) {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: "Falha ao Cadastrar/Alterar o Produto!",
            });
        }
    });
    return false;
});

$('form[id^="rm-product-"]').submit(function (event) {
    event.preventDefault();
    var data = $( this ).serializeArray();
    var msgLog = "Exclusão do Produto: " + data[1].value;
    
    Swal.fire({
    title: 'Deseja remover a Produto ?',
    text: "A aplicação sofrera alterações!",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, desejo!'
    }).then((result) => {
          if (result.value) {
                $.ajax({
                        url: "http://18.219.63.233:5000/produto/" + data[0]['value'] + "/",
                        type: "DELETE",
                        data: data,
                        dataType: "json",
                        success: function () {

                            if (msgLog !== "") {
                                addLog(msgLog);
                            };

                            Swal.fire({
                                type:'success',
                                title:'Sucesso!',
                                text:'Produto Removida!'
                            });
                            
                            window.setTimeout( function() {
                                window.location.reload();
                            } , 1000);

                        },
                        error: function () {
                             Swal.fire({
                                type: 'error',
                                title: 'Oops...',
                                text: "Falha ao remover Produto!",
                            });
                        }
                    });
          }
    });
    return false;

});

function setValuesFields(id, product, domain, server){
    $("#produtoId").val(id);
    $('[name="product"]').val(product);
    $('[name="domain"]').val(domain);
    $('[name="server"]').val(server);
}
