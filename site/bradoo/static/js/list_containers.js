var images = []
var build = {}

$("#createbuild").submit(function (event) {
    event.preventDefault();
    debugger;
    var data = $( this ).serializeArray();
    var produto = $("#product option:selected").text().toLowerCase().replace(' ', '').replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
    data.push({ name: "produto", value: produto});

    images.forEach(itemImage => {
        if (itemImage._id === $("#images").val()){
            data.push({ name: "image_tag", value: itemImage.image_tag});
            data.push({ name: "url_image", value: itemImage.url_image});
            data.push({ name: "image_name", value: itemImage.image_name});

            if($('#typedbDEMO').is(':checked'))
                data.push({ name: "pathdb", value: itemImage.id_mod_bd_demo});

            if($('#typedbPROD').is(':checked'))
                data.push({ name: "pathdb", value: itemImage.id_mod_bd_prd});
        }
    });

    var url = 'http://18.219.63.233:5000/build/';
    $.ajax({
        type: "POST",
        url: url,
        data :  JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        success:function (data, textStatus, XmlHttpRequest) {
            $('#createJob').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        },
        error:function (XMLHttpRequest, textStatus, errorThrown) {
            $('#createJob').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        }
    });
    let timerInterval
    Swal.fire({
        title: 'Build em Execução!',
        html: 'Tempo de Execução <strong></strong> segundos.',
        timer: 15000,
        onBeforeOpen: () => {
            Swal.showLoading()
            timerInterval = setInterval(() => {
            Swal.getContent().querySelector('strong')
                .textContent = Swal.getTimerLeft()
            }, 100)
        },
        onClose: () => {
        clearInterval(timerInterval)
        }

    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
            $('#outputJenkins').modal('show');
        }
    });
    return false
});


$('#updatebuild').submit(function (event) {
    event.preventDefault();
    debugger;
    var data = $( this ).serializeArray();
    var url = 'http://18.219.63.233:5000/build/' + build._id + "/";

    var produto = $("#productu option:selected").text().toLowerCase().replace(' ', '').replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
    data.push({ name: "produto", value: produto});

    images.forEach(itemImage => {
        if (itemImage._id === $("#imagesu").val()){
            data.push({ name: "image_id", value: itemImage._id});
            data.push({ name: "product", value: itemImage.product});
            data.push({ name: "image_tag", value: itemImage.image_tag});
            data.push({ name: "url_image", value: itemImage.url_image});
            data.push({ name: "image_name", value: itemImage.image_name});
            data.push({ name: "name", value: build.name});

            if($('#typedbuDEMO').is(':checked'))
                data.push({ name: "pathdb", value: itemImage.id_mod_bd_demo});

            if($('#typedbuPROD').is(':checked'))
                data.push({ name: "pathdb", value: itemImage.id_mod_bd_prd});
        }
    });
    
    $.ajax({
        type: "PUT",
        url: url,
        data :  JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        success:function () {
            $('#updateJob').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            Swal.fire({
                type: 'success',
                title: 'Sucesso!',
                text: 'Build Executado!'
            });

        },
        error:function (ex) {
            console.log(ex);
            Swal.fire({
                type:'error',
                title: 'Oops...',
                text:'Falha ao executar o build!'
            });

        }
    })
});

$('input[id^="switch"]').click(function (e) {
    e.preventDefault();
    var data = $( this ).val();
    Swal.fire({
        title: 'Deseja scalar ?',
        text: "A aplicação sofrera alterações!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, desejo escalar!'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: 'POST',
                url:'http://18.219.63.233:5000/scale/',
                data: data,
                datatype: 'text',
                success:function () {
                    Swal.fire({
                        type: 'success',
                        title: 'Sucesso!',
                        text: 'Scale executado!',
                    }).then(function () {
                        window.location.href= '/deployments';

                    });
                },
                error:function () {
                    Swal.fire({
                        type:'error',
                        title: 'Oops...',
                        text:'Falha ao Scalar'
                    }).then(function () {
                        window.location.href= '/deployments';

                    });
                }
            });
        }
    })
});

$("#product").focusout(function () {
    var product = $( this ).val();
    $('#images').children('option:not(:first)').remove();
    $.ajax({
        type: "GET",
        url: "http://18.219.63.233:5000/image/",
        datatype: "json",
        success: function (result) {
            images = result;
            result.forEach(itemImage => {
                if (itemImage.product === product){
                    $("#images").append('<option value="' + itemImage._id + '">' + itemImage.image_tag + '</option>');
                }
            });
        }
    })
});

