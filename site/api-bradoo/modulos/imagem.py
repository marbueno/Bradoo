from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
from .worker import *


# Connect mongodb
con = MongoClient()
db = con['bradoo']


# create blueprint
image = Blueprint('image', __name__, url_prefix='/image/')


@image.route('', methods=["POST"])
def register_image():
    """
    Registra imagem no banco de dados referenciando id  do produto.

    :return:
    """
    try:
        data = request.json
        db.images.insert(format_data(data))
        return jsonify({"status": True}), 200
    except Exception as ex:
        return jsonify({"status": False}), 400


@image.route('', methods=["GET"])
@image.route('<string:id>/', methods=["GET"])
def list_image(id=None):
    """
    Busca imagens cadastradas no banco de dados.

    :param id:
    :return:
    """
    if id:
        data = db.images.find_one({"_id": ObjectId(id)})
        data["_id"] = str(data["_id"])
        return jsonify(data)
    else:
        data = db.images.find()
        data = list(data)
        for x in data:
            
            x["_id"] = str(x["_id"])

            if x["product"] != "None":
                dataProduct = db.products.find_one({"_id": ObjectId(x["product"])})

                if dataProduct:
                    x["product_name"] = str(dataProduct["product"])

        return jsonify(data)

@image.route("<string:id>/", methods=["DELETE"])
def remove_image(id):
    """
    Deleta imagem do banco de dados.

    :param id:
    :return:
    """
    try:
        db.images.remove({"_id": ObjectId(id)})
        return jsonify({"status": True}), 200
    except Exception as ex:
        return jsonify({"status": False}), 404

@image.route('<string:id>/', methods=["PUT"])
def update_image(id):
    data = format_data(request.json)
    try:
        update = {
            "image_name": data['image_name'],
            "image_tag": data['image_tag'],
            "url_image": data['url_image'],
            'product': data['product'],
            'typedb': data['typedb']
        }
        db.images.update({"_id": ObjectId(id)}, {"$set": update})
        return jsonify({"status": True}), 200
    except Exception as ex:
        return jsonify({"status": False}), 400


# @image.route('', methods=['POST', 'GET', 'DELETE', 'PUT'])
# @image.route('<string:name>/', methods=["GET"])
# def register_image(name=None):
#     """
#     Realiza CRUD de imagens.
#
#     :param name:
#     :return:
#     """
#     if request.method == "POST":
#         try:
#             data = request.form
#             db.images.insert(
#                 {
#                     "url_image": data['url_image'],
#                     "image_name": data['image_name'],
#                     "image_tag": data['image_tag'],
#                     "comments": data['comments'],
#                 })
#             return jsonify({'status': True}), 200
#         except Exception as e:
#             return jsonify({'status': e}), 500
#     elif request.method == "GET":
#         if not name:
#             imgs = list(db.images.find())
#             for img in imgs:
#                 img['_id'] = str(img['_id'])
#             return jsonify(imgs), 200
#         else:
#             img = db.images.find_one({"image_name": name})
#             img['_id'] = str(img['_id'])
#             return jsonify(img), 200
#
#     elif request.method == "DELETE":
#         data = request.form
#         try:
#             db.images.remove({"image_name": data['image']})
#             return jsonify({"status": True}), 200
#         except Exception as e:
#             return jsonify({"status": e}), 500
#
#     elif request.method == "PUT":
#         data = request.form
#         try:
#             update = {
#                 "image_name": data['image_nameu'],
#                 "image_tag": data['image_tagu'],
#                 "comments": data['commentsu'],
#                 "url_image": data['url_imageu']
#             }
#             db.images.update({"image_name": data['image_name']}, {"$set": update})
#             return jsonify({"status": True}), 200
#         except Exception as e:
#             return jsonify({"status": False}), 500