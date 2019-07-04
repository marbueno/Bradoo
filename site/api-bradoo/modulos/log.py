from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from datetime import datetime
from .worker import *


# Connect mongodb
con = MongoClient()
db = con['bradoo']

# create blueprint
log = Blueprint('log', __name__, url_prefix='/log/')

@log.route('', methods=["POST"])
def registry_log():
    """
    Registro de log no banco de dados.

    :return:
    """
    try:
        data = request.json
        data = format_data(data)
        data['datetime'] = [datetime.now()]

        db.log.insert(data)
        return jsonify({"status": True}), 200
    except Exception as ex:
        return jsonify({"status": False}), 400


@log.route('', methods=['GET'])
def list_log():

    """
    Busca do Log.

    :param id:
    :return:
    """

    data = db.log.find().sort("datetime", -1)
    data = list(data)
    for x in data:
        x["_id"] = str(x['_id'])
    return jsonify(data)