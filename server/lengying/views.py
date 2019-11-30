from django.http import HttpResponse, Http404
from django.shortcuts import render, redirect
from django.core import serializers
from django.db.models import Max
from .models import User as LengyingUser, Imgitem, Tags,\
                            Feedback, Contact, Collections, Notify, \
                            UserGeoinfo, Postcard,ReceiveCard,Market, Activity,DESCRIPTION
from .notifyApi import NotifyApi
from .notifyConfig import RULE_CONFIG
from mongo import model
from mongo.model import Lengying
from .user_agent import USER_AGENT_LIST
# Create your views here.
from .universityData import university
import requests, json, datetime, random

import re, time, geohash, math

def json_loads(obj):
    return json.loads(obj)

def json_dumps(obj):
    return json.dumps(obj)

findNum = re.compile('\d+')

headers = {
    'User-Agent': random.choice(USER_AGENT_LIST)
}


def lengying_get_random(request):
    per_page = int(request.GET.get('per_page'))
    page = int(request.GET.get('page'))


    imgCount = Imgitem.objects.filter(isPassed__exact=True, isPrivate__exact=False, featured__exact=True).count()
    try:
        data_querySet = Imgitem.objects.filter(isPassed__exact=True, isPrivate__exact=False, featured__exact=True)
        data_querySet = data_querySet[(page - 1) * per_page : page * per_page]
        print(data_querySet)
        if len(data_querySet) != 0:
            all_Data_list = []
            img_serial_data = json_loads(serializers.serialize("json", list(data_querySet)))
            for i in img_serial_data:
                user_querySet = list(LengyingUser.objects.filter(id=i['fields']['user']))
                user_serial_data = json_loads(serializers.serialize("json", user_querySet))[0]
                i['fields']['user'] = user_serial_data['fields']
                i['fields']['user']['tags'] = get_info_tags(i['fields']['user']['tags'])
                i['fields']['tags'] = get_info_tags(i['fields']['tags'])
                all_Data_list.append(i['fields'])

            # print(all_Data_list)
            return HttpResponse(json.dumps(all_Data_list))

        else:
            if imgCount % per_page != 0:
                page = page - (int(imgCount / per_page) + 1)
            else:
                page = page - (imgCount / per_page)
            url = 'https://www.unsplash.com/napi/photos?page={}&per_page={}'.format(str(page), str(per_page))
            print('start requests')
            while (1):
                last_time = datetime.datetime.now()
                try:
                    res = requests.get(url, headers=headers, timeout=3)
                    new_time = datetime.datetime.now()
                    print('use time --' + str(new_time - last_time))
                    if (res.status_code == 200):
                        return HttpResponse(res.text)
                except:
                    pass
    except Exception as e:
        print(e)
        return HttpResponse(e)


def lengying_get_coll(request):
    colls = model.unsplash.unspl_coll
    search_colls = []
    for coll in colls.find():
        coll.pop('_id')
        search_colls.append(coll)
        if len(search_colls) == 8:
            break
    return HttpResponse(json.dumps(search_colls))

def back_search_result(request):
    """
    找到的是各自的总数，还有每项先返回回来的数据，各有二十条https://unsplash.com/napi/search?query=native
    找到的collections https://unsplash.com/napi/search/collections?query=native&per_page=20&xp=&page=2
    找到的photos https://unsplash.com/napi/search/photos?query=native&per_page=20&xp=&page=2
    找到的users https://unsplash.com/napi/search/users?query=native&per_page=20&xp=&page=1
    :param request:
    :return:
    """
    per_page = request.GET.get('per_page')
    page = request.GET.get('page')
    q = request.GET.get('q')
    url = 'https://www.unsplash.com/napi/search/photos?query={}&xp=&per_page={}&page={}'.format(q, per_page, page)
    res = requests.get(url, headers = headers).text
    return HttpResponse(res)


def get_init_search_res(request):
    q = request.GET.get('q')
    per_page = request.GET.get('per_page')
    url = 'https://unsplash.com/napi/search?query={}&per_page={}'.format(q, per_page)
    res = requests.get(url, headers = headers).text
    return HttpResponse(res)

def get_photos_search_res(request):
    q = request.GET.get('q')
    per_page = request.GET.get('per_page')
    page = request.GET.get('page')
    url = 'https://unsplash.com/napi/search/photos?query={}&per_page={}&xp=&page={}'.format(q, per_page, page)
    res = requests.get(url, headers = headers).text
    return HttpResponse(res)

def get_colls_search_res(request):
    q = request.GET.get('q')
    per_page = request.GET.get('per_page')
    page = request.GET.get('page')
    url = 'https://unsplash.com/napi/search/collections?query={}&per_page={}&xp=&page={}'.format(q, per_page, page)
    res = requests.get(url, headers = headers).text
    return HttpResponse(res)

def get_users_search_res(request):
    q = request.GET.get('q')
    per_page = request.GET.get('per_page')
    page = request.GET.get('page')
    url = 'https://unsplash.com/napi/search/users?query={}&per_page={}&xp=&page={}'.format(q, per_page, page)
    res = requests.get(url, headers = headers).text
    return HttpResponse(res)


def detail_cate(request):
    _id = request.GET.get('id')
    page = request.GET.get('page')
    per_page = request.GET.get('per_page')
    cate_name = request.GET.get('cate_name')
    if (int(_id) < 10):
        url = 'https://unsplash.com/napi/search/photos?query={}&xp=&per_page={}&page={}'.format(cate_name, per_page, page)
        res = requests.get(url, headers = headers).text

        return HttpResponse(res)
    else:
        url = 'https://www.unsplash.com/napi/collections/' + _id + '/photos?page={}&per_page={}&order_by=latest'.format(page, per_page)
        res = requests.get(url, headers = headers).text
        return HttpResponse(res)


def detail_coll(request):
    _id = request.GET.get('id')
    page = request.GET.get('page')
    per_page = request.GET.get('per_page')
    header = {
        'user-agent': random.choice(USER_AGENT_LIST)
    }
    if '_coll_' in _id:
        all_data_list = []
        # 取出该影集中的所有图片id
        img_id_list = Lengying().com_coll_con().find_one({'id': _id})
        if(img_id_list):
            # 取出对应图片id的所有图片数据
            for i in img_id_list['data']:
                all_data_list.append(Lengying().com_coll_imgItem().find_one({'id': i})['data'])
        print(all_data_list)
        return HttpResponse(json_dumps(all_data_list[(int(page) - 1) * int(per_page) : int(page) * int(per_page) ]))

    else:
        url = 'https://unsplash.com/napi/collections/' + _id  + '/photos?page={}&per_page={}&order_by=latest'.format(page, per_page)
        res = requests.get(url, headers=header).text
        return HttpResponse(res)

def img_cate(request, cate_name):
    mdict = {
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif'
    }
    path = '/home/ubuntu/images/lengying/cate/' + str(cate_name) + '.jpg'
    image_data = open(path, "rb").read()
    return HttpResponse(image_data, content_type=mdict['jpg'])

def temp_img(request, temp_name):
    mdict = {
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif'
    }
    path = '/home/ubuntu/images/lengying/temp/' + temp_name + '.jpg'
    image_data = open(path, "rb").read()
    return HttpResponse(image_data, content_type=mdict['jpg'])

def get_img_info(request):
    if request.method == 'GET':
        iid = request.GET.get('iid').replace('_' ,'.')
        imgitem = Imgitem.objects.filter(iid=iid)
        serialItem = json_loads(serializers.serialize("json", list(imgitem)))[0]['fields']
        return HttpResponse(json_dumps(serialItem))

def random_img(request):
    random_name = random.randint(0, 32)
    path = '/home/ubuntu/images/lengying/random/' + str(random_name) + '.jpg'
    image_data = open(path, "rb").read()
    return HttpResponse(image_data, content_type='image/jpeg')


def download_img(request):
    temp_name = request.GET.get('name')
    photo_id = request.GET.get('id')
    com = re.compile('\w+')
    temp_name = ''.join(com.findall(temp_name))
    img_url = 'https://images.unsplash.com/' + photo_id + '?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjEyMDd9'
    res = requests.get(img_url).content
    dir = '/home/ubuntu/images/lengying/temp/{}.jpg'.format(temp_name)
    with open(dir, 'wb') as f:
        f.write(res)
        f.close()
    return HttpResponse('https://www.fosuchao.com/api/lengying/images/temp/' + temp_name)

