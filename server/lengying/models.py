from django.db import models
from django.utils import timezone
import datetime, time
import random


DESCRIPTION = [
    '万绿丛中一点红。',
    '红花也需绿叶配。 ',
    '光与影的完美配合',
    '特定的瞬间把握得好。 ',
    '摄影是我的第二语言。 ',
    '画面简洁，主体醒目。 ',
    '侧逆光用的恰到好处。 ',
    '影调色彩、环境很和谐。 ',
    '最重要的是思想的震撼力。 ',
    '顶光效果显现花朵的层次。 ',
    '背景模糊，使主体更显特色。 ',
    '特别重视人物的形态、神态。 ',
    '拍一个蛋糕也能成为艺术品。 ',
    '摄影师必须是照片的一部分。 ',
    '有时最简单的照片是最难拍的。 ',
    '色彩搭配合理，更显亮丽花朵。',
    '摄影就是狩猎，快门就是扳机。 ',
]

class Tags(models.Model):
    """
    标签
    """
    title = models.CharField(max_length=20, default='', null=True)

    class Meta:
        verbose_name = '标签'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.title


class Witget(models.Model):
    """
    小部件
    """
    like_nums    = models.IntegerField(default=0, null=True)                # 点赞数
    comment_nums = models.IntegerField(default=0, null=True)                # 评论数
    share_nums   = models.IntegerField( default=0, null=True)               # 分享数

class ImgUrls(models.Model):
    """
    标签
    """
    raw     = models.URLField(max_length=100, default='', null=False)       # 原生
    ragular = models.URLField(max_length=100, default='', null=False)       # 高清
    small   = models.URLField(max_length=100, default='', null=False)       # 标清

class Preview(models.Model):
    """
    预览图片
    """
    mid   = models.CharField(max_length=20, default='', null=False)                # 图片id
    urls = models.ForeignKey(ImgUrls, null=False, on_delete=models.CASCADE)        # 图片链接

class User(models.Model):
    """
    用户表
    """
    id                = models.IntegerField(auto_created=True, primary_key=True)
    uid               = models.CharField(max_length=50, default='', null=False)                                    # 用户id
    username          = models.CharField(max_length=30, default='zzz', null=False, verbose_name='用户名')           # 用户名
    location          = models.CharField(max_length=30, default='广东省,广州市,天河区', null=True, verbose_name='地区')# 用户设置地区
    gender            = models.BooleanField(default=False, verbose_name='性别')
    avater            = models.URLField(max_length=200, default='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUE2xfJCJDzzYAJbA_nHiDc95Dizm864c9Z6_6Lyp67D7YNpmONg', null=True)
    cover_img         = models.CharField(max_length=200, default='https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/me.jpg?sign=f15b743f1b5ef570e643555f2262b91f&t=1557139702', null=True)
    description       = models.CharField(max_length=400, default=random.choice(DESCRIPTION), null=True)
    school            = models.CharField(max_length=50, default='设置你的高校', null=True)
    upload_accept     = models.BooleanField( default=False)                                                         # 上传授权
    login_accept      = models.BooleanField(default=False)                                                          # 登录授权
    total_likes       = models.IntegerField(default=0, null=True)                                                   # 喜欢总数
    total_collections = models.IntegerField(default=0, null=True)                                                   # 影集总数
    total_photos      = models.IntegerField(default=0, null=True)                                                   # 图片总数
    followers_count   = models.IntegerField(default=0, null=True)                                                   # 粉丝数
    following_count   = models.IntegerField(default=0, null=True)                                                   # 关注数
    tags              = models.ManyToManyField(Tags, null=True)                                                     # 用户标签
    register_time     = models.DateTimeField(auto_now_add=True, verbose_name="注册时间")                                 # 创建时间


    class Meta:
        ordering = ['-register_time']
        verbose_name = '用户管理'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.username


