from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from jenkins import Jenkins
from bson import ObjectId
from .worker import *


# Connect mongodb
con = MongoClient()
db = con['bradoo']

# create blueprint
produto = Blueprint('produto', __name__, url_prefix='/produto/')

def connect_jenkins():
    con = Jenkins('http://18.219.63.233:8080/', username='vitorlavor', password='1149e0e4346bb060c9b277d6294080fdc4')
    return con

@produto.route('', methods=["POST"])
def registry_product():
    """
    Registro de produto no banco de dados.

    :return:
    """
    try:
        data = request.json
        data = format_data(data)
        data['produto'] = data['product']
        data['dominio'] = data['domain']

        con_j = connect_jenkins()
        con_j.build_job('Create_Domain', data)

        db.products.insert(data)

        return jsonify({"status": True}), 201
    except Exception:
        return jsonify({"status": False}), 400


@produto.route('<string:id>', methods=['GET'])
@produto.route('', methods=['GET'])
def search_product(id=None):
    """
    Busca de produto registrando.

    :param id:
    :return:
    """
    if id:
        data = db.products.find_one({"_id": id})
        if data:
            data["_id"] = str(data["_id"])
            return jsonify(data)
        else:
            return jsonify({"status": False}), 404
    else:
        data = db.products.find()
        data = list(data)
        for x in data:
            x["_id"] = str(x['_id'])
        return jsonify(data)

@produto.route('<string:id>/', methods=["DELETE"])
def remove_product(id):
    """
    Deleta produto do banco de dados.

    :param id:
    :return:
    """
    try:
        build = db.builds.find_one({"product": str(id) })
        if build:
            return jsonify({"status": "-1"}), 404
        else:
            db.products.remove({"_id": ObjectId(id)})

            return jsonify({"status": True}), 200

    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 404


@produto.route('<string:id>/', methods=["PUT"])
def alter_product(id):
    data = format_data(request.json)
    try:
        update = {
            "product": data['product'],
            "domain": data['domain'],
            "server": data['server']
        }
        db.products.update({"_id": ObjectId(id)}, {"$set": update})
        return jsonify({"status": True}), 200
    except Exception as ex:
        return jsonify({"status": False}), 400