def insert_like(request):
    if request.method == 'GET':
        # 获取该用户的点赞数据
        id_ = request.GET.get('id')
        if Lengying().com_like().find_one({"id": id_}):
            i = Lengying().com_like().find_one({"id": id_})
            i.pop('_id')
            return HttpResponse(json.dumps(i))

        return HttpResponse(json_dumps('error'))

    if request.method == 'POST':
        id_ = request.POST.get('id')
        data = request.POST.get('data')
        # data = {k: v for k, v in json_loads(data).items() if v}

        img_id = request.POST.get('iid').replace('_', '.')
        post_img_item = request.POST.get('imgItem')
        # tid = request.POST.get('tid')
        # print(request.POST)
        try:
            # 更新用户total_like数量
            user_item = LengyingUser.objects.get(uid=id_)
            if json.loads(data)[img_id.replace('.', '_')] == 1:
                # 点赞操作
                user_item.total_likes += 1
            else:
                user_item.total_likes = 0 if user_item.total_likes == 0 else user_item.total_likes - 1
            user_item.save()

            like_userinfo = Lengying().com_like_userinfo().find_one({'id': request.POST.get('iid')})
            # 如果数据库没有被点赞用户的信息，则添加信息
            if not like_userinfo and post_img_item:
                Lengying().com_like_userinfo().insert_one({'id': request.POST.get('iid'), 'data': json_loads(post_img_item)})

            if "cloud" in img_id:
                # 如果是用户图片，更新数据库点赞数
                img = Imgitem.objects.get(iid__exact=img_id)
                if json.loads(data)[img_id.replace('.', '_')] == 1:
                    img.like_num += 1
                else:
                    img.like_num = 0 if img.like_num == 0 else img.like_num - 1
                img.save()

                # 通知被点赞者
                # 添加点赞的消息
                notifyapi = NotifyApi()
                if notifyapi.testNotifyExist(target_type=1, target_id=img_id, type=1, sender_id=int(''.join(findNum.findall(id_))[:9]),
                                   sender_type=2, content='点赞', rule='LIKE'):
                    notifyItem = notifyapi.createNotify(target_type=1, target_id=img_id, type=1, sender_id=int(''.join(findNum.findall(id_))[:9]),
                                       sender_type=2, content='点赞', rule='LIKE')
                    # 将消息压入被点赞用户的消息队列
                    notifyapi.addUserNotifyQueue(notify_id=notifyItem.id, uid=json_loads(post_img_item)['user']['uid'], rule=notifyItem.rule)

            if Lengying().com_like().find_one({"id": id_}):
                com_like_item_data = Lengying().com_like().find_one({"id": id_})['data']
                com_like_item_data.update(json_loads(data))
                com_like_item_data = {k: v for k, v in com_like_item_data.items() if v}

                Lengying().com_like().update_one({"id": id_}, {"$set": { "data": com_like_item_data}})
                return HttpResponse('modify success')

            Lengying().com_like().insert({
                'id': id_,
                'data': json.loads(data)
            })
            return HttpResponse('insert success')
        except Exception as e:
            print(e)
            return HttpResponse(e)

def like_userinfo(request):
    if request.method == 'GET':
        uid = request.GET.get('uid')
        page = int(request.GET.get('page'))
        per_page = int(request.GET.get('per_page'))
        com_like = Lengying().com_like().find_one({'id': uid})
        data_list = []

        if com_like:
            print(com_like['data'])
            for key in list(com_like['data'].keys())[page * per_page : (page + 1) * per_page]:
                if com_like['data'][key] == 1:
                    print(key, com_like['data'][key])
                    com_like_info = Lengying().com_like_userinfo().find_one({'id': key})
                    if com_like_info:
                        print(com_like_info['data'])
                        data_list.append(com_like_info['data'])

        return HttpResponse(json_dumps(data_list))


def update_comment_like(request):
    if request.method == 'POST':
        try:
            uid = request.POST.get('uid')
            id_ = request.POST.get('id')
            data = json.loads(request.POST.get('data'))
            sid = request.POST.get('sid')
            print(id_)
            if id_  == 'null':
                return HttpResponse('pass')

            item = Comment.objects.get(id=id_)
            num = (item.like_num + 1) if (data[sid][id_] == 1) else (item.like_num - 1)
            item.like_num = num if num > 0 else 0
            item.save()

            if Lengying().com_comment().find_one({'id': uid}):
                Lengying().com_comment().update_one({'id': uid}, {"$set": { "data": data }})
                return HttpResponse(str(num))
            else:
                Lengying().com_comment().insert_one({'id': uid, 'data': data})
                return HttpResponse('insert success')

        except Exception as e:
            print(e)
            return HttpResponse('error')
    return HttpResponse('update_comment_length')

def insert_comment_like(request):
    if request.method == 'GET':
        id_ = request.GET.get('id')
        if Lengying().com_comment().find_one({"id": id_}):
            i = Lengying().com_comment().find_one({"id": id_})
            i.pop('_id')
            return HttpResponse(json.dumps(i))
        return HttpResponse('error')

    if request.method == 'POST':
        id_ = request.POST.get('id')
        data = request.POST.get('data')
        sid = request.POST.get('sid')

        print('inner')
        print(id_, data, sid)
        try:
            if Lengying().com_comment().find_one({"id": id_}):
                Lengying().com_comment().update_one({"id": id_}, {"$set": { "data": json.loads(data) }})
                return HttpResponse('modify success')
            print('insert')
            Lengying().com_comment().insert({
                'id': id_,
                'data': json.loads(data)
            })

            return HttpResponse('insert success')
        except Exception as e:
            print(e)
            return HttpResponse('error')



def back_comment_length(request):
    try:
        id_ = request.GET.get('id')
        item = Lengying().com_comment().find_one({'id': id_})
        item.pop('_id')
        return HttpResponse(json.dumps(item))
    except Exception as e:
        print(e)
        return HttpResponse('error')

def get_user_img(request):
    page = request.GET.get('page')
    per_page = request.GET.get('per_page')
    username = request.GET.get('username')
    url = 'https://unsplash.com/napi/users/{}/photos?page={}&per_page={}&order_by=latest'.format(username, page, per_page)
    res = requests.get(url, headers = headers).text

    return HttpResponse(res)


def get_user_info(request):
    username = request.GET.get('username')
    url = ' https://unsplash.com/napi/users/{}'.format(username)
    res = requests.get(url, headers = headers).text

    return HttpResponse(res)


def get_user_coll(request):
    page = request.GET.get('page')
    per_page = request.GET.get('per_page')
    username = request.GET.get('username')
    url = 'https://unsplash.com/napi/users/{}/collections?page={}&per_page={}&order_by=updated'.format(username, page, per_page)
    res = requests.get(url, headers = headers).text

    return HttpResponse(res)

def get_user_likes(request):
    page = request.GET.get('page')
    per_page = request.GET.get('per_page')
    username = request.GET.get('username')
    url = 'https://unsplash.com/napi/users/{}/likes?page={}&per_page={}&order_by=latest'.format(username, page, per_page)
    res = requests.get(url, headers = headers).text

    return HttpResponse(res)

def get_comments(request):
    sid = request.GET.get('id')
    if 'cloud' in sid:
        sid = sid.replace('_' ,'.')
    print(sid)
    dataList = []
    try:
        comment_list = Comment.objects.filter(source_id=sid)
        commentData = json_loads(serializers.serialize("json", list(comment_list)))
        print(commentData)
        for i in commentData:
            user = LengyingUser.objects.filter(uid=i['fields']['from_id'])
            userData = json_loads(serializers.serialize("json", list(user)))
            print(userData)
            i['fields']['user'] = userData[0]['fields']
            dataList.append(i)
        return HttpResponse(json_dumps(dataList))
    except Exception as e:
        print(e)
        return HttpResponse(json.dumps([]))

def update_comment_length(sid):
    print('update_comment =>' + sid)
    condition = {"list": "comment"}

    try:
        item = Lengying().com_comment().find_one(condition)
        if(item):
            if(sid in item.keys()):
                item[sid] = item[sid] + 1
                Lengying().com_comment().update(condition, {"$set": item})
                return HttpResponse('update success')

            item[sid] = 1
            Lengying().com_comment().update(condition, {"$set": item})
            return HttpResponse('insert one success')
        else:
            Lengying().com_comment().insert_one(condition)
            new_item = Lengying().com_comment().find_one(condition)
            new_item[sid] = 1
            Lengying().com_comment().update(condition, {"$set": new_item})
            return HttpResponse('insert one success')
    except Exception as e:
        print(e)
        return HttpResponse('error')

