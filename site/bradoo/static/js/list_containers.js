var buildsToCheck = [];
var dtDeployments = null;
var images = []
var build = {}
var dataLog = []

$(document).ready(function () {
    carregarDeployments();
});

function carregarDeployments() {

    return new Promise(function (resolve, reject) {

        try {
            $('#dtDeployments').dataTable().fnClearTable();
            $('#dtDeployments').dataTable().fnDestroy();
            dtDeployments = $('#dtDeployments').DataTable({
                "scrollX": true,
                "lengthMenu": [[20, -1], [20, "All"]],
                "ajax": {
                    "type": "GET",
                    "url": 'http://' + ipServer + ':5000/build/getBuilds/',
                    "dataSrc": ""
                },
                "columns": [
                    { "data": "product_name" },
                    { "data": "image_tag" },
                    { "data": "name" },
                    { "data": "cnpj_cpf" },
                    { "data": "nome_razaosocial" },
                    {
                        "mDataProp": "url",
                        mRender: function (data, type, row)
                        {
                            var url = ""
                            if (row.url === "" && row.status === "1")
                                url = "<a href='http://" + row.name + "." + row.product_domain + "' target='_blank'>http://" + row.name + "." + row.product_domain + "</a>"
                                // url = "<a href='http://" + row.name + ".app.vantes.com.br' target='_blank'>http://" + row.name + ".app.vantes.com.br</a>"

                            return url;
                        }
                    },
                    {
                        "mDataProp": "status",
                        mRender: function (data, type, row)
                        {
                            var status = ""
                            if (row.status === "0" || row.replicas === 0) status = "Desativada"
                            if (row.status === "1" && row.replicas === 1) status = "Ativa"
                            if (row.status === "2" || row.status === "3") { 

                                if (row.status === "2") status = "Em Construção";
                                if (row.status === "3") status = "Em Atualização";

                                if (buildsToCheck.length === 0){
                                    buildsToCheck.push({ id: row._id, instanceName: row.name, cnpj: row.cnpj_cpf, productName: row.product_name, image_tag: row.image_tag, image_tag_aux: row.image_tag_aux, status: row.status });
                                }
                                else {

                                    var isAdded = false;
                                    
                                    buildsToCheck.forEach(item => {
                                        if (item.instanceName === row.name)
                                            isAdded = true;
                                    });

                                    if (isAdded === false)
                                        buildsToCheck.push({ id: row._id, instanceName: row.name, cnpj: row.cnpj_cpf, productName: row.product_name, image_tag: row.image_tag, image_tag_aux: row.image_tag_aux, status: row.status });
                                }
                            }

                            return status;
                        }
                    },
                    {
                        "mDataProp": "Actions",
                        mRender: function (data, type, row)
                        {
                            var replicaChecked = ''
                            var ativarDesativar = row.replicas;
                            var actionsHTML = ''

                            if (row.status === "0" || row.status === "1") {

                                if (ativarDesativar === 1) {
                                    replicaChecked = 'checked'
                                    ativarDesativar = 0
                                }
                                else {
                                    ativarDesativar = 1
                                }

                                actionsHTML += '<div class="row" style="width: 190px !important;">';
                                actionsHTML += '&emsp;';
                                actionsHTML += '    <label class="switch" style="margin-top: 3px; margin-bottom: 0; width:30px; height: 16px;" title="Ativo / Desativado">';
                                actionsHTML += '        <input ' + replicaChecked + ' type="checkbox" onclick="ativarDesativarInstancia(\'' + row.name + '\',\'' + row.namespace + '\',' + ativarDesativar + ')" >'
                                actionsHTML += '        <span class="slider round"></span>'
                                actionsHTML += '    </label>'

                                actionsHTML += '    <button class="btn2" id="rm-image-btn" title="Excluir instância" onclick="deleteDeployment(\'' + row.name + '\')"><i class="fa fa-trash"></i></button>';

                                actionsHTML += '    <button class="btn2" data-toggle="modal" data-target="#updateJob" title="Atualizar Instância" onclick="setValuesFields(\'' + row.name + '\')"><i class="fas fa-sync"></i></button>';

                                actionsHTML += '    <button class="btn2" title="Efetuar Backup" onclick="doBackup(\'' + row.name + '\',\'' + row.product_name + '\',\'' + row.product_domain + '\',\'' + row.typedb + '\')"><i class="fas fa-search"></i></button>';

                                actionsHTML += '    <button class="btn2" title="Visualizar Log" onclick="visualizarLog(\'' + row.pod_name + '\',\'' + row.namespace + '\',\'' + row.name + '\')"><i class="fas fa-history"></i></button>';

                                actionsHTML += '    <button class="btn2" id="btnDadosAdm' + row.name + '" data-toggle="modal" data-target="#logJob" title="Dados Administrativos" data-toggle="modal" onclick="javascript:showDadosAdministrativos(\'' + row.name + '\',\'' + row.product_name + '\')"><i class="fas fa-user-cog"></i></button>';
                                actionsHTML += '</div>';
                            }
                            else{
                                actionsHTML += '    <button class="btn2" id="rm-image-btn" title="Excluir instância" onclick="deleteDeployment(\'' + row.name + '\')"><i class="fa fa-trash"></i></button>';
                            }

                            return actionsHTML;
                        }
                    }
                ],
                "columnDefs":
                [
                    { "width": "100px !important", "targets": [7] }
                ],
                "order": [[1, "desc"]],
                "aaSorting": [[1,'desc']],

                "fnInitComplete": function (oSettings, json) {

                    buildsToCheck.forEach(item => {
                        checkBuild(item);
                    });

                    resolve(true);
                }
            });
        }
        catch (ex){
            reject(true);
            console.log(ex);
        }
    });
}

