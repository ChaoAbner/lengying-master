# -*- coding:utf-8 -*-
__author__ = '_chao'


from django.urls import path, re_path
from . import views

app_name = 'lengying'

urlpatterns = [
    path('lengying/getdata/random', views.lengying_get_random),             # 首页unsplash图片加载
    path('lengying/search/get_coll', views.lengying_get_coll),
    path('lengying/search/query', views.back_search_result),
    path('lengying/detail/cate', views.detail_cate),
    path('lengying/detail/coll', views.detail_coll),
    path('lengying/images/cate/<cate_name>.jpg', views.img_cate),
    path('lengying/images/temp/<temp_name>', views.temp_img),
    path('lengying/images/get_info', views.get_img_info),
    path('lengying/images/random', views.random_img),
    path('lengying/download_img', views.download_img),                      # 图片下载url
    path('lengying/rec/get_like', views.insert_like),                       # 图片点赞
    path('lengying/rec/get_comment', views.insert_comment_like),            # 评论点赞
    path('lengying/rec/update_comment_like', views.update_comment_like),    # 更新评论点赞数据
    path('lengying/rec/back_comment_length', views.back_comment_length),    # 获取用户的所有评论信息的长度
    path('lengying/user/get_img', views.get_user_img),                      # unsplash用户图片数据
    path('lengying/user/get_info', views.get_user_info),                    # unsplash用户信息
    path('lengying/user/get_coll', views.get_user_coll),                    # unsplash用户影集数据
    path('lengying/user/get_likes', views.get_user_likes),                  # unsplash用户喜欢数据
    path('lengying/search/get_init', views.get_init_search_res),            # 搜索初始化数据
    path('lengying/search/get_photos', views.get_photos_search_res),        # 搜索图片
    path('lengying/search/get_colls', views.get_colls_search_res),          # 搜索影集
    path('lengying/search/get_users', views.get_users_search_res),          # 搜索用户
    path('lengying/comment/get_comments', views.get_comments),              # 获取某图片的评论列表
    path('lengying/comment/insert_comments', views.insert_comments),        # 添加新的评论
    path('lengying/comment/get_length', views.get_comment_length),          # 获取评论长度
    path('lengying/comment/get_perview_clength', views.get_perview_clength),# 获取预览页面中的图片评论数
    path('lengying/service/image/new_push', views.new_push_img),            # 新发布的图片
    path('lengying/service/coll/new_push', views.new_push_coll),            # 新创建的影集
    path('lengying/service/coll/delImg', views.coll_delImg),                # 删除影集中的图片
    path('lengying/service/user/new_push', views.new_push_user),            # 新用户登录注册
    path('lengying/service/user/update_info', views.update_info_user),      # 用户更新信息
    path('lengying/service/user/get_info', views.get_info_user),            # 获取用户信息
    path('lengying/service/image/get_refresh', views.refresh_img),          # 首页图片刷新
    path('lengying/service/get_university', views.back_university_info),    # 获取高校信息
    path('lengying/service/feedback', views.feedback),                      # 反馈
    path('lengying/service/contact', views.contact),                        # 联系
    path('lengying/service/report', views.report),                          # 举报
    path('lengying/service/subscribe', views.subscribe),                    # 添加或取消用户关注
    path('lengying/service/subscribe_userinfo', views.subscribe_userinfo),  # 获取用户关注者信息
    path('lengying/service/fans_userinfo', views.fans_userinfo),            # 获取用户粉丝信息
    path('lengying/service/like_userinfo', views.like_userinfo),            # 获取用户喜欢信息
    path('lengying/service/get_person_img', views.get_person_img),          # 获取用户图片
    path('lengying/service/get_person_coll', views.get_person_coll),        # 获取用户影集
    path('lengying/service/add_img_to_coll', views.add_img_to_coll),        # 添加图片至用户影集
    path('lengying/service/more/coll', views.more_coll),                    # 更多影集
    path('lengying/service/more/cate', views.more_cate),                    # 更多分类
    path('lengying/service/get_notify', views.get_notify),                  # 获取通知消息
    path('lengying/service/get_talk_record', views.get_talk_record),        # 获取消息记录
    path('lengying/service/get_remind', views.get_remind),                  # 获取提醒
    path('lengying/service/get_userGeo', views.get_userGeo),                # 获取用户附近的人
    path('lengying/service/do_stray', views.do_stray),                      # 添加或收留一张流浪卡片
    path('lengying/service/get_card', views.get_card),                      # 获取自己的卡片，发出或接受
    path('lengying/service/get_market', views.get_market),                  # 获取自己的约拍记录，添加约拍，关闭约拍, 用户接单
    path('lengying/service/get_scenery', views.get_scenery),                # 获取校园风采
    path('lengying/service/get_activity', views.get_activity),              # 获取活动列表
]
