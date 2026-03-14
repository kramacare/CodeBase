from django.contrib import admin
from .models import Review, ReviewReply, ReviewFlag


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('patient', 'clinic', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('patient__user__email', 'clinic__name', 'comment')
    raw_id_fields = ('patient', 'clinic')
    ordering = ('-created_at',)


@admin.register(ReviewReply)
class ReviewReplyAdmin(admin.ModelAdmin):
    list_display = ('review', 'clinic', 'is_helpful', 'created_at')
    list_filter = ('is_helpful', 'created_at')
    search_fields = ('review__patient__user__email', 'clinic__clinic_name', 'reply')
    raw_id_fields = ('review', 'clinic')
    ordering = ('-created_at',)


@admin.register(ReviewFlag)
class ReviewFlagAdmin(admin.ModelAdmin):
    list_display = ('review', 'reporter', 'reason', 'is_resolved', 'created_at')
    list_filter = ('is_resolved', 'created_at')
    search_fields = ('review__patient__user__email', 'reporter__email', 'reason')
    raw_id_fields = ('review', 'reporter')
    ordering = ('-created_at',)
