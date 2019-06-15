#!/usr/bin/python


mongo_con = MongoClient('localhost',27017)

db = mongo_con['builds']


mycol.update({'name': (workerid)},{ '$set':{"#DATA":(day)}})

