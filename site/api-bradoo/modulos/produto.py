from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
from .worker import *


# Connect mongodb
con = MongoClient(host="localhost",port=27017)
db = con['bradoo']

# create blueprint
produto = Blueprint('produto', __name__, url_prefix='/produto/')

@produto.route('', methods=["POST"])
def registry_product():
    """
    Registro de produto no banco de dados.

    :return:
    """
    try:
        data = request.json
        data = format_data(data)
        db.products.insert(data)
        return jsonify({"status": True}), 201
    except Exception as ex:
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
        db.products.remove({"_id": ObjectId(id)})
        return jsonify({"status": True}), 200
    except Exception as ex:
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