$('form[id^="back-deployment-"]').submit(function (event) {
    event.preventDefault();
    debugger;
    var data = $( this ).serializeArray();
    Swal.fire({
      title: 'Deseja realizar Rollback ?',
      text: "A aplicação sofrera alterações!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, desejo!'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: 'POST',
                url:'http://18.219.63.233:5000/build/rollback/'+data[0]['value']+'/',
                success:function () {
                    Swal.fire({
                        type: 'success',
                        title: 'Sucesso!',
                        text: 'Rollback executado!',
                    }).then(function () {
                        window.location.href= '/deployments';

                    });
                },
                error:function () {
                    Swal.fire({
                        type:'error',
                        title: 'Oops...',
                        text:'Falha ao realizar o rollback'
                    }).then(function () {
                        window.location.href= '/deployments';

                    });
                }

            });
        }
    });
    return false;
});


$('form[id^="rm-deployment-"]').submit(function (event) {
    event.preventDefault();
    var data = $( this ).serializeArray();
    Swal.fire({
      title: 'Deseja remover ?',
      text: "A aplicação sofrera alterações!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, desejo remover!'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: 'DELETE',
                url:'http://18.219.63.233:5000/build/'+data[0]['value']+'/',
                success:function () {
                    Swal.fire({
                        type: 'success',
                        title: 'Sucesso!',
                        text: 'Remove executado!',
                    }).then(function () {
                        window.location.href= '/deployments';

                    });
                },
                error:function () {
                    Swal.fire({
                        type:'error',
                        title: 'Oops...',
                        text:'Falha ao remover'
                    }).then(function () {
                        window.location.href= '/deployments';

                    });
                }

            });
        }
    });
    return false;
});

$('form[id^="backup-deployment-"]').submit(function (event) {
    event.preventDefault();
    debugger;
    var data = $( this ).serializeArray();
    Swal.fire({
      title: 'Deseja realizar Backup ?',
      text: "A aplicação sofrera alterações!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, desejo!'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: 'POST',
                url:'http://18.219.63.233:5000/build/backup/'+data[0]['value']+'/',
                success:function () {
                    Swal.fire({
                        type: 'success',
                        title: 'Sucesso!',
                        text: 'Backup executado!',
                    }).then(function () {
                        window.location.href= '/deployments';

                    });
                },
                error:function () {
                    Swal.fire({
                        type:'error',
                        title: 'Oops...',
                        text:'Falha ao realizar o Backup'
                    })
                    .then(function () {
                        window.location.href= '/deployments';

                    });
                }

            });
        }
    });
    return false;
});

function showBuildLog(build_id) {

    if (build_id !== null && build_id !== 0) {

        $('#logBuild').html('Carregando...');

        $.ajax({
            type: "GET",
            url: "http://18.219.63.233:5000/build/log/" + build_id + "/",
            datatype: "json",
            success: function (result) {
                console.log(result);
                $('#logBuild').html(result.toString().replace(/\n/g, "<br />"));
            }
        })
    }
}

function setValuesFields(name){

    $('[name="name"]').prop( "disabled", true );
    $('#imagesu').children('option:not(:first)').remove();

    $.ajax({
        type: "GET",
        url: "http://18.219.63.233:5000/build/" + name,
        datatype: "json",
        success: function (result) {

            build = result;

            $('#productu').val(result.product);
            $('[name="name"]').val(result.name);
            $('[name="cnpj_cpf"]').val(result.cnpj_cpf);
            $('[name="nome_razaosocial"]').val(result.nome_razaosocial);
            $('[name="login"]').val(result.login);
            $('[name="password"]').val(result.password);

            if (result.typedb === "demo")
                $("#typedbuDEMO").prop("checked", true);

            if (result.typedb === "prod")
                $("#typedbuPROD").prop("checked", true);
    
            $.ajax({
                type: "GET",
                url: "http://18.219.63.233:5000/image/",
                datatype: "json",
                success: function (resultImage) {
                    images = resultImage;
                    $('#imagesu').find('option').remove();
                    resultImage.forEach(itemImage => {
                        if (itemImage.product === result.product){

                            if (itemImage._id === result.image_id)
                                $("#imagesu").append('<option value="' + itemImage._id + '" selected>' + itemImage.image_tag + '</option>');
                            else
                                $("#imagesu").append('<option value="' + itemImage._id + '">' + itemImage.image_tag + '</option>');
                        }
                    });
                }
            })
        
        }
    })
}