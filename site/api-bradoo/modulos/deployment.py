from flask import Blueprint, jsonify, request, send_file
from pymongo import MongoClient
from jenkins import Jenkins
from kubernetes import client, config
from datetime import datetime

from bson import ObjectId
from .worker import *
import os
import io
import glob
import odoorpc
import zipfile


# Connect mongodb
# con = MongoClient()
con = MongoClient()
db = con['bradoo']

config.load_kube_config()
def connect_jenkins():
    con = Jenkins('http://18.219.63.233:8080/', username='vitorlavor', password='1149e0e4346bb060c9b277d6294080fdc4')
    return con

# create blueprint
deployment = Blueprint('', __name__, url_prefix='/build/')

@deployment.route('rollback/<string:job_name>/', methods=['POST'])
def build_rollback(job_name):
    try:
        # executa build de rollback do deployment
        con_j = connect_jenkins()
        con_j.build_job('Rollback_Odoo', {"name": job_name, "value": "last"})

        print(job_name)

        return jsonify({"status": True}), 200
    except Exception as ex:
        return jsonify({"error": ex}), 500


@deployment.route('<string:job_name>/', methods=["DELETE"])
def build_destroy(job_name):
    try:

        build = db.builds.find_one({"name": job_name})

        if build:

            # Executa build para destruir deployment
            con_j = connect_jenkins()
            con_j.build_job('Destroy_Odoo', {"name": build['name'], "produto": build['produto'], "typedb": build['typedb']})

            # Guarda um historico de builds removidos do banco de dados
            db.buildsdeath.insert(build)
            db.builds.remove({"name": job_name})

            return jsonify({"status": True}), 200
        else:
            return jsonify({"status": False}), 400

    except Exception as ex:
        return jsonify({"error": ex}), 500


@deployment.route('', methods=["GET"])
@deployment.route('<string:job_name>/', methods=["GET"])
def consult_build(job_name=None):
    """
    Busca de Builds Existentes ou todos os builds.
    :param job_name:
    :return:
    """
    if job_name:
        job = db.builds.find_one({"name": job_name})
        if job:
            result = db.builds.find_one({"name": job_name})
            result['_id'] = str(result['_id'])

            if result["product"] != "None":
                dataProduct = db.products.find_one({"_id": ObjectId(result["product"])})

                if dataProduct:
                    result["product_name"] = str(dataProduct["product"])

            return jsonify(result), 200
        else:
            return jsonify({"status": "job não localizado"}), 204
    else:
        jobs = list(db.builds.find())
        for job in jobs:
            job['_id'] = str(job['_id'])

            if job["product"] != "None":
                dataProduct = db.products.find_one({"_id": ObjectId(job["product"])})
                if dataProduct:
                    job["product_name"] = str(dataProduct["product"])

        return jsonify(jobs), 200


@deployment.route('', methods=["POST"])
def register_build():
    """
    Registro de builds realizados e deploy no jenkins.
    :param:
    :return:
    """
    try:
        msgValidations = ""
        
        print (request.json)

        ## formata json recebido
        data = format_data(request.json)

        if (not data.get("product")
        or not data.get("image")
        or not data.get("name")
        or not data.get("cnpj_cpf")
        or not data.get("nome_razaosocial")
        or not data.get("login")
        or not data.get("password")
        or not data.get("typedb")):
            msgValidations = "Favor informar todos os campos obrigatórios"
            
        if not msgValidations:

            print ('BUILD em Andamento')

            data['name'] = str(data['name']).lower()

            dataProduct = db.products.find_one({"_id": ObjectId(data["product"])})

            if dataProduct:
                data["dominio"] = dataProduct["domain"]

            # Executa o build de create no jenkins
            con_j = connect_jenkins()

            build_id = con_j.get_job_info('Deploy_Odoo')['nextBuildNumber']
            
            con_j.build_job('Deploy_Odoo', data)

            ## Registra build no banco de dados
            data['date_update'] = [datetime.now()]

            if build_id:
                data['build_id'] = str(build_id)
            
            db.builds.insert(data)
            return jsonify({"status": True}), 200
        else:
            return jsonify({"Validation": msgValidations}), 406
    except Exception as ex:
        return jsonify({"status": False}), 400

@deployment.route('<string:id>/', methods=["PUT"])
def update_build(id):
    try:

        dataBuild = db.builds.find_one({"_id": ObjectId(id)})

        if dataBuild:

            dataImage = db.images.find_one({"image_tag": dataBuild['image_tag_aux']})

            if dataImage:

                if dataBuild['image_tag_aux'] == "online-error":
                    var = db.vars.find_one({"Nome da Instancia": dataBuild['name']})

                    if var:
                        updateImageTagBuild = {
                            "image_tag": var['tag'],
                            "date_update": datetime.now()
                        }
                        db.builds.update({"name": dataBuild['name']}, {"$set": updateImageTagBuild})
                else:

                    # Registra updatebuild no banco de dados
                    updateBuild = {
                        "image_tag": dataBuild['image_tag_aux'],
                        "date_update": datetime.now()
                    }

                    db.builds.update({"_id": ObjectId(id)}, {"$set": updateBuild})        

        return jsonify({"status": True}), 200
    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 400


@deployment.route('updateImageTagAux/<string:id>/<string:image_tag>', methods=["PUT"])
def updateImageTagAux(id, image_tag):
    try:
        # formata json recebido
        data = format_data(request.json)
        print (data)

        updateBuild = {
            "image_tag_aux": data['image_tag']
        }

        db.builds.update({"_id": ObjectId(id)}, {"$set": updateBuild})

        build = db.builds.find_one({"_id": ObjectId(id)})

        if build:
            updateStatus = {
                "Status": "update"
            }
            db.vars.update({"Nome da Instancia": build['name']}, {"$set": updateStatus})

        return jsonify({"status": True}), 200
    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 400


