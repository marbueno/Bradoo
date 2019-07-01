from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from jenkins import Jenkins
from kubernetes import client, config
from datetime import datetime

from bson import ObjectId
from .worker import *
import os


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
        # Executa build para destruir deployment
        con_j = connect_jenkins()
        con_j.build_job('Destroy_Odoo', {"name": job_name})

        # Guarda um historico de builds removidos do banco de dados
        db.buildsdeath.insert(db.builds.find_one({"name": job_name}))
        db.builds.remove({"name": job_name})

        return jsonify({"status": True}), 200
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
        # formata json recebido
        data = format_data(request.json)

        print ('BUILD em Andamento')

        # Executa o build de create no jenkins
        con_j = connect_jenkins()

        build_id = con_j.get_job_info('Deploy_Odoo')['nextBuildNumber']
        
        con_j.build_job('Deploy_Odoo', data)

        # Registra build no banco de dados
        data['date_update'] = [datetime.now()]

        if build_id:
            data['build_id'] = str(build_id)
        
        db.builds.insert(data)
        return jsonify({"status": True}), 200
    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 400

@deployment.route('<string:id>/', methods=["PUT"])
def update_build(id):
    try:
        # formata json recebido
        data = format_data(request.json)

        # Executa o build de create no jenkins
        con_j = connect_jenkins()
        con_j.build_job('Upgrade_Odoo', data)

        # Registra updatebuild no banco de dados
        updateBuild = {
            "cnpj_cpf": data['cnpj_cpf'],
            "nome_razaosocial": data['nome_razaosocial'],
            "login": data['login'],
            'password': data['password'],
            'typedb': data['typedb'],
            'date_update': datetime.now()
        }

        db.builds.update({"_id": ObjectId(id)}, {"$set": updateBuild})

        return jsonify({"status": True}), 200
    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 400


@deployment.route('backup/<string:job_name>/', methods=["POST"])
def backup_odoo(job_name):
    try:
        # executa build de backup do deployment
        con_j = connect_jenkins()
        con_j.build_job('Backup_Odoo', {"name": job_name})
        print('action', job_name)

        return jsonify({"status": True}), 200
    except Exception as ex:
        return jsonify({"error": ex}), 500


@deployment.route('log/<string:build_id>/', methods=['GET'])
def build_log(build_id):
    try:

        # Traz o log da Build
        con_j = connect_jenkins()
        info = con_j.get_build_console_output('Deploy_Odoo', int(build_id))

        return info
    except Exception as ex:
        return jsonify({"error": ex}), 500