class Imgitem(models.Model):
    """
    图片表
    """
    id          = models.AutoField(auto_created=True, primary_key=True)
    iid         = models.CharField(max_length=150, default='', null=False, verbose_name='图片id')              # 图片id
    activity_id = models.IntegerField(default=-1, verbose_name='活动id', null=True)                            # 活动id
    categotire  = models.CharField(max_length=20, default='other', null=True, verbose_name='分类')             # 分类
    create_time = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")                              # 创建时间
    times_stamp = models.IntegerField(default=0, null=False)                                                   # 时间戳
    title       = models.CharField(max_length=50, default='无题', null=True, verbose_name='标题')               # 标题
    description = models.CharField(max_length=200, default='', null=True)                                      # 描述
    location    = models.CharField(max_length=50, default='', null=True, verbose_name='拍摄地')                 # 拍照地点
    color       = models.CharField(max_length=50, default='#d7d7d7', null=True)                                # 背景颜色
    height      = models.IntegerField(default=0, null=False)                                                   # 高
    width       = models.IntegerField(default=0, null=False)                                                   # 宽
    tags        = models.ManyToManyField(Tags, null=True)                                                      # 标签
    user        = models.ForeignKey(User, null=False, on_delete=models.CASCADE)                                # 用户表
    isPassed    = models.BooleanField(default=False,  verbose_name='是否审核通过')                               # 图片是否通过
    featured = models.BooleanField(default=False, verbose_name='是否推荐')                                      # 是否特色 用于推荐
    isPrivate   = models.BooleanField(default=False, verbose_name='是否私密')                                   # 图片是否私密
    like_num    = models.IntegerField(default=0, null=True)
    comment_num = models.IntegerField(default=0, null=True)
    share_num   = models.IntegerField(default=0, null=True)

    def __str__(self):
        return ('标题为: ' + self.title + "一"*2 +  "一"*2 + '发布者为: ' + self.user.username)

    class Meta:
        ordering = ['-create_time']
        verbose_name = '图片管理'
        verbose_name_plural = verbose_name

class Collections(models.Model):
    """
    影集表
    """
    id             = models.AutoField(auto_created=True, primary_key=True)
    cid            = models.CharField(max_length=150, default='', null=False, verbose_name='影集id')                                       # 影集id
    create_time    = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")           # 创建时间
    title          = models.CharField(max_length=50, default='无题', null=True, verbose_name='标题')             # 标题
    description    = models.CharField(max_length=200, default='', null=True, verbose_name='描述')               # 描述
    private        = models.BooleanField(default=False)                                    # 是否是私密影集
    featured       = models.BooleanField(default=False)                                    # 是否特色 用于推荐
    tags           = models.ManyToManyField(Tags)                                          # 标签
    priview_photo  = models.CharField(max_length=200, null=True, default='')
    user           = models.ForeignKey(User, null=False, on_delete=models.CASCADE, default='')          # 用户表
    like_num       = models.IntegerField(default=0, null=True)
    comment_num    = models.IntegerField(default=0, null=True)
    share_num      = models.IntegerField(default=0, null=True)
    photos_num     = models.IntegerField(default=0, null=True)

    def __str__(self):
        return (self.user.username)

    class Meta:
        ordering = ['-create_time']
        verbose_name = '影集管理'
        verbose_name_plural = verbose_name


class Comment(models.Model):
    """
    评论表
    """
    id          = models.CharField(primary_key=True,max_length=32, null=False, verbose_name='评论id')                          # 评论id
    pid         = models.CharField(max_length=32, default=None, null=True)                              # 父级评论id
    source_type = models.IntegerField(default=1, null=False)                                            # 被评论的资源类型 1-文章  2-人
    source_id   = models.CharField(max_length=200, null=False, default='', verbose_name='被评论资源id')                               # 被资源的id
    from_id     = models.CharField(max_length=32, null=False, default='')                               # 评论者id
    from_name   = models.CharField(max_length=32, null=False, default='', verbose_name='评论者名字')                               # 评论者名字
    content     = models.CharField(max_length=512, default=None, verbose_name='评论内容')                                        # 评论内容
    to_id       = models.CharField(max_length=32, default=None, null=True)                              # 被评论者id
    to_name     = models.CharField(max_length=32, default=None, null=True)                              # 被评论者名字
    like_num    = models.IntegerField(default=0, verbose_name='点赞量')                                  # 点赞数量
    create_time = models.DateTimeField(verbose_name="创建时间", auto_now=True)           # 创建时间
    update_time = models.DateTimeField(verbose_name='更新时间', auto_now=True)             # 更新时间
    avater      = models.URLField(max_length=250, null=True, default='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUE2xfJCJDzzYAJbA_nHiDc95Dizm864c9Z6_6Lyp67D7YNpmONg')

    class Meta:
        ordering = ['-id']
        verbose_name = '评论管理'
        verbose_name_plural = verbose_name


    def __str__(self):
        return self.content


