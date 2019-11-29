# encoding = 'UTF-8'
__author__ = '_chao'

import os

if(os.getenv("ENV") == "production"):
    # 生产环境
    MONGO_DATA = {
        'host': '127.0.0.1',
        'port': 23550,
    }
else:
    # 开发环境
    MONGO_DATA = {
        'host': '127.0.0.1',
        'port': 27017,
    }