$("#createbuild").submit(function (event) {
    event.preventDefault();
    debugger;
    var data = $( this ).serializeObject();
    var jobName = $('#id_name').val().toLowerCase();
    var firstChar = jobName.charAt(0);
    var isValidJobName = true;
    try {
        if (parseInt(firstChar) >= 0 && parseInt(firstChar) <= 9){
            Swal.fire({
                type:'error',
                title: 'Oops...',
                text:'O Nome da Instância não pode iniciar com números!'
            });

            isValidJobName = false;
        }
    }
    catch(ex){}
    
    var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (format.test(jobName)){
        Swal.fire({
            type:'error',
            title: 'Oops...',
            text:'O Nome da Instância não pode conter caracteres especiais!'
        });

        isValidJobName = false;
    }

    if (isValidJobName) {
        var product_name = $("#product option:selected").text().toLowerCase().replace(' ', '').replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
        var image_tag = $("#images option:selected").text();

        data.product_name = product_name;
        data.image_tag = image_tag;

        var url = 'http://' + ipServer + ':5000/build/';
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

                window.location.reload();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                
                if (XMLHttpRequest.status === 406) {
                
                    Swal.fire({
                        type:'error',
                        title: 'Validação',
                        text: XMLHttpRequest.responseJSON.Validation
                    });
                }
                else {
                
                    Swal.fire({
                        type:'error',
                        title: 'Oops...',
                        text:'Falha ao criar o build!'
                    });
                }
            
            }
        });
        return false
    }
});


$('#updatebuild').submit(function (event) {
    debugger;

    event.preventDefault();
    var data = $( this ).serializeArray();

    var produto = $("#productu option:selected").text().toLowerCase().replace(' ', '').replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
    data.push({ name: "produto", value: produto});
    data.push({ name: "image_tag_old", value: build.image_tag});

    images.forEach(itemImage => {
        if (itemImage._id === $("#imagesu").val()) {
            data.push({ name: "image_id", value: itemImage._id});
            data.push({ name: "name", value: build.name});
            data.push({ name: "url_image", value: itemImage.url_image});
            data.push({ name: "image_name", value: itemImage.image_name});
            data.push({ name: "image_tag", value: itemImage.image_tag});
        }
    });

    var image_tag_aux = data[7].value;
    var msgLog = "Atualização da Instância: " + build.name;

    updateJenkins(data).then( r => {
        if (r === true){

            var url = 'http://' + ipServer + ':5000/build/updateImageTagAux/' + build._id + '/' + image_tag_aux;

            $.ajax({
                type: "PUT",
                url: url,
                data :  JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                success:function () {

                    if (msgLog !== "") {
                        addLog(msgLog, build.name, build.cnpj_cpf, build.produto, build.image_tag, image_tag_aux, "Em Atualização");
                    }

                    window.setTimeout( function() {
                        window.location.reload();
                    } , 1000);  

                },
                error:function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(errorThrown);
                    Swal.fire({
                        type:'error',
                        title: 'Oops...',
                        text:'Falha ao atualizar o build!'
                    });

                }
            })
        }
    });
});

