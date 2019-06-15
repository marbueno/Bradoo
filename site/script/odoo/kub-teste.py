#!/usr/bin/python3.6

from kubernetes import client, config

#pretty='pretty'
# Configs can be set in Configuration class directly or using helper utility
config.load_kube_config()
#v1 = client.CoreV1Api()
v1 = client.CoreV1Api ()
print("DEscribe Pod:")
#ret = v1.list_pod_for_all_namespaces(watch=False)
ret = v1.read_namespaced_pod("teste09-odoo-d5f585d7-twwjb","default")
print (ret)
#for i in ret.items
#for i in ret.items:
    #print("%s\t%s\t%s" % (i.status.pod_ip, i.metadata.namespace, i.metadata.name))
