# encoding = 'UTF-8'
__author__ = '_chao'

from .db import mongo_client

# 初始化客户端
Client = mongo_client()


class MongoModel(object):
    def __init__(self, db_name):
        self.client = Client
        self.db = self.client[db_name]

    def get_db_by_name(self):
        return self.db


# blog数据库
class Blog(MongoModel):

    def __init__(self, db_name = 'blog'):
        super().__init__(db_name)
        self.db = super().get_db_by_name()

    def contact(self):
        """
        博客联系的POST信息
        :return:
        """
        # 创建contact表
        # contact = self.client.contact
        return self.db.contact

    def traffic_count(self):
        # traffic_count = self.client.traffic_count
        return self.db.contact.traffic_count

# 棱影数据库
class Lengying(MongoModel):

    def __init__(self, db_name = 'unsplash'):
        super().__init__(db_name)
        self.db = super().get_db_by_name()

    def com_like(self):
        # 点赞
        return self.db.com_like

    def com_like_userinfo(self):
        # 被点赞用户的信息
        return self.db.com_like_userinfo

    def com_comment(self):
        # 评论
        return self.db.com_comment

    def com_subscribe(self):
        # 用户关注者id
        return self.db.com_subscribe

    def com_subscribe_userinfo(self):
        # 用户关注者信息
        return self.db.com_subscribe_userinfo

    def com_fans(self):
        # 用户粉丝id
        return self.db.com_fans

    def com_fans_userinfo(self):
        # 用户粉丝信息
        return self.db.com_fans_userinfo

    def com_user_coll(self):
        # 用户的影集
        return self.db.com_user_coll

    def com_coll_con(self):
        # 储存影集中包含的图片id
        return self.db.com_coll_con

    def com_coll_imgItem(self):
        # 储存影集中包含的图片信息
        return self.db.com_coll_imgItem
