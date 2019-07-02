$('#registry-images').submit(function (event) {
    event.preventDefault(); //prevent default action
    var data = $( this ).serializeArray();

    var id_mod_bd_prd = $('#id_mod_bd_prd').val().toString().replace('C:\\fakepath\\','');
    var id_mod_bd_demo = $('#id_mod_bd_demo').val().toString().replace('C:\\fakepath\\','');
    fileNames = []

    if (id_mod_bd_prd !== ''){
        id_mod_bd_prd += getDateTimeStr();
        fileNames.push(id_mod_bd_prd);
    }

    if (id_mod_bd_demo !== '') {
        id_mod_bd_demo += getDateTimeStr();
        fileNames.push(id_mod_bd_demo);
    }

    uploadFiles(fileNames)
    .catch( ex => { 
        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: "Falha ao fazer Upload dos Arquivos!",
        });
    })
    .then( r => {

        if (r === true) {

            var url = "http://127.0.0.1:5000/image/";
            var typeStr = "POST";
            var imageId = $("#imageId").val();
            var msg = "Imagem Cadastrada!"
        
            if (imageId !== "" && imageId !== null){

                if (id_mod_bd_prd === "" || id_mod_bd_prd === undefined) {
                    id_mod_bd_prd = $('#div_mod_bd_prd').html();
                }

                if (id_mod_bd_demo === "" || id_mod_bd_demo === undefined) {
                    id_mod_bd_demo = $('#div_mod_bd_demo').html();
                }

                if (id_mod_bd_prd.includes("Nenhum")) id_mod_bd_prd = ""
                if (id_mod_bd_demo.includes("Nenhum")) id_mod_bd_demo = ""

                url = "http://127.0.0.1:5000/image/" + imageId + "/";
                typeStr = "PUT";
                msg = "Imagem Alterada!";
            }

            data.push({name: "id_mod_bd_prd", value: id_mod_bd_prd});
            data.push({name: "id_mod_bd_demo", value: id_mod_bd_demo});
                
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
        }

    })
    return false;
});

function getDateTimeStr()
{
    var date = new Date();

    var year = date.getFullYear().toString();
    var month = date.getMonth().toString();
    var day = date.getDate().toString();
    var hour = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    var seconds = date.getSeconds().toString();

    var newDateStr = year + month + day + hour + minutes + seconds

    return newDateStr;
}

function uploadFiles(fileNames) {

    return new Promise(function (resolve, reject) {
            
        var fileInputPRD = $('#id_mod_bd_prd');
        var fileInputDEMO = $('#id_mod_bd_prd');

        var formData = new FormData();

        if (fileNames[0] !== "" || fileNames[1] !== "") {

            if (fileNames[0] !== undefined && fileNames[0] !== "")
                formData.append(fileNames[0], fileInputPRD.get(0).files[0]);

            if (fileNames[1] !== undefined && fileNames[1] !== "")
                formData.append(fileNames[1], fileInputDEMO.get(0).files[0]);

            return jQuery.ajax({
                url: "http://127.0.0.1:5000/image/uploadFile",
                type: "POST",
                data: formData,
                async: false,
                contentType: false,
                processData: false,
                success: function(data) {
                    resolve(true);
                },

                error: function(ex) {
                    reject(ex);
                }
            });
        }
        else{
            resolve(true);
        }
    });

}

// Display error messages. 
function onError(error) {
    console.log(error.responseText);
}

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
                    url: "http://127.0.0.1:5000/image/"+ data[0]['value'] + "/",
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
        url: "http://127.0.0.1:5000/image/" + image + "/",
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
    var url = 'http://127.0.0.1:5000/image/'+ data[1]['value'] + '/';
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
    $('#div_mod_bd_prd').html('Nenhum Arquivo Selecionado');
    $('#div_mod_bd_demo').html('Nenhum Arquivo Selecionado');
}

function setValuesFields(id, productId, url_image, image_name, image_tag, id_mod_bd_prd, id_mod_bd_demo){
    $("#imageId").val(id);
    $("#product option[value=" + productId + "]").attr('selected', 'selected');
    $('[name="url_image"]').val(url_image);
    $('[name="image_name"]').val(image_name);
    $('[name="image_tag"]').val(image_tag);
    $('#div_mod_bd_prd').html(id_mod_bd_prd);
    $('#div_mod_bd_demo').html(id_mod_bd_demo);
}


$('#id_mod_bd_prd').change(function() {

    var file = $('#id_mod_bd_prd');
    var fileName = $('#id_mod_bd_prd').val().toString().replace('C:\\fakepath\\','');
    $('#div_mod_bd_prd').html('Arquivo: ' + fileName + ' | Tamanho: ' + returnFileSize(file[0].size) + '.');
  
});


$('#id_mod_bd_demo').change(function() {

    var file = $('#id_mod_bd_demo');
    var fileName = $('#id_mod_bd_demo').val().toString().replace('C:\\fakepath\\','');
    $('#div_mod_bd_demo').html('Arquivo: ' + fileName + ' | Tamanho: ' + returnFileSize(file[0].size) + '.');
  
});

function returnFileSize(number) {
    if(number < 1024) {
      return number + ' bytes';
    } else if(number >= 1024 && number < 1048576) {
      return (number/1024).toFixed(1) + 'KB';
    } else if(number >= 1048576) {
      return (number/1048576).toFixed(1) + 'MB';
    }
}