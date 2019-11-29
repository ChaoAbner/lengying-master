# encoding = 'UTF-8'
__author__ = '_chao'

import pymongo
from .config import MONGO_DATA


def mongo_client():
    return pymongo.MongoClient(MONGO_DATA['host'], MONGO_DATA['port'])




