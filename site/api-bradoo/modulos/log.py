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

    """
    try:
        data = request.json
        data = format_data(data)
        data['datetime'] = [datetime.now()]

        db.log.insert(data)
        return jsonify({"status": True}), 200
    except Exception:
        return jsonify({"status": False}), 400


@log.route('', methods=['GET'])
def list_log():

    """
    Busca do Log.

    """

    data = db.log.find().sort("datetime", -1)
    data = list(data)
    for x in data:
        x["_id"] = str(x['_id'])

        if not x.get("instancename"):
            x['instancename'] = ''

        if not x.get("cnpj"):
            x['cnpj'] = ''

        if not x.get("produto"):
            x['produto'] = ''

        if not x.get("image_tag_origem"):
            x['image_tag_origem'] = ''

        if not x.get("image_tag_destino"):
            x['image_tag_destino'] = ''

        if not x.get("status"):
            x['status'] = ''

    return jsonify(data)