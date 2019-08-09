var buildsToCheck = [];
var dtDeployments = null;
var listBuilds = [];
var buildsToUpdate = [];

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
                    "url": 'http://18.219.63.233:5000/build/getBuilds/',
                    "dataSrc": ""
                },
                "columns": [
                    {
                        "mDataProp": "name",
                        mRender: function (data, type, row)
                        {
                            if (row.status !== "3")
                                return "<input type='checkbox' style='margin-left:40px;' name='chkUpdate' data-job='" + row.name + "' data-product='" + row.product_name + "' />";
                            else
                                return "";
                        }
                    },
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
                                url = "<a href='http://" + row.name + "." + row.product_name + ".bradoo.tk' target='_blank'>http://" + row.name + "." + row.product_name + ".bradoo.tk</a>"

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

                            listBuilds.push(row);

                            return status;
                        }
                    }
                ],
                "columnDefs": [{
                    orderable: false,
                    targets:   0
                }],
                "select": {
                    style:    'os',
                    selector: 'td:first-child'
                },
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

$('#updateJobs').click(function (event) {
    debugger;

    var products = [];
    var isDifferent = false;
    var jobName = "";
    var productName = "";
    var build = {};
    var buildItem = [];
    buildsToUpdate = [];

    $("#dtDeployments tr:not(:first)").each(function ()
    {
        var checkBox = $(this).find("td:nth-child(1)").find('input[name$=chkUpdate]');
        var isChecked = checkBox.is(":checked");

        if (isChecked) {

            jobName = checkBox[0].dataset.job;
            productName = checkBox[0].dataset.product;

            if (products.length === 0)
                products.push({product: productName});
            else {
                products.forEach(item => {
                    if (item.product !== productName)
                        isDifferent = true;
                });
            }

            build = getBuildByName(jobName);
            buildItem = [];
            buildItem.push({ name: "_id", value: build._id});
            buildItem.push({ name: "name", value: build.name});
            buildItem.push({ name: "cnpj_cpf", value: build.cnpj_cpf});
            buildItem.push({ name: "produto", value: build.produto});
            buildItem.push({ name: "image_tag", value: build.image_tag});

            buildsToUpdate.push(buildItem);
        }
    });

    if (products.length === 0) {
        
        Swal.fire({
            type:'error',
            title: 'Oops...',
            text:'Favor selecionar pelo menos uma instância para atualização!'
        });
    }
    else if (products.length > 0 && isDifferent){
        Swal.fire({
            type:'error',
            title: 'Oops...',
            text:'Não é possível atualizar mais de uma instância de produtos diferentes!'
        });
    }
    else {
        setValuesFields(jobName);
        $('#bulkUpdate').modal('show');
    }
});


function getBuildByName(jobName) {
    
    var buildAux = {};

    listBuilds.forEach(item => {
        if (item.name === jobName)
            buildAux = item;
    });

    return buildAux;
}

function setValuesFields(name){

    $('#imagesu').children('option:not(:first)').remove();    

    $.ajax({
        type: "GET",
        url: "http://18.219.63.233:5000/build/" + name + '/',
        datatype: "json",
        success: function (result) {

            build = result;

            $('#productu').val(result.product);
            $('[name="name"]').val(result.name);
    
            $.ajax({
                type: "GET",
                url: "http://18.219.63.233:5000/image/",
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

$('#updatebuild').submit(function (event) {
    debugger;

    event.preventDefault();
    var data = $( this ).serializeArray();

    var produto = $("#productu option:selected").text().toLowerCase().replace(' ', '').replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
    data.push({ name: "produto", value: produto});

    images.forEach(itemImage => {
        if (itemImage._id === $("#imagesu").val()){
            data.push({ name: "image_id", value: itemImage._id});
            data.push({ name: "name", value: build.name});
            data.push({ name: "url_image", value: itemImage.url_image});
            data.push({ name: "image_name", value: itemImage.image_name});
            data.push({ name: "image_tag", value: itemImage.image_tag});
        }
    });

    var iCount = 0;

    buildsToUpdate.forEach(buildItem => {

        var build = getBuildByName(buildItem[1].value);
        
        data.push({ name: "image_tag_old", value: build.image_tag});

        var image_tag_aux = data[6].value;
        var msgLog = "Atualização da Instância: " + build.name;

        updateJenkins(build.name, data).then( r => {
            if (r === true){

                var url = 'http://18.219.63.233:5000/build/updateImageTagAux/' + build._id + '/' + image_tag_aux;

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

                        iCount++;

                        if (iCount === buildsToUpdate.length) {

                            window.setTimeout( function() {
                                window.location.reload();
                            } , 1000);   
                        }

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

});


function updateStatus(jobName, status) {
    
    return new Promise(function (resolve, reject) {
        var url = 'http://18.219.63.233:5000/build/updateStatus/' + jobName + '/' + status + '/';
        
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


function updateJenkins(jobName, data) {
    
    return new Promise(function (resolve, reject) {
        try {

            updateStatus(jobName, "3").then( r => {
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


function updateStatus(jobName, status) {
    
    return new Promise(function (resolve, reject) {
        var url = 'http://18.219.63.233:5000/build/updateStatus/' + jobName + '/' + status + '/';
        
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
        var url = 'http://18.219.63.233:5000/build/checkBuild/' + item.instanceName + '/';

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
                                
                                var url = 'http://18.219.63.233:5000/build/' + item.id + "/";
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
                    
                                        dtDeployments.ajax.reload(); 
                    
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
        var url = 'http://18.219.63.233:5000/build/updateJenkins/' + build._id + "/";

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