def insert_comments(request):
    if(request.method == "POST"):
        _sid = request.POST.get('sid')
        content = request.POST.get('content')
        uid = request.POST.get('uid')
        type_ = request.POST.get('type')
        avater = request.POST.get('avater')
        username = request.POST.get('username')
        sid = None
        print(request.POST)

        if 'cloud' in _sid:
            sid = _sid.replace('_', '.')
            img = Imgitem.objects.get(iid=sid)
            img.comment_num += 1
            img.save()
            # 通知被评论者
            # 添加评论的消息
            notifyapi = NotifyApi()
            if notifyapi.testNotifyExist(target_type=1, target_id=sid, type=1,
                                         sender_id=int(''.join(findNum.findall(uid))[:9]),
                                         sender_type=2, content=content, rule='COMMENT'):
                notifyItem = notifyapi.createNotify(target_type=1, target_id=sid, type=1,
                                                    sender_id=int(''.join(findNum.findall(uid))[:9]),
                                                    sender_type=2, content=content, rule='COMMENT')
                # 将消息压入被评论用户的消息队列
                notifyapi.addUserNotifyQueue(notify_id=notifyItem.id, uid=img.user.uid, rule=notifyItem.rule)
        try:
            a = Comment(id=str(time.time()).replace('.', ''), source_id=sid, content=content, from_id=uid, from_name=username, avater=avater, source_type=type_)
            a.save()

            update_comment_length(sid=_sid)
            return HttpResponse('insert success')
        except Exception as e:
            return HttpResponse(e)

def get_comment_length(request):
    try:
        item = Lengying().com_comment().find_one({"list" : "comment"})
        item.pop('_id')
        item.pop('list')
        return HttpResponse(json.dumps(item))
    except Exception as e:
        print(e)
        return HttpResponse('error')

def get_perview_clength(request):
    id_ = request.GET.get('id')
    num = 0
    item = Lengying().com_comment().find_one({'list': 'comment'})
    if(item):
        num = item[id_] if(id_ in item.keys()) else 0
    return HttpResponse(str(num))

def new_push_img(request):
    if request.method == 'POST':
        print(request.POST)
        fileid = json.loads(request.POST.getlist('id')[0])
        size = json.loads(request.POST.getlist('size')[0])
        uid = request.POST.get('uid')
        num_uid = ''.join(findNum.findall(uid))[:9]
        categotire = '未分类' if request.POST.get('categotire') == 'undefined' else request.POST.get('categotire')
        title = request.POST.get('title')
        aid = request.POST.get('aid')
        if not aid:
            aid = -1
        descrition = request.POST.get('descrition')
        location = '中国' if request.POST.get('location') == '拍摄点在哪儿?' else request.POST.get('location')
        tags = '暂无标签' if json.loads(request.POST.getlist('tags')[0]) == '' else json.loads(request.POST.getlist('tags')[0])
        is_private = False if request.POST.get('is_private') == '0' else True

        tagLists = []
        index = 0
        try:
            notify = NotifyApi()
            if(tags != []):
                for tag in tags:
                    tItem = Tags.objects.create(title=tag)
                    tagLists.append(tItem)

                for i in fileid:
                    _time = int(str(time.time()).replace('.', '')[4:13])
                    imgItem = Imgitem.objects.create(user_id=num_uid, times_stamp=_time, iid=i, height=size[index]['height'], width=size[index]['width'], categotire=categotire, title=title,
                                                     description=descrition, location=location, isPrivate=is_private, activity_id=aid)
                    # 给用户添加该图片的订阅
                    notify.addSubscribe(target_type=1, uid=uid, rule='LIKE', target_id=imgItem.id)
                    notify.addSubscribe(target_type=1, uid=uid, rule='COMMENT', target_id=imgItem.id)
                    # 添加发布消息
                    notifyItem = notify.createNotify(target_type=1, target_id=imgItem.id, type = 1, content='作品上传成功',
                                                     rule='UPLOAD', sender_type=2, sender_id=num_uid)
                    # 并添加至消息队列
                    notify.addUserNotifyQueue(notify_id=notifyItem.id, uid=uid, rule=notifyItem.rule)
                    index += 1
                    for tag in tagLists:
                        imgItem.tags.add(tag)
                        imgItem.save()

            else:
                tItem = Tags.objects.create(title='暂无标签')
                for i in fileid:
                    _time = int(str(time.time()).replace('.', '')[4:13])
                    imgItem = Imgitem.objects.create(user_id=num_uid, times_stamp=_time, iid=i, height=size[index]['height'], width=size[index]['width'], categotire=categotire, title=title,
                                                     description=descrition, location=location, isPrivate=is_private, activity_id=aid)
                    index += 1
                    imgItem.tags.add(tItem)
                    # 给用户添加该图片的订阅
                    notify.addSubscribe(target_type=1, uid=uid, rule='LIKE', target_id=imgItem.id)
                    notify.addSubscribe(target_type=1, uid=uid, rule='COMMENT', target_id=imgItem.id)
                    imgItem.save()
                    # 添加发布消息
                    notifyItem = notify.createNotify(target_type=1, target_id=imgItem.id, type = 1, content='上传',
                                                     rule='UPLOAD', sender_type=2, sender_id=num_uid)
                    # 并添加至消息队列
                    notify.addUserNotifyQueue(notify_id=notifyItem.id, uid=uid, rule=notifyItem.rule)

            # 更新用户total_photos
            user = LengyingUser.objects.get(uid=uid)
            user.total_photos += len(fileid)
            user.save()

            return HttpResponse('success')

        except Exception as e:
            print(e)
            return HttpResponse(e)


def new_push_user(request):
    # 过滤emoji字符
    emoji_pattern = re.compile("["
                               u"\U0001F600-\U0001F64F"  # emoticons
                               u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                               u"\U0001F680-\U0001F6FF"  # transport & map symbols
                               u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                               "]+", flags=re.UNICODE)
    if request.method == 'POST':
        uid = request.POST.get('uid')
        username = request.POST.get('username')
        print(request.POST)
        gender = int(request.POST.get('gender'))
        gender = True if gender == 1 else False
        username = emoji_pattern.sub(r'', username)
        avater = request.POST.get('avater')
        login_accept = True if request.POST.get('login_accept') == 'true' else False
        id_ = ''.join(findNum.findall(uid))[:9]

        # print(uid, username, avater, login_accept)
        try:
            # 添加用户数据
            if not LengyingUser.objects.filter(uid=uid).count():
                user = LengyingUser(id=id_, uid=uid, username=username, description= random.choice(DESCRIPTION), avater=avater, gender=gender, login_accept=login_accept, upload_accept=True, register_time=datetime.datetime.now())
                user.save()

            # 小助手初始公告id
            announceNotifyID = [1, 2]
            announceID = 795124090
            notifyItem = NotifyApi()
            # 用户消息添加小助手关注
            notifyItem.addSubscribe(target_type=3, uid = uid, rule='ANNOUNCE', target_id = announceID)
            # 订阅自己的关注和粉丝消息
            notifyItem.addSubscribe(target_type=3, uid=uid, rule='SUBSCRIBE', target_id=id_)
            notifyItem.addSubscribe(target_type=3, uid=uid, rule='FANS', target_id=id_)
            # 添加用户的消息默认配置
            for i in RULE_CONFIG:
                print(i)
                notifyItem.updateSubscribeConfig(uid=uid, rule=i, is_valid=True)
            # 添加小助手公告消息
            for nid in announceNotifyID:
                notifyItem.addUserNotifyQueue(notify_id=nid, uid=uid, is_read=False, rule="announce")

            userQueueSerialData = NotifyApi().pullNotify(uid)

            # data = notifyItem.getNotify(senderID=announceID, targetID='all', rule='announce')
            push_user = LengyingUser.objects.filter(uid=uid)
            push_userSerialData = getSerializeData(push_user)[0]['fields']
            return HttpResponse(json_dumps({
                'notify': userQueueSerialData,
                'user': push_userSerialData
            }))
        except Exception as e:
            print(e)
            return HttpResponse(e)

