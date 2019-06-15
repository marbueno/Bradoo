$('#registry-images').submit(function (event) {
    event.preventDefault(); //prevent default action
    var data = $( this ).serializeArray();

    var url = "http://18.219.63.233:5000/image/";
    var typeStr = "POST";
    var imageId = $("#imageId").val();
    var msg = "Imagem Cadastrada!"

    if (imageId !== "" && imageId !== null){
        url = "http://18.219.63.233:5000/image/" + imageId + "/";
        typeStr = "PUT";
        msg = "Imagem Alterada!";
    }
        $.ajax({
        type: typeStr,
        url: url,
        data :  JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success:function () {
            $('#registerimage').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            Swal.fire({
                type:'success',
                title:'Sucesso!',
                text: msg
            }).then(function () {
                window.location.href= '/imagens';

            });
        },
        error: function () {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: "Falha ao cadastrar Imagem!",
            });
        }
    });
    return false;
});

$('form[id^="rm-image-"]').submit(function (event) {
    event.preventDefault();
    var data = $( this ).serializeArray();
    Swal.fire({
    title: 'Deseja remover a Imagem ?',
    text: "A aplicação sofrera alterações!",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, desejo!'
    }).then((result) => {
          if (result.value) {
             $.ajax({
                    url: "http://18.219.63.233:5000/image/"+ data[0]['value'] + "/",
                    type: "DELETE",
                    data: data,
                    dataType: "json",
                    success: function () {
                        Swal.fire({
                            type:'success',
                            title:'Sucesso!',
                            text:'Imagem Removida!'
                        }).then(function () {
                            window.location.href= '/imagens';

                        });
                    },
                    error: function () {
                         Swal.fire({
                            type: 'error',
                            title: 'Oops...',
                            text: "Falha ao remover Imagem!",
                        });
                    }
                });
    return false;
          }
    });
});

$("#auto_fill_image").focusout(function () {
    var image = $( this ).val();
    $.ajax({
        type: "GET",
        url: "http://18.219.63.233:5000/image/" + image + "/",
        datatype: "json",
        success: function (result) {
            $("#id_image_nameu").val(result.image_name);
            $("#id_url_imageu").val(result.url_image);
            $("#id_image_tagu").val(result.image_tag);
        }
    })
});

$('#update-images').submit(function (event) {
    event.preventDefault(); //prevent default action
    var data = $( this ).serializeArray();
    debugger;
    var url = 'http://18.219.63.233:5000/image/'+ data[1]['value'] + '/';
    $.ajax({
        type: "PUT",
        url: url,
        data :  JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success:function () {
            $('#imageUpdate').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            Swal.fire({
                type:'success',
                title:'Sucesso!',
                text:'Imagem Atualizada!'
            }).then(function () {
                window.location.href= '/imagens';

            });
        },
        error: function () {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: "Falha ao Atualizar Imagem!",
            });
        }
    });
    return false;
});

function resetFields(){
    $('#imageId').val('');
    $("#product option[value=None]").attr('selected', 'selected');
    $('[name="url_image"]').val();
    $('[name="image_name"]').val();
    $('[name="image_tag"]').val();
    $("#radDemo"). prop("checked", true);
}

function setValuesFields(id, productId, url_image, image_name, image_tag, typedb){
    $("#imageId").val(id);
    $("#product option[value=" + productId + "]").attr('selected', 'selected');
    $('[name="url_image"]').val(url_image);
    $('[name="image_name"]').val(image_name);
    $('[name="image_tag"]').val(image_tag);
    
    if (typedb === 'limpo'){
        $("#radLimpo").prop("checked", true);
    }
    else {
        $("#radDemo").prop("checked", true);
    }
}