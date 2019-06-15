from django.shortcuts import render
from kubernetes import client, config
from core.forms import JobForm, ImageForm, JobFormUpdate, ImageFormUpdate, ProductForm
import requests


def refactor_id(data: list) -> list:
    for x in data:
        x["id"] = x.pop("_id")
    return data



# Configs can be set in Configuration class directly or using helper utility
config.load_kube_config()

def deployments_views(request):

    # Request deployments
    v1 = client.ExtensionsV1beta1Api()
    deployments_kubernets = v1.list_deployment_for_all_namespaces()

    # Request output jenkins
    headers = {'Content-type': 'application/text'}
    output = requests.get('http://127.0.0.1:5000/jenkins/output/',
                          headers=headers).text
    output = output.split('\n')

    images = requests.get('http://127.0.0.1:5000/image/', headers=headers).json()
    products = requests.get('http://127.0.0.1:5000/produto/', headers=headers).json()

    deployments = []
    for deployment in deployments_kubernets.items:
        try:
            deploy = requests.get('http://127.0.0.1:5000/build/{}/'.format(deployment.metadata.name)).json()
            deploy['replicas'] = deployment.spec.replicas
            deploy['namespace'] = deployment.metadata.namespace
            deployments.append(deploy)
        except Exception as ex:
            continue

    # form createjob
    formJob = JobForm()
    formUpdate = JobFormUpdate()
    formUpdateImage = ImageFormUpdate
    context = {
        "deployments": deployments,
        "output_jenkins": output,
        "formJob": formJob,
        "formupdate": formUpdate,
        "images": refactor_id(images),
        'products': refactor_id(products),
        'formupdateimage': formUpdateImage,
    }
    return render(request, 'containers/deployments.html', context)


def images_views(request):
    form = ImageForm()
    formUpdate = ImageFormUpdate
    headers = {'Content-Type': 'application/json'}

    images = requests.get('http://127.0.0.1:5000/image/', headers=headers).json()
    products = requests.get('http://127.0.0.1:5000/produto/', headers=headers).json()

    context = {
        'form': form,
        'images': refactor_id(images),
        'formupdate': formUpdate,
        'products': refactor_id(products)

    }
    return render(request, 'images/index.html', context)


def list_pods(request):

    # Request Pods
    v1_pods = client.CoreV1Api()
    pods = v1_pods.list_pod_for_all_namespaces(watch=False)
    context = {
            "pods": pods.items
    }
    return render(request, 'pods/pods.html', context)


def products_views(request):
    headers = {'Content-Type': 'application/json'}
    products = requests.get('http://127.0.0.1:5000/produto/', headers=headers).json()

    context = {
        'formproduct': ProductForm,
        'products': refactor_id(products)
    }
    return render(request, 'products/index.html', context)

def bulk_update_views(request):
    headers = {'Content-Type': 'application/json'}

    deployments = requests.get('http://127.0.0.1:5000/build/', headers=headers).json()
    context = {
        "deployments": deployments
    }
    return render(request, 'bulk_update/index.html', context)
