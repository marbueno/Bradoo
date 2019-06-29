from flask import Flask, request, jsonify
from pymongo import MongoClient
from jenkins import Jenkins
from flask_cors import CORS
from kubernetes import client, config
from modulos import *


config.load_kube_config()
def connect_jenkins():
    con = Jenkins('http://18.219.63.233:8080/', username='vitorlavor', password='1149e0e4346bb060c9b277d6294080fdc4')
    return con

def desconnect_jenkins(con):
    con.close()


app = Flask(__name__)
CORS(app)


# Register blueprint
app.register_blueprint(produto)
app.register_blueprint(image)
app.register_blueprint(deployment)


# app.register_blueprint(jenkins)

# Connect mongodb
con = MongoClient(host="localhost",port=27017)
db = con['bradoo']





@app.route('/jenkins/output/', methods=['GET'])
def last_build():
    """
    Last build info.

    :return:
    """
    try:
        con_j = connect_jenkins()
        number = con_j.get_job_info('Deploy_Odoo')['lastCompletedBuild']['number']
        info = con_j.get_build_console_output('Deploy_Odoo', number)
        return info
    except Exception as ex:
        return jsonify({"erro": ex}), 500



@app.route('/scale/', methods=["POST"])
def scale_pods():
    data = request.form
    try:
        for key in data.keys():
            break
        scale = key.split('@@')

        v1 = client.AppsV1Api()
        if int(scale[-1]):
            body = {"spec": {"replicas": 0}}
            v1.patch_namespaced_deployment_scale(name=scale[0], namespace=scale[1], body=body)
        else:
            body = {"spec": {"replicas": 1}}
            v1.patch_namespaced_deployment_scale(name=scale[0], namespace=scale[1], body=body)
        return jsonify({'status': "scale success!"}), 200
    except Exception:
        return jsonify({'status': "error scale!"}), 500


@app.route('/log/', methods=["POST"])
def log_pod():
    api_instance = client.CoreV1Api()
    try:
        data = request.get_json()
        api_response = api_instance.read_namespaced_pod_log(data['name'], data['namespace'], tail_lines=20, pretty=True)
        return api_response, 200
    except Exception as e:
        print(e)
        return jsonify({'status': 'falha ao ler log'}), 500


if __name__ == "__main__":
    app.run(debug=False, port=5000, host='127.0.0.1')
