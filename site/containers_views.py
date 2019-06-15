from django.shortcuts import render, HttpResponseRedirect
from kubernetes import client, config
from core.forms import JobForm
import requests
import json

# Configs can be set in Configuration class directly or using helper utility
config.load_kube_config()
<<<<<<< HEAD
con_j = Jenkins('http://127.0.0.1:8080', username='vitorlavor',password='11ca650f318c8f5d6e84d1c15a14c5d38b')

=======
>>>>>>> e5a9131bdb6827845a16f0997cb7fcb3ccc66e7a

def get_containers(request):
    v1 = client.CoreV1Api()
    ret = v1.list_pod_for_all_namespaces(watch=False)
    context = {
        "pods": ret.items
    }
    return render(request, 'containers/pods.html', context)


def create_containers(request):
    if request.method == "GET":
        form = JobForm()
    elif request.method == "POST":
        form = JobForm(request.POST)
        if form.is_valid():
            parametros = {}
            for field in form.fields:
                parametros[field] = request.POST[field]
            # Post api rest bradoo
            headers = {'Content-type': 'application/json'}
<<<<<<< HEAD
            requests.post('http://127.0.0.1:5000/builds', data=json.dumps(parametros), headers=headers)

            # build deploy
            con_j.build_job('Deploy_Odoo', parametros)
=======
            requests.post('http://127.0.0.1:5000/builds/{}/'.format(parametros['name']), data=json.dumps(parametros),
                          headers=headers)
>>>>>>> e5a9131bdb6827845a16f0997cb7fcb3ccc66e7a
            return HttpResponseRedirect("/")
        else:
            return render(request, 'containers/create-pods.html', {"form": form})
    return render(request, 'containers/create-pods.html', {"form": form})