def get_info_tags(tags):
    """
    获取表的tags内容
    传入tags的id列表
    :param tags:
    :return:
    """
    tag_data_list = []
    for t in tags:
        tag_querySet = list(Tags.objects.filter(id=t))
        tag_serial_data = json_loads(serializers.serialize("json", tag_querySet))[0]
        tag_data_list.append(tag_serial_data['fields']['title'])
    return tag_data_list


def _get_info_user(id_):
    """
    获取用户信息
    :param tags:
    :return:
    """
    user = LengyingUser.objects.filter(uid=id_)
    user = json_loads(serializers.serialize("json", list(user)))[0]
    user['fields']['tags'] = get_info_tags(user['fields']['tags'])
    return user['fields']


def refresh_img(request):
    if request.method == 'GET':
        try:
            all_Data_list = []
            time_stamp = int(str(request.GET.get('time'))[4:])
            data_querySet = Imgitem.objects.filter(times_stamp__gt=time_stamp, isPassed__exact=True)
            img_serial_data = json_loads(serializers.serialize("json", list(data_querySet)))
            for i in img_serial_data:
                user_querySet = list(LengyingUser.objects.filter(id=i['fields']['user']))
                user_serial_data = json_loads(serializers.serialize("json", user_querySet))[0]
                i['fields']['user'] = user_serial_data['fields']
                i['fields']['tags'] = get_info_tags(i['fields']['tags'])
                all_Data_list.append(i['fields'])

            #print(all_Data_list)
            return HttpResponse(json.dumps(all_Data_list))

        except Exception as e:
            return HttpResponse(e)


def back_university_info(request):
    if request.method == 'GET':
        index = request.GET.get('index')
        data = university[int(index)]
        return HttpResponse(json.dumps(data))



def update_info_user(request):
    if request.method == 'POST':
        update_info = dict(request.POST)

        print(dict(request.POST), type(dict(request.POST)))
        try:
            user = LengyingUser.objects.get(uid=update_info['uid'][0])
            if "cover_img" in update_info.keys():
                user.cover_img = update_info['cover_img'][0]
            if "location" in update_info.keys():
                user.location = '-'.join(update_info['location'])
            if "school" in update_info.keys():
                user.school = update_info['school'][0]
            if "upload_accept" in update_info.keys():
                user.upload_accept = True
            if "description" in update_info.keys():
                user.description = update_info['description'][0]
            user.save()
            return HttpResponse('save success')

        except Exception as e:
            return HttpResponse(e)


def get_info_user(request):
    if request.method == 'GET':
        uid = request.GET.get('uid')
        id_ = ''.join(findNum.findall(uid))[:9]
        n = request.GET.get('n')
        u = request.GET.get('u')

        try:
            user = LengyingUser.objects.filter(uid=uid)
            if not user.count():
                return HttpResponse(json_dumps({'error': 1, 'errorMessage': 'not user found'}))
            user = json_loads(serializers.serialize("json", list(user)))[0]
            user['fields']['tags'] = get_info_tags(user['fields']['tags'])
            if u == '1' and n == '1':
                userQueueSerialData = NotifyApi().pullNotify(uid)
                data = {
                    'user': user['fields']
                }
                data['notify'] = userQueueSerialData
                return HttpResponse(json_dumps(data))

            colls_data = []
            colls = Collections.objects.filter(user_id=id_)[0: 20]
            colls = json_loads(serializers.serialize("json", list(colls)))
            for coll in colls:
                coll['fields']['tags'] = get_info_tags(coll['fields']['tags'])
                coll['fields']['user'] = user['fields']
                colls_data.append(coll['fields'])
            imgs_data = []
            imgs = Imgitem.objects.filter(user_id=id_)[0: 20]
            imgs = json_loads(serializers.serialize("json", list(imgs)))
            for img in imgs:
                img['fields']['tags'] = get_info_tags(img['fields']['tags'])
                img['fields']['user'] = user['fields']
                imgs_data.append(img['fields'])

            data = {
                'user': user['fields'],
                'colls': colls_data,
                'imgs': imgs_data,
            }
            # print(data)

            return HttpResponse(json_dumps(data))

        except Exception as e:
            print(e)
            return HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))

def feedback(request):
    """反馈"""
    if request.method == 'POST':
        username = request.POST.get('username')
        text = request.POST.get('text')
        contact = request.POST.get('contact')
        try:
            feedbackItem = Feedback.objects.create(username=username, textInfo=text, contactInfo=contact)
            feedbackItem.save()
            return HttpResponse('save success')
        except Exception as e:
            return HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))


def contact(request):
    """联系"""
    if request.method == 'POST':
        username = request.POST.get('username')
        userCall = request.POST.get('userCall')
        text = request.POST.get('text')
        contact = request.POST.get('contact')
        try:
            contactItem = Contact.objects.create(username=username, textInfo=text, contactInfo=contact, userCall=userCall)
            contactItem.save()
            return HttpResponse('save success')
        except Exception as e:
            return HttpResponse('error')

def report(request):
    """举报"""
    if request.method == 'POST':
        username = request.POST.get('username')
        reportType = request.POST.get('reportType')
        id_ = request.POST.get('id')
        try:
            return HttpResponse('save success')
        except Exception as e:
            return HttpResponse('error')

def subscribe(request):
    if(request.method == 'GET'):
        uid = request.GET.get("uid")
        try:
            sub = Lengying().com_subscribe().find_one({'id': uid})
            if sub:
                return HttpResponse(json_dumps(sub['data']))
            else:
                return HttpResponse(json_dumps({}))
        except Exception as e:
            return HttpResponse(e)

    if(request.method == 'POST'):
        uid = request.POST.get('uid')
        data = json.loads(request.POST.get('data'))
        try:
            sub = Lengying().com_subscribe().find_one({'id': uid})
            if sub:
                data = {k: v for k, v in data.items() if v}
                Lengying().com_subscribe().update_one({"id": uid}, {"$set": {"data": data}})
                return HttpResponse('update success')
            else:
                Lengying().com_subscribe().insert_one({'id': uid, 'data': data})
                return HttpResponse('insert new one success')
        except Exception as e:
            return HttpResponse(e)

def judgeKey(judgeDictData, type_, page, per_page):
    listCon = []
    for key in list(judgeDictData.keys())[page * per_page : (page + 1) * per_page]:
        if (judgeDictData[key] == 1):
            # 长度为32 为用户数据
            user_info = {}
            if type_ == 'sub':
                user_info = Lengying().com_subscribe_userinfo().find_one({'tid': key})
            if type_ == 'fans':
                user_info = Lengying().com_fans_userinfo().find_one({'tid': key})

            if user_info:
                if len(key) == 32:
                    lengying_user_info = LengyingUser.objects.filter(uid=key)
                    user_serial_data = json_loads(serializers.serialize("json", list(lengying_user_info)))
                    user_info['data'] = user_serial_data[0]['fields']
                listCon.append(user_info['data'])
                print(listCon)

    return listCon

