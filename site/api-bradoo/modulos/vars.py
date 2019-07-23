from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
from .worker import *


# Connect mongodb
con = MongoClient()
db = con['bradoo']

# create blueprint
var_s = Blueprint('vars', __name__, url_prefix='/vars/')

@var_s.route('<string:instanceName>', methods=['GET'])
def search_product(instanceName=None):
    """
    Busca de var_s por instância.

    :param instanceName:
    :return:
    """
    try:
        data = db.vars.find_one({"Nome da Instancia": str(instanceName)})

        if data:
            data["_id"] = str(data["_id"])

        return jsonify(data)

    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 404


@var_s.route('<string:id>/', methods=["PUT"])
def alterVars(id):
    data = format_data(request.json)
    try:
        update = {
            "DB_PASS": data['DB_PASS'],
            "PASS_ADMIN": data['PASS_ADMIN'],
            "PASS_ODOO": data['PASS_ODOO']
        }
        db.vars.update({"_id": ObjectId(id)}, {"$set": update})
        return jsonify({"status": True}), 200
    except Exception:
        return jsonify({"status": False}), 400