function ativarDesativarInstancia(instanceName, nameSpace, ativarDesativar) {
    debugger;

    var data = [];
    data.push({ name: "name", value: instanceName});
    data.push({ name: "namespace", value: nameSpace});
    data.push({ name: "ativar", value: ativarDesativar});
    
    var msgLog = instanceName;
    if (ativarDesativar === 1)
        msgLog = "Instância Ativada: " + msgLog;
    else
        msgLog = "Instância Desativada: " + msgLog;

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
                url:'http://' + ipServer + ':5000/scale/',
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                success:function () {

                    if (msgLog !== ""){
                        addLog(msgLog);
                    }

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
};

$("#product").focusout(function () {

    var product = $( this ).val();
    $('#images').children('option:not(:first)').remove();
    $.ajax({
        type: "GET",
        url: "http://" + ipServer + ":5000/image/",
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

function deleteDeployment(instanceName) {

    var data = [];
    data.push({name: "name", value: instanceName});
    var msgLog = "Exclusão da Instância: " + instanceName;
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
                url:'http://' + ipServer + ':5000/build/' + instanceName + '/',
                success:function () {

                    if (msgLog !== "") {
                        addLog(msgLog);
                    };

                    Swal.fire({
                        type: 'success',
                        title: 'Sucesso!',
                        text: 'Remove executado!',
                    });
                            
                    window.setTimeout( function() {
                        window.location.reload();
                    } , 1000);
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
};

function downloadFile(instanceName){
    let link = document.createElement('a');
    link.setAttribute("type", "hidden");
    link.href = 'http://' + ipServer + ':5000/build/download/' + instanceName;
    link.download = instanceName + ".zip";
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function doBackup(instanceName, productName, productDomain, typedb) {

    var data = [];
    var dns = instanceName + '.' + productDomain;
    var dbname = instanceName + productName + typedb;
    data.push({name: "dbname", value: dbname});
    data.push({name: "dns", value: dns});

    Swal.fire({
      title: 'Deseja realizar Backup ?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, desejo!'
    }).then((result) => {
        if (result.value) {

            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                url:'http://' + ipServer + ':5000/build/backup/',
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                success:function () {
                    Swal.fire({
                        type: 'success',
                        title: 'Sucesso!',
                        text: 'Backup executado com sucesso. Por favor, aguarde o download...'
                    });
                    
                    downloadFile(instanceName);
                },
                error:function () {
                    Swal.fire({
                        type:'error',
                        title: 'Oops...',
                        text:'Falha ao realizar o Backup'
                    });
                }
            });


            Swal.fire({
                title: 'Estamos preparando o backup!',
                html: 'Por favor aguarde alguns segundos ...',
                timer: 15000,
                onBeforeOpen: () => {
                    Swal.showLoading()
                },
            });
        }
    });
    return false;
}

function showDadosAdministrativos(instanceName, productName) {

    debugger;

    var url = "http://" + instanceName + ".app.vantes.com.br"

    $('#idVars').val("");
    $('#id_user_odoo').val("");

    $('#id_pass_odoo').val("");
    $('#id_pass_odoo').attr('type', 'password');
    $('#pass_odoo').addClass( "fa-eye-slash" );
    $('#pass_odoo').removeClass( "fa-eye" );

    $('#id_pass_admin').val("");
    $('#id_pass_admin').attr('type', 'password');
    $('#pass_admin').addClass( "fa-eye-slash" );
    $('#pass_admin').removeClass( "fa-eye" );    

    $('#id_db_pass').val("");
    $('#id_db_pass').attr('type', 'password');
    $('#db_pass').addClass( "fa-eye-slash" );
    $('#db_pass').removeClass( "fa-eye" );   

    $('#id_dns').val("");

    if (instanceName !== null && instanceName !== "") {

        $.ajax({
            type: "GET",
            url: "http://" + ipServer + ":5000/vars/" + instanceName,
            datatype: "json",
            success: function (result) {

                if (result !== null) {
                    $('#formVars').css('display', 'block');
                    $('#salvarDadosAdm').css('display', 'block');
                    $('#messageVars').html("");
                    $('#idVars').val(result._id);
                    $('#id_user_odoo').val(result.USER_ODOO);
                    $('#id_pass_odoo').val(result.PASS_ODOO);
                    $('#id_pass_admin').val(result.PASS_ADMIN);
                    $('#id_db_pass').val(result.DB_PASS);
                    $('#id_dns').val(url);
                    $("#href_dns").attr("href", url);
                }
                else {
                    $('#formVars').css('display', 'none');
                    $('#salvarDadosAdm').css('display', 'none');
                    $('#messageVars').html("Dados Indisponíveis");
                }

            },
            error: function(){
                $('#formVars').css('display', 'none');
                $('#salvarDadosAdm').css('display', 'none');
                $('#messageVars').html("Dados Indisponíveis");
            }
        })
    }
}

function setValuesFields(name){

    $('#imagesu').children('option:not(:first)').remove();    

    $.ajax({
        type: "GET",
        url: "http://" + ipServer + ":5000/build/" + name + '/',
        datatype: "json",
        success: function (result) {

            build = result;

            $('#productu').val(result.product);
            $('[name="name"]').val(result.name);
    
            $.ajax({
                type: "GET",
                url: "http://' + ipServer + ':5000/image/",
                datatype: "json",
                success: function (resultImage) {
                    images = resultImage;
                    $('#imagesu').find('option').remove();
                    resultImage.forEach(itemImage => {
                        if (itemImage.product === result.product){

                            if (itemImage.image_tag === result.image_tag)
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

function visualizarLog(podName, nameSpace, containerName) {
    debugger;

    data = []
    data.push({name: "podName", value: podName});
    data.push({name: "namespace", value: nameSpace});
    data.push({name: "containerName", value: containerName});
    dataLog = data;
    $('#contextlog').text('Atualizando...');
    var url = 'http://' + ipServer + ':5000/logJenkins/';
    $.ajax({
        url: url,
        data:JSON.stringify(data),
        type: "POST",
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            
            Swal.close();
            
            $('#logPod').modal('show');
            $('#contextlog').text(result);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            
            Swal.close();

            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: "Não é possivel exibir os logs. O container ainda não foi inicializado!" + "\n\r" + errorThrown,
            });
        }
    })

    Swal.fire({
        title: 'Carregando Log!',
        html: 'Essa tarefa pode demorar alguns minutos ...',
        onBeforeOpen: () => {
            Swal.showLoading()
        }
    });    
};

function atualizarLog() {
    if (dataLog.length > 0) {
        visualizarLog(dataLog[0].value, dataLog[1].value, dataLog[2].value);
    }
}

function resetFields() {
    $('#productu').val('0');
    $('[name="name"]').val('');
    $('[name="name"]').css("text-transform", "lowercase");
    $('[name="cnpj_cpf"]').val('');
    $('[name="nome_razaosocial"]').val('');
    $('[name="login"]').val('');
    $('[name="password"]').val('');
    $("#typedbDEMO").prop("checked", true);
}

function showOutputJenkins(lenOutputJenkins){

    debugger;

    $('#outputJenkins').modal('show');
    if (lenOutputJenkins === undefined || lenOutputJenkins === null)
        lenOutputJenkins = 0;

    var lenOutputJenkinsAux = lenOutputJenkins

    var url = 'http://' + ipServer + ':5000/jenkins/output/';
    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (lenOutputJenkinsAux < result.length) {
                $("#logOutputJenkins").text(result);

                showOutputJenkins(result.length);
            }
        },
        error: function (ex) {
            console.log(ex);
        }
    })
}

function updateStatus(jobName, status) {
    
    return new Promise(function (resolve, reject) {
        var url = 'http://' + ipServer + ':5000/build/updateStatus/' + jobName + '/' + status + '/';
        
        $.ajax({
            url: url,
            type: "PUT",
            contentType: "application/json; charset=utf-8",
            success: function () {
                resolve(true);
            },
            error: function (ex) {
                reject(true);
                console.log(ex);
            }
        });
    });
}

function checkBuild(item){

    return new Promise(function (resolve, reject) {

        debugger;
        var url = 'http://' + ipServer + ':5000/build/checkBuild/' + item.instanceName + '/';

        $.ajax({
            url: url,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.replica === 0 || result.replica === 1) {

                    updateStatus(item.instanceName, result.replica.toString()).then( r => {
                        if (r === true){
                            resolve(true);
                            buildsToCheck = [];

                            if (item.status === "2"){
                                var msgLog = "Criação da Instância: " + item.instanceName;

                                if (msgLog !== ""){
                                    addLog(msgLog, item.instanceName, item.cnpj, item.productName, item.image_tag, null, "Ativo");
                                }
                            }

                            if (item.status === "3"){
                                
                                var url = 'http://' + ipServer + ':5000/build/' + item.id + "/";
                                var msgLog = "Atualização da Instância: " + item.instanceName;

                                $.ajax({
                                    type: "PUT",
                                    url: url,
                                    contentType: "application/json; charset=utf-8",
                                    data: {},
                                    datatype: "json",
                                    success:function () {
                    
                                        if (msgLog !== ""){
                                            addLog(msgLog, item.instanceName, item.cnpj, item.productName, item.image_tag, item.image_tag_aux, "Ativo");
                                        }
                    
                                        window.setTimeout( function() {
                                            window.location.reload();
                                        } , 1000);  
                    
                                    },
                                    error:function (XMLHttpRequest, textStatus, errorThrown) {
                                        console.log(errorThrown);
                                        Swal.fire({
                                            type:'error',
                                            title: 'Oops...',
                                            text:'Falha ao atualizar imagem!'
                                        });
                                    }
                                });
                            }
                            dtDeployments.ajax.reload();                            
                        }
                    });
                }
                else {

                    window.setTimeout( function() {
                        checkBuild(item);
                    } , 5000);
                }
            },
            error: function (ex) {
                reject(true);
                console.log(ex);
            }
        })
    });
}

function doUpdateBuild(data){

    return new Promise(function (resolve, reject) {

        debugger;
        var url = 'http://' + ipServer + ':5000/build/updateJenkins/' + build._id + "/";

        $.ajax({
            url: url,
            type: "PUT",
            data :  JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            success: function () {
                resolve(true);
            },
            error: function (ex) {
                reject(true);
                console.log(ex);
            }
        })
    });
}

function updateJenkins(data) {
    
    return new Promise(function (resolve, reject) {
        try {

            $('#updateJob').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();

            var job_name = $('#id_name').val();

            updateStatus(job_name, "3").then( r => {
                if (r === true){
                    
                    doUpdateBuild(data).then( r => {
                        resolve(true);
                    });
                }
            });
        }
        catch (ex) {
            reject(true);
        }
    });
}

function showHidePass(controlName) {
    if($('#id_' + controlName).attr("type") == "text"){
        $('#id_' + controlName).attr('type', 'password');
        $('#' + controlName).addClass( "fa-eye-slash" );
        $('#' + controlName).removeClass( "fa-eye" );
    }else {
        $('#id_' + controlName).attr('type', 'text');
        $('#' + controlName).removeClass( "fa-eye-slash" );
        $('#' + controlName).addClass( "fa-eye" );
    }
};

$('#updateVars').submit(function (event) {
    event.preventDefault();
    debugger;

    var data = [];
    data.push({ name: "DB_PASS", value: $('#id_db_pass').val()});
    data.push({ name: "PASS_ADMIN", value: $('#id_pass_admin').val()});
    data.push({ name: "PASS_ODOO", value: $('#id_pass_odoo').val()});

    var url = 'http://' + ipServer + ':5000/vars/' + $("#idVars").val() + "/";

    $.ajax({
        type: "PUT",
        url: url,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        success: function() {

            Swal.fire({
                type: 'success',
                title: 'Sucesso!',
                text: 'Dados atualizados com sucesso!'

            })

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(errorThrown);
            Swal.fire({
                type:'error',
                title: 'Oops...',
                text:'Falha ao atualizar os dados administrativos!'
            });
        }
    });
});