def subscribe_userinfo(request):
    if(request.method == 'GET'):
        uid = request.GET.get("uid")
        page = int(request.GET.get("page"))
        per_page = int(request.GET.get("per_page"))
        try:
            # 获取用户关注数据
            sub_data = Lengying().com_subscribe().find_one({'id': uid})
            print('sub_data')
            print(sub_data)
            if sub_data:
                data_list = judgeKey(sub_data['data'], 'sub', page, per_page)
                return HttpResponse(json_dumps(data_list))
            return HttpResponse(json_dumps([]))
        except Exception as e:
            print(e)
            return HttpResponse(json_dumps([]))

    if(request.method == 'POST'):
        uid = request.POST.get('uid')
        target_id = request.POST.get('tid')
        userinfo = request.POST.get('userinfo')
        type_ = str(request.POST.get('type'))
        sub_userinfo = request.POST.get('sub_userinfo')

        print('request.POST')
        print(request.POST)

        # type = 0 删除数据(取消关注)   type = 1 添加数据（添加关注）
        try:
            user = LengyingUser.objects.get(uid=uid)
            do_fans_action(uid=target_id, tid=uid, type_=type_)
            if type_ == '0':
                user.following_count = 0 if user.following_count <= 0 else user.following_count - 1
                # Lengying().com_subscribe_userinfo().delete_one({'id': uid, 'tid': target_id})
                user.save()
                if len(target_id) == 32:
                    target_user = LengyingUser.objects.get(uid=target_id)

                    target_user.followers_count = 0 if target_user.followers_count <= 0 else target_user.followers_count - 1
                    target_user.save()

                return HttpResponse('unsubscribe success')

            if type_ == '1':
                if not Lengying().com_subscribe_userinfo().find_one({'tid': target_id}):
                    Lengying().com_subscribe_userinfo().insert_one({'id': uid, 'tid': target_id, 'data': json.loads(userinfo)})
                if not Lengying().com_fans_userinfo().find_one({'tid': uid}):
                    Lengying().com_fans_userinfo().insert_one({'id': target_id, 'tid': uid, 'data': json.loads(sub_userinfo)})
                user.following_count += 1
                user.save()
                if len(target_id) == 32 or target_id == '0':
                    target_user = LengyingUser.objects.get(uid=target_id)
                    target_user.followers_count += 1
                    target_user.save()

                    # 为被关注的人添加关注消息
                    notify = NotifyApi()
                    if notify.testNotifyExist(target_type=3, target_id=target_id, type=1, content='关注',
                                                     rule='SUBSCRIBE', sender_type=2, sender_id=int(''.join(findNum.findall(uid))[:9])):
                        notifyItem = notify.createNotify(target_type=3, target_id=target_id, type=1, content='关注',
                                                         rule='SUBSCRIBE', sender_type=2, sender_id=int(''.join(findNum.findall(uid))[:9]))
                        # 并添加至消息队列
                        notify.addUserNotifyQueue(notify_id=notifyItem.id, uid=target_id, rule=notifyItem.rule)
                    return HttpResponse('insert_one success')
                return HttpResponse('success')

        except Exception as e:
            print(e)
            return HttpResponse(e)


def do_fans_action(uid, tid, type_):
    """
    :param uid: 被关注者id
    :param tid: 关注者/粉丝id
    :param type_:  1为添加， 0为取消
    :return:
    """
    try:
        fans = Lengying().com_fans().find_one({'id': uid})
        # 粉丝表中是否有被关注者的信息(是否之前已经被关注过)
        if fans:
            newData = fans['data']
            newData[tid] = 1 if type_ == '1' else 0
            Lengying().com_fans().update_one({"id": uid}, {"$set": {"data": newData}})
        # 此用户第一次被关注
        else:
            newData = {
                tid: 1
            }
            Lengying().com_fans().insert_one({'id': uid, 'data': newData})

    except Exception as e:
        print(e)


def fans_userinfo(request):
    if (request.method == 'GET'):
        uid = request.GET.get("uid")
        page = int(request.GET.get("page"))
        per_page = int(request.GET.get("per_page"))
        try:
            fans_data = Lengying().com_fans().find_one({'id': uid})
            if fans_data:
                data_list = judgeKey(fans_data['data'], 'fans', page, per_page)
                return HttpResponse(json_dumps(data_list))

            return HttpResponse(json_dumps([]))
        except Exception as e:
            print(e)
            return HttpResponse(json_dumps([]))

    if (request.method == 'POST'):
        uid = request.POST.get('uid')
        target_id = request.POST.get('tid')
        userinfo = request.POST.get('userinfo')
        type_ = str(request.POST.get('type'))
        # type = 0 删除数据(取消关注)   type = 1 添加数据（添加关注）
        try:
            user = LengyingUser.objects.get(uid=uid)
            if type_ == '0':
                user.followers_count = 0 if user.followers_count <= 0 else user.followers_count - 1
                user.save()
                return HttpResponse('unsubscribe success')

            if type_ == '1':
                if (Lengying().com_fans_userinfo().find_one({'tid': target_id})):
                    return HttpResponse(json_dumps({'error': 1, 'message': 'Target already exists'}))
                Lengying().com_fans_userinfo().insert_one({'id': uid, 'tid': target_id, 'data': json.loads(userinfo)})
                user.followers_count += 1
                user.save()
                return HttpResponse('insert_one success')

        except Exception as e:
            return HttpResponse(e)

def get_person_img(request):
    uid = request.GET.get('uid')
    page = int(request.GET.get('page'))
    per_page = int(request.GET.get('per_page'))

    id_ = ''.join(findNum.findall(uid))[:9]
    try:
        imgs = Imgitem.objects.filter(user_id=id_)[page * per_page : (page+1) * per_page]
    except Exception as e:
        return HttpResponse(e)

    if len(list(imgs)) != 0:
        user = LengyingUser.objects.filter(id=id_)
        user = json_loads(serializers.serialize("json", user))
        imgs_serial_data = json_loads(serializers.serialize("json", list(imgs)))

        all_datas = []

        for img in imgs_serial_data:
            # 每个img表user字段为用户表
            img['fields']['user'] = user[0]['fields']
            # 每个img表tags字段为tags表
            img['fields']['tags'] = get_info_tags(img['fields']['tags'])

            all_datas.append(img['fields'])

        return HttpResponse(json_dumps(all_datas))
    else:
        return HttpResponse(json_dumps([]))




def get_person_coll(request):
    uid = request.GET.get('uid')
    page = int(request.GET.get('page'))
    per_page = int(request.GET.get('per_page'))

    id_ = ''.join(findNum.findall(uid))[:9]

    try:
        colls = Collections.objects.filter(user_id=id_)[page * per_page : (page+1) * per_page]
    except Exception as e:
        return HttpResponse(e)

    if len(list(colls)) != 0:
        user = LengyingUser.objects.filter(id=id_)
        user = json_loads(serializers.serialize("json", user))
        user[0]['fields']['tags'] = get_info_tags(user[0]['fields']['tags'])
        colls_serial_data = json_loads(serializers.serialize("json", list(colls)))
        all_datas = []
        for coll in colls_serial_data:
            coll['fields']['user'] = user[0]['fields']
            coll['fields']['tags'] = get_info_tags(coll['fields']['tags'])

            all_datas.append(coll['fields'])
        return HttpResponse(json_dumps(all_datas))

    else:
        return HttpResponse(json_dumps([]))

def new_push_coll(request):
    if request.method == 'POST':
        print(request.POST)
        uid = request.POST.get('uid')
        title = request.POST.get('title')
        description = request.POST.get('description')
        tags = json_loads(request.POST.get('tags'))
        is_private = True if str(request.POST.get('is_private')) == '1' else False

        user_id =  ''.join(findNum.findall(uid))[:9]

        print(uid, title, description, tags, is_private)
        # 获取用户信息
        user = LengyingUser.objects.get(uid=uid)

        coll_num = user.total_collections
        # 生成影集id
        cid = uid + "_coll_" + str(coll_num + 1)
        try:
            coll_item = Collections.objects.create(cid=cid, user_id=user_id, private=is_private, description=description, title=title)
            # 生成标签
            for tag in tags:
                t = Tags.objects.create(title=tag)
                coll_item.tags.add(t)
                coll_item.save()
            # 用户影集总数加1
            user.total_collections = coll_num + 1
            user.save()
            # 将coll_id 写入monogo
            if Lengying().com_user_coll().find_one({'id': user_id}):
                # 创建过影集
                user_coll = Lengying().com_user_coll().find_one({'id': user_id})
                coll_data = user_coll['data']  # 列表数据，元素为coll_id
                coll_data.append(cid)
                Lengying().com_user_coll().update_one({"id": user_id}, {"$set": { "data": coll_data }})
            else:
                # 没有创建过影集
                Lengying().com_user_coll().insert_one({
                    'id': user_id,
                    "data": [cid]
                })

            back_coll_data = Collections.objects.filter(cid=cid)
            user = LengyingUser.objects.filter(uid=uid)

            coll_serial_data = json_loads(serializers.serialize("json", list(back_coll_data)))
            user_serial_data = json_loads(serializers.serialize("json", list(user)))
            print(user_serial_data[0]['fields'])
            coll_serial_data[0]['fields']['tags'] = get_info_tags(coll_serial_data[0]['fields']['tags'])
            user_serial_data[0]['fields']['tags'] = get_info_tags(user_serial_data[0]['fields']['tags'])
            print(user_serial_data[0]['fields'])
            coll_serial_data[0]['fields']['user'] = user_serial_data[0]['fields']
            print(coll_serial_data[0]['fields'])
            return HttpResponse(json_dumps(coll_serial_data[0]['fields']))

        except Exception as e:
            return HttpResponse(e)


