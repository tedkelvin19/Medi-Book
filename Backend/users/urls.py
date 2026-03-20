from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from .views import (
    RegisterView, MeView,
    AdminUserListView, AdminUserDetailView,
    AdminStatsView, AdminUserAppointmentsView,
)
from .throttles import LoginRateThrottle


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]


urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(),                 name='register'),
    path('login/',    ThrottledTokenObtainPairView.as_view(), name='login'),
    path('refresh/',  TokenRefreshView.as_view(),             name='token_refresh'),
    path('logout/',   TokenBlacklistView.as_view(),           name='logout'),
    path('me/',       MeView.as_view(),                       name='me'),

    # Admin only
    path('admin/users/',
         AdminUserListView.as_view(),
         name='admin-users'),
    path('admin/users/<int:pk>/',
         AdminUserDetailView.as_view(),
         name='admin-user-detail'),
    path('admin/users/<int:pk>/appointments/',
         AdminUserAppointmentsView.as_view(),       
         name='admin-user-appointments'),
    path('admin/stats/',
         AdminStatsView.as_view(),
         name='admin-stats'),
]