class Feedback(models.Model):
    """
    意见反馈
    """
    id          = models.AutoField(auto_created=True, primary_key=True)
    username    = models.CharField(max_length=30, default='zzz', null=False, verbose_name='用户名')         # 用户名
    publishTime = models.DateTimeField(auto_now_add=True, verbose_name="提交时间")
    textInfo    = models.TextField( verbose_name='内容')
    contactInfo = models.CharField(max_length=30, default='', null=False, verbose_name="联系方式")

    def __str__(self):
        return self.username

    class Meta:
        ordering = ['-publishTime']
        verbose_name = '意见反馈'
        verbose_name_plural = verbose_name


class Contact(models.Model):
    """
    联系
    """
    id          = models.AutoField(auto_created=True, primary_key=True)
    username    = models.CharField(max_length=30, default='zzz', null=False, verbose_name='用户名')  # 用户名
    userCall    = models.CharField(max_length=20, default='zzz', null=False, verbose_name='称呼')  # 称呼
    publishTime = models.DateTimeField(auto_now_add=True, verbose_name="提交时间")
    textInfo    = models.TextField(verbose_name='内容')
    contactInfo = models.CharField(max_length=30, default='', null=False, verbose_name="联系方式")

    def __str__(self):
        return self.username

    class Meta:
        ordering = ['-publishTime']
        verbose_name = '联系管理'
        verbose_name_plural = verbose_name


class Notify(models.Model):
    """
    消息表
    type: 消息类型                       0 - 公告，1 - 提醒， 2 - 私信
    target_id: 消息作用的目标id          'all'作用于所有用户， 即发公告， 为用户id时，则是私信消息或者点赞等提醒
    target_type: 消息作用的对象类型        1 - 图片， 2 - 文章, 3 - 用户
    sender_type: 消息发送者的类型         1 - 系统， 2 - 用户
    """
    id          = models.AutoField(auto_created=True, primary_key=True, verbose_name='消息id')
    type        = models.IntegerField(verbose_name='消息种类', null=False, default=1)
    rule        = models.CharField(max_length=10, verbose_name='消息作用类型', null=False, default='like')
    target_id   = models.CharField(max_length=200, verbose_name='目标id', null=True, default='all')
    target_type = models.IntegerField(verbose_name='目标种类', null=False, default=1)
    sender_id   = models.IntegerField(verbose_name='发送者id', null=True)
    sender_type = models.IntegerField(verbose_name='发送者种类', null=False, default=1)
    content     = models.TextField(verbose_name='内容', null=True, default='')
    create_at   = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        ordering = ['-create_at']
        verbose_name = '消息管理'
        verbose_name_plural = verbose_name


class UserNotifyQueue(models.Model):
    """
    用户消息队列表
    """
    id        = models.AutoField(auto_created=True, primary_key=True)
    rule      = models.CharField(max_length=10, verbose_name='消息作用类型', null=False, default='like')
    notify_id = models.IntegerField(verbose_name='消息id')
    uid       = models.CharField(max_length=50, verbose_name='用户id')
    is_read   = models.BooleanField(default=False)
    create_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')


    class Meta:
        ordering = ['-create_at']
        verbose_name = '用户消息队列管理'
        verbose_name_plural = verbose_name


class SubscribeNotify(models.Model):
    """
    消息订阅表
    """
    id          = models.AutoField(auto_created=True, primary_key=True)
    uid         = models.CharField(max_length=50, verbose_name='用户id')
    rule        = models.CharField(max_length=10, verbose_name='消息作用类型', null=False, default='like')
    target_id   = models.CharField(max_length=100, verbose_name='目标id', null=True, default='all')
    target_type = models.IntegerField(verbose_name='目标种类', null=False, default=1)
    create_at   = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        ordering = ['-create_at']
        verbose_name = '用户消息订阅管理'
        verbose_name_plural = verbose_name


class SubscribeConfig(models.Model):
    """
    消息配置表
    """
    id       = models.AutoField(auto_created=True, primary_key=True)
    uid      = models.CharField(max_length=50, verbose_name='用户id')
    rule     = models.CharField(max_length=10, verbose_name='消息作用类型', null=False, default='like')
    is_valid = models.BooleanField(default=True, verbose_name='是否有效')