def coll_delImg(request):
    if request.method == 'GET':
        uid = request.GET.get('uid')
        delID = request.GET.get('delID')
        cid = request.GET.get('cid')
        print(request.GET)
        # 删除mongodb中的影集数据
        try:
            coll = Lengying().com_coll_con().find_one({'id': cid})
            if coll:
                data = coll['data']
                data.remove(delID)
                Lengying().com_coll_con().update_one({'id': cid },{'$set': {'data': data}})
                m_coll = Collections.objects.get(cid=cid)
                m_coll.photos_num = m_coll.photos_num - 1 if m_coll.photos_num != 0 else 0
                m_coll.save()
            return HttpResponse('success')

        except Exception as e:
            print(e)
            return HttpResponse(e)


def add_img_to_coll(request):
    if request.method == 'POST':
        data = json_loads(request.POST.get('data'))
        if data['iid']:
            data['id'] = data['iid']
        cid = request.POST.get('cid')
        print(type(data))
        print(data['id'], cid)
        # 影集中已经有相片， 更新数据
        if Lengying().com_coll_con().find_one({'id': cid}):
            coll_con_item = Lengying().com_coll_con().find_one({'id': cid})
            coll_data = coll_con_item['data']                                                     # 列表数据
            if data['id'] in coll_data:
                return HttpResponse('error')
            coll_data.append(data['id'])
            Lengying().com_coll_con().update_one({'id': cid}, {'$set': {'data': coll_data}})            # 添加图片id

            # 所有影集资源中已有该图片资源, 则不作添加图片信息操作
            if Lengying().com_coll_imgItem().find_one({'id': data['id']}):
                pass
            # 若不存在该图片资源，则新增
            else:
                Lengying().com_coll_imgItem().insert_one({
                    'id': data['id'],
                    'data': data
                })
            coll_query_item = Collections.objects.get(cid=cid)
            coll_query_item.photos_num = coll_query_item.photos_num + 1
            coll_query_item.save()

            return HttpResponse('update success')

        # 影集中还没有相片
        else:
            # 创建mongo表
            Lengying().com_coll_con().insert_one({
                'id': cid,
                'data': [data['id']]
            })
            # 所有影集资源中已有该图片资源, 则不作添加图片信息操作
            if Lengying().com_coll_imgItem().find_one({'id': data['id']}):
                pass
            # 若不存在该图片资源，则新增
            else:
                Lengying().com_coll_imgItem().insert_one({
                    'id': data['id'],
                    'data': data
                })
            # 添加预览图片
            coll_query_item = Collections.objects.get(cid=cid)
            if 'urls' in data.keys():
                # 图片为unsplash
                coll_query_item.priview_photo = data['urls']['small']
            else:
                # 图片为用户所有的cloudiID
                coll_query_item.priview_photo = data['iid']
            # 保存model
            coll_query_item.photos_num = coll_query_item.photos_num + 1
            coll_query_item.save()

            return HttpResponse('create success')


def more_coll(request):
    """
    unsplash影集的url: https://unsplash.com/napi/collections/featured?page=3&per_page=8
    type_: 1-用户影集，  2-unsplash影集
    :param request:
    :return:
    """
    type_ = request.GET.get('type')
    page = request.GET.get('page')
    per_page = request.GET.get('per_page')

    url = 'https://unsplash.com/napi/collections/featured?page={}&per_page={}'.format(page, per_page)
    if type_ == '1':
        pass

    if type_ == '2':
        res = requests.get(url).text
        return HttpResponse(res)


def more_cate(request):
    pass

@accept_websocket
def get_notify(request):
    if request.is_websocket():
        print('websocket')
        message = request.websocket.wait()
        request.websocket.send(message)

    elif request.method == "GET":
        uid = request.GET.get('uid')
        userQueueSerialData = NotifyApi().pullNotify(uid)
        return HttpResponse(json_dumps(userQueueSerialData))

def get_talk_record(request):
    if request.method == "GET":
        # 当前用户
        uid = request.GET.get('uid')
        # 聊天对象
        talkToUid = request.GET.get('talkToUid')
        # 是否已读
        # is_read = request.GET.get('is_read')
        # 设置消息已读
        # if is_read:
        NotifyApi().updateIsRead(uid=uid, talkToUid=talkToUid)
        # 获取聊天记录
        data = NotifyApi().getTalkRecord(uid=uid, talkToUid=talkToUid)

        return HttpResponse(json_dumps(data))

    if request.method == "POST":
        print(request.POST)
        # 用户发送私信给聊天对象，聊天对象的消息队列添加该私信, 自己的消息队列也添加该私信
        # 当前用户
        uid = request.POST.get('uid')
        # 聊天对象
        talkToUid = request.POST.get('talkToUid')
        # 消息内容
        content = request.POST.get('content')
        # 返回新创建的消息
        message = NotifyApi().createNotify(target_id=talkToUid, target_type=3, sender_type=2, sender_id=int(''.join(findNum.findall(uid))[:9]),
                                 content=content, rule='ANNOUNCE', type=2)


        if type(message) == dict:
            return HttpResponse(json_dumps(message))
        else:
            NotifyApi().addUserNotifyQueue(notify_id=message.id, uid=talkToUid, rule=message.rule)
            NotifyApi().addUserNotifyQueue(notify_id=message.id, uid=uid, rule=message.rule, is_read=True)
        return HttpResponse('success')

def get_remind(request):
    if request.method == 'GET':
        # 获取用户的某个提醒的全部消息
        type_ = request.GET.get('type')
        uid = request.GET.get('uid')
        page = int(request.GET.get('page'))
        per_page = int(request.GET.get('per_page'))

        dataList = NotifyApi().getRemind(uid=uid, type=type_, page=page, per_page=per_page)

        return HttpResponse(json_dumps(dataList))

def getUserInfoByUID(uid):
    user = LengyingUser.objects.filter(uid=uid)
    if user.count():
        return getSerializeData(user)[0]['fields']
    return None

def getUserInfoByID(id):
    user = LengyingUser.objects.filter(id=id)

    if user.count():
        return getSerializeData(user)[0]['fields']
    return None

def getSerializeData(filterData):

    return json_loads(serializers.serialize("json", list(filterData)))


