from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
from .worker import *
import io
import os


# Connect mongodb
# con = MongoClient(host="localhost",port=27017)
con = MongoClient()
db = con['bradoo']


# create blueprint
image = Blueprint('image', __name__, url_prefix='/image/')

baseFilePath = os.path.abspath('')


@image.route('', methods=["POST"])
def register_image():
    """
    Registra imagem no banco de dados referenciando id  do produto.

    :return:
    """
    try:
        data = format_data(request.json)

        id_mod_bd_prd = data['id_mod_bd_prd']
        id_mod_bd_demo = data['id_mod_bd_demo']

        if id_mod_bd_prd != '':
            id_mod_bd_prd = baseFilePath + '/filesUploaded/' + id_mod_bd_prd
            data['id_mod_bd_prd'] = id_mod_bd_prd

        if id_mod_bd_demo != '':
            id_mod_bd_demo = baseFilePath + '/filesUploaded/' + id_mod_bd_demo
            data['id_mod_bd_demo'] = id_mod_bd_demo

        # data = request.json
        db.images.insert(data)
        return jsonify({"status": True}), 200
    except Exception:
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

        build = db.builds.find_one({"image": str(id) })
        if build:
            return jsonify({"status": "-1"}), 404
        else:
            db.images.remove({"_id": ObjectId(id)})

            return jsonify({"status": True}), 200

    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 404

@image.route('<string:id>/', methods=["PUT"])
def update_image(id):
    data = format_data(request.json)
    try:
        
        id_mod_bd_prd = data['id_mod_bd_prd']
        id_mod_bd_demo = data['id_mod_bd_demo']

        if id_mod_bd_prd != '' and 'filesUploaded' not in id_mod_bd_prd:
            id_mod_bd_prd = baseFilePath + '/filesUploaded/' + id_mod_bd_prd

        if id_mod_bd_demo != '' and 'filesUploaded' not in id_mod_bd_demo:
            id_mod_bd_demo = baseFilePath + '/filesUploaded/' + id_mod_bd_demo

        update = {
            "image_name": data['image_name'],
            "image_tag": data['image_tag'],
            "url_image": data['url_image'],
            'product': data['product'],
            'id_mod_bd_prd': id_mod_bd_prd,
            'id_mod_bd_demo': id_mod_bd_demo
        }

        db.images.update({"_id": ObjectId(id)}, {"$set": update})

        return jsonify({"status": True}), 200

    except Exception as ex:
        print (ex)
        return jsonify({"status": False}), 400



@image.route('/uploadFile', methods=["POST"])
def file_upload():
    try:
        print (request.files)

        for flName in request.files:
    
            if flName:
                file = request.files[flName]
                
                filePath = baseFilePath + '/filesUploaded/' + flName

                print (filePath)

                file.save(filePath)

        return jsonify({"status": True}), 200
        
    except Exception as ex:
        print ('erro')
        print (ex)
        return jsonify({"status": False}), 400