class UserGeoinfo(models.Model):
    """
    用户经纬度
    """
    id            = models.AutoField(auto_created=True, primary_key=True)
    uid           = models.CharField(max_length=50, default='', null=False)
    lat           = models.FloatField(verbose_name='纬度')
    long          = models.FloatField(verbose_name='经度')
    geohash_value = models.CharField(max_length=20, verbose_name='哈希值', null=False)
    update_at     = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        ordering = ['-update_at']
        verbose_name = '用户geo管理'
        verbose_name_plural = verbose_name


class Activity(models.Model):
    """
    活动表
    """
    id              = models.AutoField(auto_created=True, primary_key=True, verbose_name='活动ID')
    title           = models.CharField(max_length=100, null=False, verbose_name='活动标题')
    description     = models.TextField(verbose_name='活动描述', default='emmm')
    prize     = models.TextField(verbose_name='活动奖品', default='emmm')
    start_time      = models.CharField(max_length=20, null=False, verbose_name='起始时间')
    end_time        = models.CharField(max_length=20, null=False, verbose_name='结束时间')
    posters         = models.URLField(verbose_name='海报地址')
    create_at       = models.DateTimeField(auto_now_add=True, verbose_name='发布时间')
    host            = models.CharField(max_length=50, null=False, verbose_name='主办方')
    select_way      = models.CharField(max_length=100, null=False, verbose_name='评选方式')
    register_method = models.CharField(max_length=200, null=False, verbose_name='报名方式')
    work_require    = models.TextField(verbose_name='作品要求', default='emmm')

    class Meta:
        ordering = ['create_at']
        verbose_name = '活动管理'
        verbose_name_plural = verbose_name


class Market(models.Model):
    """
    交易信息表
    """
    id         = models.AutoField(auto_created=True, primary_key=True, verbose_name='交易ID')
    is_done    = models.BooleanField(default=False, verbose_name='是否解决')
    start_time = models.CharField(max_length=100, verbose_name='起始时间')
    end_time   = models.CharField(max_length=100, verbose_name='结束时间')
    require    = models.TextField(verbose_name='具体要求')
    thing      = models.TextField(verbose_name='做什么事')
    money      = models.CharField(max_length=100, verbose_name='价格说明', null=True, default='私聊或面谈')
    place      = models.CharField(max_length=200, verbose_name='约拍地点')
    create_at  = models.DateTimeField(auto_now_add=True, verbose_name='发布时间')
    user       = models.ForeignKey(User, null=False, on_delete=models.CASCADE, default='')

    class Meta:
        ordering = ['-create_at']
        verbose_name = '交易信息管理'
        verbose_name_plural = verbose_name


class Postcard(models.Model):
    """
    流浪卡片
    """
    id            = models.AutoField(auto_created=True, primary_key=True, verbose_name='卡片名片ID')
    is_passed     = models.BooleanField(default=False, verbose_name='是否通过')
    # img           = models.CharField(max_length=150, verbose_name='图片封面', null=True ,default='')
    canvas_img_id = models.CharField(max_length=150, verbose_name='卡片canvas云id', null=False, default='')
    by_name       = models.CharField(max_length=50, verbose_name='寄卡人署名', null=False)
    to_name       = models.CharField(max_length=50, verbose_name='收卡人称呼', null=True, default='远方的ta')
    content       = models.TextField(verbose_name='内容')
    create_at     = models.DateTimeField(auto_now_add=True, verbose_name='发布时间')
    user          = models.ForeignKey(User, null=False, on_delete=models.CASCADE, default='')
    date          = models.CharField(max_length=10, verbose_name='日期', null=False)
    year          = models.CharField(max_length=10, verbose_name='年份', null=False)

    class Meta:
        ordering = ['id']
        verbose_name = '卡片管理'
        verbose_name_plural = verbose_name

class ReceiveCard(models.Model):
    """
    用户收留的卡片
    """
    id          = models.AutoField(auto_created=True, primary_key=True, verbose_name='主键')
    pid         = models.IntegerField(verbose_name='收留的卡片ID')
    uid         = models.CharField(max_length=50, default='', null=False,verbose_name='用户ID')
    create_at   = models.DateTimeField(auto_now_add=True, verbose_name='收留时间')

    class Meta:
        ordering = ['-create_at']
        verbose_name = '用户收留卡片管理'
        verbose_name_plural = verbose_name