def get_userGeo(request):
    if request.method == 'GET':
        # 根据用户id获取用户的位置
        uid = request.GET.get('uid')
        school = request.GET.get('school')
        p = int(request.GET.get('p'))
        page = int(request.GET.get('page'))
        type_ = request.GET.get('type')
        print(request.GET)
        PER_PAGE = 15
        s_data = []
        n_data = []

        user = UserGeoinfo.objects.get(uid=uid)
        userGeo = user.geohash_value
        # 取前p位
        userGeo = userGeo[:p]


        if type_ == 'init':
            try:
                # 查出用户同校的人
                if school != '设置你的高校':
                    schoolMate = LengyingUser.objects.filter(school=school)[page*PER_PAGE: (page+1)*PER_PAGE]
                    if schoolMate.count():
                        schoolMateSerialData = getSerializeData(schoolMate)

                        for s in schoolMateSerialData:
                            if s['fields']['uid'] != uid and s['fields']['uid'] != '0':
                                s_data.append(s['fields'])

                # 根据用户geohash查找出附近的人
                while True:
                    print(userGeo)
                    nearby = UserGeoinfo.objects.filter(geohash_value__startswith=userGeo)[page*PER_PAGE: (page+1)*PER_PAGE]
                    print(nearby)
                    if nearby.count() < PER_PAGE:
                        if p == 0:
                            nearbySerialData = getSerializeData(nearby)
                            for n in nearbySerialData:
                                if n['fields']['uid'] != uid and n['fields']['uid'] != '0':
                                    userinfo = getUserInfoByUID(n['fields']['uid'])
                                    if userinfo:
                                        n['fields']['user'] = userinfo
                                        n_data.append(n['fields'])
                            break

                        p -= 1
                        userGeo = userGeo[:p]

                    elif nearby.count() >= PER_PAGE:
                        nearbySerialData = getSerializeData(nearby)
                        for n in nearbySerialData:
                            if n['fields']['uid'] != uid and n['fields']['uid'] != '0':
                                userinfo = getUserInfoByUID(n['fields']['uid'])
                                if userinfo:
                                    n['fields']['user'] = userinfo
                                    n_data.append(n['fields'])
                        break

                data = {
                    'nearby': n_data,
                    'schoolmate': s_data,
                    'p': p
                }
                return HttpResponse(json_dumps(data))

            except Exception as e:
                print(e)
                return HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))

        if type_ == 'schoolmate':
            # 查出用户同校的人
            if school != '设置你的学校':
                schoolMate = LengyingUser.objects.filter(school=school)[page * PER_PAGE: (page + 1) * PER_PAGE]
                if schoolMate.count():
                    schoolMateSerialData = getSerializeData(schoolMate)

                    for s in schoolMateSerialData:
                        if s['fields']['uid'] != uid and s['fields']['uid'] != '0':
                            s_data.append(s['fields'])
                data = {
                    'nearby': n_data,
                    'schoolmate': s_data,
                    'p': p
                }
                return HttpResponse(json_dumps(data))

        if type_ == 'nearby':
            # 根据用户geohash查找出附近的人
            while True:
                nearby = UserGeoinfo.objects.filter(geohash_value__startswith=userGeo)[
                         page * PER_PAGE: (page + 1) * PER_PAGE]
                if nearby.count() < PER_PAGE:
                    if p == 0:
                        nearbySerialData = getSerializeData(nearby)
                        for n in nearbySerialData:
                            if n['fields']['uid'] != uid and n['fields']['uid'] != '0':
                                userinfo = getUserInfoByUID(n['fields']['uid'])
                                if userinfo:
                                    n['fields']['user'] = userinfo
                                    n_data.append(n['fields'])
                        break

                    p -= 1
                    userGeo = userGeo[:p]

                elif nearby.count() >= PER_PAGE:
                    nearbySerialData = getSerializeData(nearby)
                    for n in nearbySerialData:
                        if n['fields']['uid'] != uid and n['fields']['uid'] != '0':
                            userinfo = getUserInfoByUID(n['fields']['uid'])
                            if userinfo:
                                n['fields']['user'] = userinfo
                                n_data.append(n['fields'])
                    break
            data = {
                'nearby': n_data,
                'schoolmate': s_data,
                'p': p
            }
            return HttpResponse(json_dumps(data))

    if request.method == 'POST':
        # 更新/新增用户的最近登录的经纬度
        lat = float(request.POST.get('latitude'))
        long = float(request.POST.get('longitude'))
        uid = request.POST.get('uid')
        print(request.POST)
        try:
            if UserGeoinfo.objects.filter(uid=uid).count():
                geo = UserGeoinfo.objects.get(uid=uid)
                geo.lat = lat
                geo.long = long
                geo.geohash_value = geohash.encode(latitude=lat, longitude=long)
                geo.save()
                return HttpResponse('update success')
            else:
                UserGeoinfo.objects.create(uid=uid, long=long, lat=lat, geohash_value=geohash.encode(latitude=lat, longitude=long))
                return HttpResponse('insert success')

        except Exception as e:
            print(e)
            return {'error': 1, 'errMess': e}


def do_stray(request):
    if request.method == 'GET':
        uid = request.GET.get('uid')
        today  = datetime.date.today()
        # 用户当天已抽取卡片
        if ReceiveCard.objects.filter(create_at__day=today.day, create_at__month=today.month, create_at__year=today.year, uid=uid):
            return HttpResponse('exist')

        # 随机获取一张卡片
        max_id = Postcard.objects.aggregate(Max('id')).values()
        lmax = list(max_id)[0]
        min_id = math.ceil(lmax*random.random())
        postcard = Postcard.objects.filter(is_passed=True, id__gte=min_id)[0]
        # 用户收留的卡片中添加
        ReceiveCard.objects.create(uid=uid, pid=postcard.id)
        return HttpResponse('success')

    if request.method == 'POST':
        # 添加新的卡片
        uid = request.POST.get('uid')
        content = request.POST.get('content')
        receive = request.POST.get('receive')
        send = request.POST.get('send')
        date = request.POST.get('date')
        year = request.POST.get('year')
        canvas_id = request.POST.get('canvas_id')

        try:
            user = LengyingUser.objects.get(uid=uid)
            Postcard.objects.create(user_id=user.id, content=content, by_name=send, to_name=receive, date=date, year=year, canvas_img_id=canvas_id)
            return HttpResponse('success')
        except Exception as e:
            print(e)
            return HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))

def get_card(request):
    if request.method == 'GET':
        uid = request.GET.get('uid')
        type_ = request.GET.get('type')
        page = int(request.GET.get('page'))
        per_page = int(request.GET.get('per_page'))
        mine_list = []
        getcard_list = []
        print(request.GET)
        try:
            if type_ == 'init':
                # 初始化数据
                # 自己的卡片
                postcards = Postcard.objects.filter(user__uid=uid)[page*per_page: (page+1)*per_page]
                if postcards.count():
                    postcardsSerialData = getSerializeData(postcards)
                    for p in postcardsSerialData:
                        mine_list.append(p['fields'])
                # 收到的卡片
                getcards = ReceiveCard.objects.filter(uid=uid)[page*per_page: (page+1)*per_page]
                if getcards.count():
                    getcardsSerialData = getSerializeData(getcards)
                    for g in getcardsSerialData:
                        # print(g)
                        # 获取卡片信息
                        cardinfo = Postcard.objects.filter(id=g['fields']['pid'])
                        cardinfoSerialData = getSerializeData(cardinfo)[0]['fields']

                        user = LengyingUser.objects.filter(id=cardinfoSerialData['user'])
                        userSerialData = getSerializeData(user)[0]['fields']
                        g['fields']['card'] = cardinfoSerialData
                        g['fields']['card']['user'] = userSerialData

                        getcard_list.append(g['fields'])
                data = {
                    'mine': mine_list,
                    'get_': getcard_list
                }
                return HttpResponse(json_dumps(data))

            # 获取发出的卡片
            if type_ == 'mine':
                # 自己的卡片
                postcards = Postcard.objects.filter(user__uid=uid)[page * per_page: (page + 1) * per_page]
                print(postcards)
                if postcards.count():
                    postcardsSerialData = getSerializeData(postcards)
                    for p in postcardsSerialData:

                        mine_list.append(p['fields'])
                return HttpResponse(json_dumps(mine_list))

            # 获取收取的卡片
            if type_ == 'get':
                # 收到的卡片
                getcards = ReceiveCard.objects.filter(uid=uid)[page * per_page: (page + 1) * per_page]
                if getcards.count():
                    getcardsSerialData = getSerializeData(getcards)
                    for g in getcardsSerialData:
                        print(g)
                        # 获取卡片信息
                        cardinfo = Postcard.objects.filter(id=g['fields']['pid'])
                        cardinfoSerialData = getSerializeData(cardinfo)[0]['fields']

                        user = LengyingUser.objects.filter(id=cardinfoSerialData['user'])
                        userSerialData = getSerializeData(user)[0]['fields']
                        g['fields']['card'] = cardinfoSerialData
                        g['fields']['card']['user'] = userSerialData

                        getcard_list.append(g['fields'])
                return HttpResponse(json_dumps(getcard_list))
        except Exception as e:
            print(e)
            return HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))