@deployment.route('backup/', methods=["POST"])
def backup_odoo():

    try:
        data = format_data(request.json)

        print (data)

        # Prepare the connection to the server
        odoo = odoorpc.ODOO(data['dns'], port=80)

        # Change timeout
        timeout_backup = odoo.config['timeout']
        odoo.config['timeout'] = 600    # Timeout set to 10 minutes

        dump = odoo.db.dump('4YDqkVZJhHNs', data['dbname'])
        print ("Backup efetuado com sucesso!")

        # Rechange timeout
        odoo.config['timeout'] = timeout_backup
        fileN = data['dbname'] + datetime.now().strftime("%Y_%m_%d_%H_%M_%S") + '.zip'
        fileName = 'backupfiles/' + fileN
        zipf = zipfile.ZipFile(fileName, 'w')
        with open(fileName, 'wb') as dump_zip:
            dump_zip.write(dump.read())

        zipf.close()
        
        return jsonify({"status": True}), 200

    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 400


@deployment.route('log/<string:build_id>/', methods=['GET'])
def build_log(build_id):
    try:

        # Traz o log da Build
        con_j = connect_jenkins()
        info = con_j.get_build_console_output('Deploy_Odoo', int(build_id))

        return info
    except Exception as ex:
        return jsonify({"error": ex}), 500


@deployment.route('getBuilds/', methods=["GET"])
def getBuilds():
    """
    Retorna lista dos Builds.
    :param job_name:
    :return:
    """
    deployments = []

    v1 = client.ExtensionsV1beta1Api()
    deployments_kubernets = v1.list_deployment_for_all_namespaces()

    for deployment in deployments_kubernets.items:
        try:

            job = db.builds.find_one({"name": deployment.metadata.name})
            if job:
                # result = db.builds.find_one({"name": job_name})
                job['_id'] = str(job['_id'])

                if job["product"] != "None":
                    dataProduct = db.products.find_one({"_id": ObjectId(job["product"])})

                    if dataProduct:
                        job["product_name"] = str(dataProduct["product"])
                        job["product_domain"] = str(dataProduct["domain"])

            job['url'] = ''
            job['replicas'] = deployment.spec.replicas
            job['namespace'] = deployment.metadata.namespace

            if not any(d['name'] == deployment.metadata.name for d in deployments):
                deployments.append(job)

        except Exception as ex:
            continue    

    v1_pods = client.CoreV1Api()
    pods = v1_pods.list_pod_for_all_namespaces(label_selector="app.kubernetes.io/instance", watch=False)
    pods_aux = pods.items

    for deployment in deployments:

        if deployment['image_tag'] == "online-error":
            var = db.vars.find_one({"Nome da Instancia": deployment['name']})

            if var:
                updateImageTagBuild = {
                    "image_tag": var['tag']
                }
                db.builds.update({"name": deployment['name']}, {"$set": updateImageTagBuild})


        for pod in pods_aux:
            try:

                if deployment['name'] == pod.metadata.labels['app.kubernetes.io/instance']:
                    deployment['pod_name'] = pod.metadata.name
                    deployment['namespace'] = pod.metadata.namespace

            except Exception as ex:
                print (ex)

    # Adiciona os registros que estão em construção
    for jobsEmConstrucao in db.builds.find({ "status": "2" }):
        jobsEmConstrucao['_id'] = str(jobsEmConstrucao['_id'])

        if jobsEmConstrucao["product"] != "None":
            dataProduct = db.products.find_one({"_id": ObjectId(jobsEmConstrucao["product"])})

            if dataProduct:
                jobsEmConstrucao["product_name"] = str(dataProduct["product"])

        if not any(d['name'] == jobsEmConstrucao['name'] for d in deployments):
            deployments.append(jobsEmConstrucao)

    return jsonify(deployments), 200


@deployment.route('checkBuild/<string:job_name>/', methods=["GET"])
def checkBuild(job_name=None):
    """
    Verifica Status de construção do build no Jenkins.
    :param job_name:
    :return:
    """
    if job_name:

        var = db.vars.find_one({"Nome da Instancia": job_name})

        if var:
            if var['Status'] == 'update':
                return jsonify({"replica": -1}), 200
            else:
                return jsonify({"replica": 1}), 200
        else:
            return jsonify({"replica": -1}), 200

@deployment.route('updateStatus/<string:job_name>/<string:status>/', methods=["PUT"])
def updateStatus(job_name, status):
    try:

        # Executa o build de create no jenkins
        updateStatusBuild = {
            "status": str(status)
        }

        db.builds.update({"name": str(job_name) }, {"$set": updateStatusBuild})

        return jsonify({"status": True}), 200
    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 400


@deployment.route('updateJenkins/<string:build_id>/', methods=["PUT"])
def updateJenkins(build_id):
    try:
        print ("Update Jenkins")
        
        data = format_data(request.json)

        print (data)

        con_j = connect_jenkins()
        con_j.build_job('Upgrade_Odoo', data)

        print ("Atualizando Jenkins")

        return jsonify({"status": True}), 200
    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 400


@deployment.route('/download/<string:instanceName>', methods=["GET"])
def downloadFile (instanceName):

    try:
        files = glob.glob("backupfiles/" + instanceName + "*.zip")
        files.sort(key=os.path.getmtime)

        fileDownload = ""
        for file in files:
            fileDownload = file

        if fileDownload:
            return send_file(fileDownload, as_attachment=True, mimetype='application/zip', attachment_filename=instanceName + '.zip')
        else:
            return jsonify({"status": False}), 400
    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 400