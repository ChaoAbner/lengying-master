from django.contrib import admin

# Register your models here.
from .models import User, Imgitem, Tags, Collections, Feedback, Contact, Notify, SubscribeNotify, UserNotifyQueue,\
    UserGeoinfo, Activity, Market,Postcard,ReceiveCard

class UserAdmin(admin.ModelAdmin):
    # 设置显示数据库中哪些字段
    list_display = ['id', 'username', 'gender' ,'location', 'school', 'register_time']

admin.site.register(User, UserAdmin)


class ImgItemAdmin(admin.ModelAdmin):
    list_display = ['iid', 'user', 'activity_id', 'location', 'categotire', 'title', 'create_time', 'featured', 'isPassed', 'isPrivate']

admin.site.register(Imgitem, ImgItemAdmin)


class CollectionAdmin(admin.ModelAdmin):
    list_display = ['cid', 'title', 'user',  'description', 'create_time']

admin.site.register(Collections, CollectionAdmin)

class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['username', 'textInfo', 'contactInfo',  'publishTime']

admin.site.register(Feedback, FeedbackAdmin)

class ContactAdmin(admin.ModelAdmin):
    list_display = ['username', 'userCall', 'textInfo',  'contactInfo', 'publishTime']

admin.site.register(Contact, ContactAdmin)


class NotifyAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'rule', 'sender_id', 'target_id', 'content', 'create_at']
admin.site.register(Notify, NotifyAdmin)


class UserNotifyQueueAdmin(admin.ModelAdmin):
    list_display = ['id', 'rule', 'uid', 'notify_id', 'is_read', 'create_at']
admin.site.register(UserNotifyQueue, UserNotifyQueueAdmin)


class SubscribeNotifyAdmin(admin.ModelAdmin):
    list_display = ['uid', 'rule', 'target_id', 'target_type', 'create_at']
admin.site.register(SubscribeNotify, SubscribeNotifyAdmin)


class UserGeoAdmin(admin.ModelAdmin):
    list_display = ['uid', 'lat', 'long', 'geohash_value', 'update_at']
admin.site.register(UserGeoinfo, UserGeoAdmin)


class ActivityAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'start_time', 'end_time', 'create_at']
admin.site.register(Activity, ActivityAdmin)


class MarketAdmin(admin.ModelAdmin):
    list_display = ['id', 'is_done', 'start_time', 'end_time', 'create_at']
admin.site.register(Market, MarketAdmin)

class PostcardAdmin(admin.ModelAdmin):
    list_display = ['id', 'is_passed', 'canvas_img_id', 'content', 'create_at', 'user']
admin.site.register(Postcard, PostcardAdmin)

class ReceievePostcardAdmin(admin.ModelAdmin):
    list_display = ['id', 'pid', 'uid', 'create_at']
admin.site.register(ReceiveCard, ReceievePostcardAdmin)

admin.site.register(Tags)