def get_market(request):
    if request.method == 'GET':
        # 获取用户约拍信息
        uid = request.GET.get('uid')
        page = int(request.GET.get('page'))
        per_page = int(request.GET.get('per_page'))
        type_ = request.GET.get('type')

        new_data = []
        school_data = []
        lengyingUser = LengyingUser.objects.filter(uid=uid)
        lengyingUser = getSerializeData(lengyingUser)[0]['fields']
        print(lengyingUser)
        # 初始化信息
        if type_ == 'init':
            newData = Market.objects.all()[page*per_page: (page+1)*per_page]
            if newData.count():
                newSerialData = getSerializeData(newData)
                for n in newSerialData:
                    user = LengyingUser.objects.filter(id=n['fields']['user'])
                    userSerialData = getSerializeData(user)
                    n['fields']['user'] = userSerialData[0]['fields']
                    n['fields']['id'] = n['pk']
                    new_data.append(n['fields'])

            if lengyingUser['school'] != '设置你的高校':
                schoolData = Market.objects.filter(user__school=lengyingUser['school'])[page * per_page: (page + 1) * per_page]
                if schoolData.count():
                    schoolSerialData = getSerializeData(schoolData)
                    for s in schoolSerialData:
                        user = LengyingUser.objects.filter(id=s['fields']['user'])
                        userSerialData = getSerializeData(user)
                        s['fields']['user'] = userSerialData[0]['fields']
                        s['fields']['id'] = s['pk']

                        school_data.append(s['fields'])

            data = {
                'new_': new_data,
                'school': school_data
            }
            return HttpResponse(json_dumps(data))

        # 最新约拍信息
        if type_ == 'new':
            newData = Market.objects.all()[page * per_page: (page + 1) * per_page]
            if newData.count():
                newSerialData = getSerializeData(newData)
                for n in newSerialData:
                    user = LengyingUser.objects.filter(id=n['fields']['user'])
                    userSerialData = getSerializeData(user)
                    n['fields']['user'] = userSerialData[0]['fields']
                    n['fields']['id'] = n['pk']

                    new_data.append(n['fields'])
            return HttpResponse(json_dumps(new_data))

        # 校内约拍信息
        if type_ == 'school':
            schoolData = Market.objects.filter(user__school=lengyingUser['school'])[page * per_page: (page + 1) * per_page]
            if schoolData.count():
                schoolSerialData = getSerializeData(schoolData)
                for s in schoolSerialData:
                    user = LengyingUser.objects.filter(id=s['fields']['user'])
                    userSerialData = getSerializeData(user)
                    s['fields']['user'] = userSerialData[0]['fields']
                    s['fields']['id'] = s['pk']

                    school_data.append(s['fields'])
            return HttpResponse(json_dumps(school_data))

        # 获取自己的约拍记录
        if type_ == 'mine':
            data = []
            mineData = Market.objects.filter(user__uid=uid)[page * per_page: (page + 1) * per_page]
            if mineData.count():
                mineSerialData = getSerializeData(mineData)
                for m in mineSerialData:
                    # user = LengyingUser.objects.filter(id=s['fields']['user'])
                    # userSerialData = getSerializeData(user)
                    m['fields']['user'] = lengyingUser
                    m['fields']['id'] = m['pk']

                    data.append(m['fields'])
            return HttpResponse(json_dumps(data))


    if request.method == 'POST':
        # 添加或关闭约拍
        uid = request.POST.get('uid')
        type_ = request.POST.get('type')
        place = request.POST.get('place')
        money = request.POST.get('money')
        thing = request.POST.get('thing')
        require = request.POST.get('require')
        start_time = request.POST.get('start_time')
        end_time = request.POST.get('end_time')
        market_id = request.POST.get('market_id')

        print(request.POST)

        num_id = int(''.join(findNum.findall(uid))[:9])

        if type_ == 'add':
            # 添加约拍信息
            try:
                marketItem = Market.objects.create(start_time=start_time, end_time=end_time, require=require, thing=thing, money=money, place=place,user_id=num_id)
                print('create done')
                marketItemSerialData = getSerializeData(Market.objects.filter(id=marketItem.id))
                # marketItemSerialData = getSerializeData(marketItem)
                user = LengyingUser.objects.filter(id=marketItem.user_id)
                userSerialData = getSerializeData(user)
                marketItemSerialData[0]['fields']['user'] = userSerialData[0]['fields']
                print(marketItemSerialData[0]['fields'])
                return HttpResponse(json_dumps(marketItemSerialData[0]['fields']))

            except Exception as e:
                print(e)
                return HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))

        if type_ == 'close':
            # 关闭约拍信息
            try:
                m_item = Market.objects.get(id=market_id)
                m_item.is_done = True
                m_item.save()
                return HttpResponse('success')

            except Exception as e:
                print(e)
                return HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))

        if type_ == 'get':
            # 用户接单
            try:
                # 通过market_id找出目标user
                market = Market.objects.get(id=market_id)
                targetUser = LengyingUser.objects.get(id=market.user_id)

                num_id = int(''.join(findNum.findall(uid))[:9])

                # 通知目标用户
                notify = NotifyApi()
                n_item = notify.createNotify(target_id=market_id, target_type=3, sender_id=num_id, sender_type=2,type=1, rule='WORK', content='想接你的约拍')
                notify.addUserNotifyQueue(notify_id=n_item.id, uid=targetUser.uid, rule='work')

                return HttpResponse('success')

            except Exception as e:
                print(e)
                return HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))


def get_scenery(request):
    if request.method == 'GET':
        type_ = request.GET.get('type')
        page = int(request.GET.get('page'))
        per_page = int(request.GET.get('per_page'))
        school = request.GET.get('school')

        order_list = []
        school_list = []
        if type_ == 'init':
            try:
                # 获取所有校园风采的图片
                img = Imgitem.objects.filter(activity_id=1, isPassed=True)[page * per_page : (page + 1 * per_page)]
                if img.count():
                    imgSerialData = getSerializeData(img)
                    for i in imgSerialData:
                        user = LengyingUser.objects.filter(id=i['fields']['user'])
                        userSerialData = getSerializeData(user)
                        i['fields']['user'] = userSerialData[0]['fields']
                        # i['fields']['id'] = i['pk']
                        order_list.append(i['fields'])

                # 获取同校的消息
                if school != '设置你的高校':
                    school = Imgitem.objects.filter(activity_id=1, user__school=school, isPassed=True)[page * per_page : (page + 1 * per_page)]
                    if school.count():
                        schoolSerialData = getSerializeData(school)
                        for s in schoolSerialData:
                            user = LengyingUser.objects.filter(id=s['fields']['user'])
                            userSerialData = getSerializeData(user)
                            s['fields']['user'] = userSerialData[0]['fields']
                            # i['fields']['id'] = i['pk']
                            school_list.append(s['fields'])

                data = {
                    'school': school_list,
                    'order': order_list
                }
                return HttpResponse(json_dumps(data))
            except Exception as e:
                print(e)
                return HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))

        if type_ == 'school':
            try:
                # 获取同校的消息
                school = Imgitem.objects.filter(activity_id=1, user__school=school, isPassed=True)[page * per_page: (page + 1 * per_page)]
                if school.count():
                    schoolSerialData = getSerializeData(school)
                    for s in schoolSerialData:
                        user = LengyingUser.objects.filter(id=s['fields']['user'])
                        userSerialData = getSerializeData(user)
                        s['fields']['user'] = userSerialData[0]['fields']
                        # i['fields']['id'] = i['pk']
                        school_list.append(s['fields'])
                data = {
                    'school': school_list,
                    'order': order_list
                }
                return HttpResponse(json_dumps(data))
            except Exception as e:
                print(e)
                return HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))

        if type_ == 'order':
            try:
                # 获取所有校园风采的图片
                img = Imgitem.objects.filter(activity_id=1, isPassed=True)[page * per_page: (page + 1 * per_page)]
                if img.count():
                    imgSerialData = getSerializeData(img)
                    for i in imgSerialData:
                        user = LengyingUser.objects.filter(id=i['fields']['user'])
                        userSerialData = getSerializeData(user)
                        i['fields']['user'] = userSerialData[0]['fields']
                        # i['fields']['id'] = i['pk']
                        order_list.append(i['fields'])

                data = {
                    'school': school_list,
                    'order': order_list
                }
                return HttpResponse(json_dumps(data))

            except Exception as e:
                print(e)
                return HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))


def get_activity(request):
    try:
        # return HttpResponse(json_dumps({
        #     'school': [],
        #     'activity': []
        # }))
        #
        school_list = [
      {
        'name': "校园风采",
        'icon_path': "https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/bud-rJwseUghN.png?sign=6fcb2d6040184addb6c725238384efc1&t=1557320228"
      },
      {
        'name': "摄影师",
        'icon_path': "https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/diaphragm-B1bM-Ie3V.png?sign=04ff6050cd4b9dd7bdec7a31b2623868&t=1557320209"
      },
      {
        'name': "约拍吧",
        'icon_path': "https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/bag-rJh_xUx2E.png?sign=10005c52056f9201293f38afefb46e2b&t=1557320240"
      },
      {
        'name': "流浪卡片",
        'icon_path': "https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/postcard.png?sign=27a8f8104204918b82f8b8cd9ea8ffdd&t=1557320197"
      },

    ]
        activity = Activity.objects.all()[:3]
        activitySerialData = getSerializeData(activity)
        activity_list = []
        for a in activitySerialData:
            a['fields']['id'] = a['pk']
            activity_list.append(a['fields'])
        data = {
            # 'school': school_list,
            'activity': activity_list
        }
        return HttpResponse(json_dumps(data))

    except Exception as e:
        print(e)
        return  HttpResponse(json_dumps({'error': 1, 'errorMessage': e}))
