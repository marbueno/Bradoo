from django.shortcuts import render
from kubernetes import client, config
from core.forms import JobForm, ImageForm, JobFormUpdate, ImageFormUpdate, ProductForm
import requests
import json

def refactor_id(data: list) -> list:
    for x in data:
        x["id"] = x.pop("_id")
    return data

# Configs can be set in Configuration class directly or using helper utility
config.load_kube_config()

def deployments_views(request):

    try:

        # Request output jenkins
        headers = {'Content-type': 'application/text'}
        headers2 = {'Content-type': 'application/json'}

        images = requests.get('http://192.168.177.232:5000/image/', headers=headers).json()
        products = requests.get('http://192.168.177.232:5000/produto/', headers=headers).json()
        builds = requests.get('http://192.168.177.232:5000/build/', headers=headers2).json()

        # form createjob
        formJob = JobForm()
        formUpdate = JobFormUpdate()
        formUpdateImage = ImageFormUpdate()
    
    except Exception as ex:
        print (ex)


    context = {
        "deployments": builds,
        "formJob": formJob,
        "formupdate": formUpdate,
        "images": refactor_id(images),
        'products': refactor_id(products),
        'formupdateimage': formUpdateImage
    }
    return render(request, 'containers/deployments.html', context)


def images_views(request):

    try:
        print('passo 1')

        form = ImageForm()

        print('passo 2')

        formUpdate = ImageFormUpdate

        print('passo 3')

        headers = {'Content-Type': 'application/json'}

        print('passo 4')

        images = requests.get('http://192.168.177.232:5000/image/', headers=headers).json()

        print('passo 5')

        products = requests.get('http://192.168.177.232:5000/produto/', headers=headers).json()

        print('passo 6')

        context = {
            'form': form,
            'images': refactor_id(images),
            'formupdate': formUpdate,
            'products': refactor_id(products)

        }

        print('passo 7')

        return render(request, 'images/index.html', context)

    except Exception as ex:
        print (ex)        


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
    products = requests.get('http://192.168.177.232:5000/produto/', headers=headers).json()

    context = {
        'formproduct': ProductForm,
        'products': refactor_id(products)
    }
    return render(request, 'products/index.html', context)

def bulk_update_views(request):

    products = requests.get('http://192.168.177.232:5000/produto/', headers={'Content-type': 'application/text'}).json()

    context = {
        'products': refactor_id(products)
    }


    return render(request, 'bulk_update/index.html', context)


def logs_views(request):

    return render(request, 'logs/index.html')
