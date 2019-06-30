var images = []

$("#createbuild").submit(function (event) {
    event.preventDefault();
    debugger;
    var data = $( this ).serializeArray();

    images.forEach(itemImage => {
        if (itemImage._id === $("#images").val()){
            data.push({ name: "image_tag", value: itemImage.image_tag});
            data.push({ name: "url_image", value: itemImage.url_image});
            data.push({ name: "image_name", value: itemImage.image_name});
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
        if (
            // Read more about handling dismissals
            result.dismiss === Swal.DismissReason.timer
            ) {
                $('#outputJenkins').modal('show');
            }
        });
    return false

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



$("#auto_fill_product").focusout(function () {
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


$('form[id^="updatejob-"]').submit(function (event) {
    event.preventDefault();
    var data = $( this ).serializeArray();
    var url = 'http://18.219.63.233:5000/build/';
    debugger;
    $.ajax({
        type: "PUT",
        url: url,
        data :  JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        success:function () {
            $('div[id^="updateJob-"]').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            Swal.fire({
                type: 'success',
                title: 'Sucesso!',
                text: 'Build executado!'
            });

        },
        error:function () {
            Swal.fire({
                type:'error',
                title: 'Oops...',
                text:'Falha ao executar o build!'
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
                            }).then(function () {
                                window.location.href= '/deployments';

                            });
                            }

    });
          }
    });
    return false;
});


function showBuildLog(build_id){

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