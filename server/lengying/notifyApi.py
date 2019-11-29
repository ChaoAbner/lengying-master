# -*- coding:utf-8 -*-
__author__ = '_chao'

from .notifyConfig import RULE_CONFIG
from .models import Notify, UserNotifyQueue, SubscribeConfig, SubscribeNotify, Imgitem, User, Market
from django.core import serializers
from django.db.models import Q
import json
import re

findNum = re.compile('\d+')


class NotifyApi:
    def __init__(self):
        self.rule = RULE_CONFIG

    def createNotify(self, target_id = 'all', type = 1, sender_type = 2, target_type = 1,
                     **kwargs):
        """
        创建消息
        target_id: 消息作用的目标id          'all'作用于所有用户， 即发公告， 为用户id时，则是私信消息或者点赞等提醒
        target_type: 消息作用的对象类型        1 - 图片， 2 - 文章, 3 - 用户
        type: 消息类型                       0 - 公告，1 - 提醒， 2 - 私信
        sender_type: 消息发送者的类型         1 - 系统， 2 - 用户
        sender_id: 消息发送者的id
        :return:
        """
        self.notifyWords = kwargs
        try:
            notifyItem = Notify.objects.create(target_id = target_id, type = type, sender_type= sender_type, target_type = target_type,
                                               sender_id = self.notifyWords['sender_id'],content= self.notifyWords['content'],
                                               rule=self.rule[self.notifyWords['rule']])
            # targetItem = None
            # if target_type == 1:
            #     targetItem = Imgitem.objects.get(iid=target_id)

            # self.addUserNotifyQueue(notify_id=notifyItem.id, uid=targetItem.user.uid)
            return notifyItem

        except Exception as e:
            print(e)
            return {'error': 1, 'errMessage': e}

    def updateSubscribeConfig(self, uid, rule, is_valid = True):

        if SubscribeConfig.objects.filter(uid=uid, rule=self.rule[rule]).count():
            subItem = SubscribeConfig.objects.get(uid=uid, rule=self.rule[rule])
            subItem.is_valid = is_valid
            subItem.save()

        else:
            SubscribeConfig.objects.create(uid=uid, rule=self.rule[rule], is_valid=True)


    def addSubscribe(self, target_type = 1, **kwargs):
        self.subscribeKeywords = kwargs
        try:
            if not SubscribeNotify.objects.filter(uid = self.subscribeKeywords['uid'],rule=self.rule[self.subscribeKeywords['rule']], target_id=self.subscribeKeywords['target_id']).count():
                SubscribeNotify.objects.create(target_type = target_type, uid = self.subscribeKeywords['uid'],
                                                           rule=self.rule[self.subscribeKeywords['rule']],
                                                           target_id=self.subscribeKeywords['target_id'])
            else:
                print('已订阅此目标')
                return
        except Exception as e:
            print(e)

    @staticmethod
    def addUserNotifyQueue(notify_id, uid, rule, is_read = False):
        UserNotifyQueue.objects.create(notify_id = notify_id, rule=rule, uid = uid, is_read=is_read)


    @staticmethod
    def __getSerializeData(filterData):
        return json.loads(serializers.serialize("json", list(filterData)))

    def pullNotify(self, uid):
        """
        function: 拉消息
        先查用户消息配置表，
        再查用户消息订阅表，查出订阅的目标target_id
        通过target_id查消息表中的消息sender_id
        找出对应的消息即是用户订阅的内容
        再将取出的消息压入用户消息队列中(如果消息不存在的话)
        最后返回用户消息队列中所有的消息，通过notify_id找出对应的消息列表数据进行返回
        :return: dataList(消息列表)
        """
        # 查用户消息配置表
        userConfigData = self.getUserConfig(uid)
        # print(uid)
        # print(userConfigData)
        configDict = {}
        for c in userConfigData:
            # print(c)
            configDict[c['rule']] = c['is_valid']
        # 查用户消息订阅表
        userSubscribeData = self.getUserSubscription(uid)

        # 根据订阅配置表筛选并添加新的用户订阅消息数据列表
        notifyData = []
        # print('userSubscribeData')
        # print(userSubscribeData)
        for i in userSubscribeData:
            # 根据target_type判断是用户还是图片
            if i['rule'] != 'subscribe':
                filterData = Notify.objects.filter(sender_id=i['target_id'], rule=i['rule'])
                serialData = self.__getSerializeData(filterData)
                for s in serialData:
                    if configDict[s['fields']['rule']]:
                        s['fields']['id'] = s['pk']
                        notifyData.append(s['fields'])
        # print('notifyData')
        # print(notifyData)
        # 将新消息压入用户消息队列中
        for n in notifyData:
            if not UserNotifyQueue.objects.filter(notify_id=n['id'], uid=uid).count() and n['id'] != 1 and n['id'] != 2:
                self.addUserNotifyQueue(notify_id=n['id'], uid=uid, rule=n['rule'])

        # 查询目前用用户所有消息队列
        userQueue = UserNotifyQueue.objects.filter(~Q(rule='announce'), uid=uid, is_read=False)     # 非公告或私信
        announceQueue = UserNotifyQueue.objects.filter(rule='announce', uid=uid)                    # 公告和私信
        announceQueueSericalData = self.__getSerializeData(announceQueue)

        # print('announceQueueSericalData')
        # print(announceQueueSericalData)

        if userQueue.count() != 0:
            userQueueSerialData = self.__getSerializeData(userQueue)
            queueData = userQueueSerialData + announceQueueSericalData
            return self.getNotifyByQueue(queueData)
        else:
            return self.getNotifyByQueue(announceQueueSericalData)

    def getNotifyByQueue(self, queueSerialData):
        dataList = []
        senderExistList = []
        for u in queueSerialData:
            # 查出消息
            notify = Notify.objects.filter(id=u['fields']['notify_id'])
            if notify.count():
                notifySerialData = self.__getSerializeData(notify)
                # 过滤掉同用户的私信
                num_uid = int(''.join(findNum.findall(u['fields']['uid']))[:9])
                # print('num_uid')
                # print(num_uid)
                if not u['fields']['is_read']:
                    u['fields']['notify'] = notifySerialData[0]['fields']
                    # 根据消息sender_id 找出发送者信息

                    u['fields']['sender'] = self.__getUserInfoByID(notifySerialData[0]['fields']['sender_id'])
                    dataList.append(u['fields'])
                    senderExistList.append(notifySerialData[0]['fields']['sender_id'])
                    continue


                elif u['fields']['is_read'] and notifySerialData[0]['fields']['sender_id'] == num_uid  and \
                        notifySerialData[0]['fields']['rule'] == 'announce' and \
                        int(''.join(findNum.findall(notifySerialData[0]['fields']['target_id']))[:9]) not in senderExistList:
                    # 用户第一次通过私信主动发的消息
                    num_tid = int(''.join(findNum.findall(notifySerialData[0]['fields']['target_id']))[:9])
                    # print('num_tid')
                    # print(num_tid)
                    u['fields']['notify'] = notifySerialData[0]['fields']
                    u['fields']['notify']['sender_id'] = num_tid
                    if num_tid == 0:
                        continue
                    sender = self.__getUserInfoByID(num_tid)
                    if sender == {}:
                        continue
                    u['fields']['sender'] = sender
                    dataList.append(u['fields'])
                    senderExistList.append(num_tid)
                    continue

                elif notifySerialData[0]['fields']['rule'] == 'announce' and notifySerialData[0]['fields']['sender_id'] not in senderExistList and \
                        notifySerialData[0]['fields']['sender_id'] != num_uid :
                    senderExistList.append(notifySerialData[0]['fields']['sender_id'])

                elif notifySerialData[0]['fields']['rule'] == 'announce' and notifySerialData[0]['fields']['sender_id'] in senderExistList:
                    continue

                else:
                    continue

                u['fields']['notify'] = notifySerialData[0]['fields']
                # 根据消息sender_id 找出发送者信息
                sender = self.__getUserInfoByID(notifySerialData[0]['fields']['sender_id'])
                if sender == {}:
                    continue
                u['fields']['sender'] = sender
                dataList.append(u['fields'])

        return [i for i in sorted(dataList, key=lambda item: item['notify']['create_at'])]

    def getUserConfig(self, uid):
        userConfig = SubscribeConfig.objects.filter(uid=uid)
        if userConfig.count():
            configDataList = []
            userConfigSerialData = self.__getSerializeData(userConfig)
            for i in userConfigSerialData:
                configDataList.append(i['fields'])
            return configDataList

    def getUserSubscription(self, uid):
        userSubscription = SubscribeNotify.objects.filter(uid=uid)
        if userSubscription.count():
            subscribeDataList = []
            subscribeSerialData = self.__getSerializeData(userSubscription)
            for i in subscribeSerialData:
                subscribeDataList.append(i['fields'])
            return subscribeDataList

    def getTalkRecord(self, uid, talkToUid):
        allList = []

        # 获取当前用户发送的消息
        if talkToUid == '0':
            # 如果聊天对象是棱影小助手
            tMessageList = Notify.objects.filter(sender_id=795124090, target_id='all')
        else:
            num_talkToUid = int(''.join(findNum.findall(talkToUid))[:9])
            tMessageList = Notify.objects.filter(sender_id=num_talkToUid, target_id=uid, rule='announce')
        # 获取聊天对象发送的消息

        num_uid = int(''.join(findNum.findall(uid))[:9])
        uMessageList = Notify.objects.filter(sender_id=num_uid, target_id=talkToUid)

        serialTMessageList = self.__getSerializeData(tMessageList)
        serialUMessageList = self.__getSerializeData(uMessageList)

        if serialUMessageList != []:
            for u in serialUMessageList:
                u['fields']['notify_id'] = u['pk']
                allList.append(u['fields'])
        if serialTMessageList != []:
            for t in serialTMessageList:
                t['fields']['notify_id'] = t['pk']
                allList.append(t['fields'])

        for i in allList:
            i['sender'] = self.__getUserInfoByID(i['sender_id'])

        # 按发送时间排序
        return [i for i in sorted(allList, key=lambda item: item['create_at'])]


    def updateIsRead(self, uid, talkToUid):
        # 获取聊天对象的消息
        try:
            if talkToUid == '0':
                # 如果聊天对象是棱影小助手
                tMessageList = Notify.objects.filter(sender_id=795124090, target_id='all')
            else:
                num_talkToUid = int(''.join(findNum.findall(talkToUid))[:9])
                tMessageList = Notify.objects.filter(sender_id=num_talkToUid, target_id=uid, rule='announce')
            # 找出对应的聊天对象id
            tidList = []
            serialTMessageList = self.__getSerializeData(tMessageList)
            print('serialTMessageList')
            print(serialTMessageList)
            for t in serialTMessageList:
                tidList.append(t['pk'])
            # 通过消息id，将用户消息队列中的消息is_read字段设置为True
            print('tidList')
            print(tidList)
            for i in tidList:
                if UserNotifyQueue.objects.filter(uid=uid, notify_id=i, is_read=False).count():
                    UserNotifyQueue.objects.filter(uid=uid, notify_id=i, is_read=False).update(is_read = True)

        except Exception as e:
            return {'error': 1, 'errMessage': e}

    def testNotifyExist(self, target_type, target_id, type, sender_id, sender_type, content, rule):
        if Notify.objects.filter(target_type=target_type, target_id=target_id, type=type,
                                 sender_type=sender_type, sender_id=sender_id, content=content, rule=rule).count():
            return False
        return True

    def __getUserInfoByUID(self, uid):
        user = User.objects.filter(uid=uid)
        if user.count():
            return self.__getSerializeData(user)[0]['fields']
        return {}

    def __getUserInfoByID(self, id):
        user = User.objects.filter(id=id)
        if user.count():
            return self.__getSerializeData(user)[0]['fields']
        return {}

    def __getImgInfoByID(self, id):
        imgItem = Imgitem.objects.filter(id=id)
        if imgItem.count():
            serialImgItem = self.__getSerializeData(imgItem)[0]['fields']
            serialImgItem['user'] = self.__getSerializeData(User.objects.filter(id=imgItem[0].user.id))[0]['fields']
            return serialImgItem
        return []

    def __getImgInfoByIID(self, iid):
        imgItem = Imgitem.objects.filter(iid=iid)
        if imgItem.count():
            serialImgItem = self.__getSerializeData(imgItem)[0]['fields']
            # print('serialImgItem')
            # print(serialImgItem)
            serialImgItem['user'] = self.__getSerializeData(User.objects.filter(id=imgItem[0].user.id))[0]['fields']
            return serialImgItem
        return []

    def getRemind(self, uid, type, page, per_page):
        dataList = []
        # 找出该用户的消息队列中相应的作用类型
        try:
            queueData = UserNotifyQueue.objects.filter(uid=uid, rule=type)

            # 将对应的消息设置为已读
            queueData.update(is_read = True)
            queueData = queueData[page * per_page : (page + 1) * per_page]
            serialQueueData = self.__getSerializeData(queueData)

            # print('serialQueueData')
            # print(serialQueueData)
            # 通过数据中的消息id找出对应的消息
            for i in serialQueueData:
                notifyData = Notify.objects.filter(id=i['fields']['notify_id'])
                if notifyData.count():
                    serialNotifyData = self.__getSerializeData(notifyData)[0]['fields']
                    serialNotifyData['sender'] = self.__getUserInfoByID(id=serialNotifyData['sender_id'])
                    # 判断种类获取对应的目标信息 （图片，用户，文章）
                    # print('serialNotifyData')
                    # print(serialNotifyData)
                    if type == 'like' or type == 'comment':
                        # 为图片信息
                        imgItem = self.__getImgInfoByIID(serialNotifyData['target_id'])
                        serialNotifyData['target'] = imgItem
                    elif type == 'subscribe':
                        # 为用户信息
                        userItem = self.__getUserInfoByUID(uid=serialNotifyData['target_id'])
                        serialNotifyData['target'] = userItem
                    elif type == 'upload':
                        # 为图片信息
                        imgItem = self.__getImgInfoByID(serialNotifyData['target_id'])
                        serialNotifyData['target'] = imgItem
                    elif type == 'work':
                        # 为约拍信息
                        marketItem = Market.objects.filter(id=serialNotifyData['target_id'])
                        marketSeialData = self.__getSerializeData(marketItem)
                        marketSeialData[0]['fields']['id'] = marketSeialData[0]['pk']
                        serialNotifyData['target'] = marketSeialData[0]['fields']
                    else:
                        return []
                    # print('serialNotifyData')
                    # print(serialNotifyData)
                    dataList.append(serialNotifyData)

            return dataList

        except Exception as e:
            print(e)
            return {'error': 1, 'errMessage': e}

    def getNotify(self, senderID, targetID, rule):
        dataList = []
        notify = Notify.objects.filter(sender_id=senderID, target_id=targetID, rule=rule)
        serialNotify = self.__getSerializeData(notify)
        for s in serialNotify:
            dataList.append(s['fields'])
        return dataList

    def pushNotify(self):
        """
        推消息
        :return:
        """