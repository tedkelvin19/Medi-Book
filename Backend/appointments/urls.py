from django.urls import path
from .views import (
    DoctorListView, 
    DoctorDetailView,
    AppointmentListCreateView, 
    AppointmentDetailView, 
    CreateDoctorProfileView,
    AvailabilitySlotListCreateView,
    AvailabilitySlotDetailView,
    AppointmentRatingView,
    NotificationListView,
    NotificationMarkReadView,
    PaymentListCreateView,
    PaymentDetailView
)

urlpatterns = [
    path('doctors/',              DoctorListView.as_view(),            name='doctor-list'),
    path('doctors/create/',        CreateDoctorProfileView.as_view(),  name='doctor-create'), 
    path('doctors/<int:pk>/',     DoctorDetailView.as_view(),          name='doctor-detail'),
    path('appointments/',         AppointmentListCreateView.as_view(),  name='appointment-list'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(),    name='appointment-detail'),
    path('appointments/<int:pk>/rate/', AppointmentRatingView.as_view(),   name='appointment-rate'),
    path('availability/',              AvailabilitySlotListCreateView.as_view(),name='availability-list'),
    path('availability/<int:pk>/',     AvailabilitySlotDetailView.as_view(),    name='availability-detail'),
    path('notifications/',                NotificationListView.as_view(),           name='notifications'),
    path('notifications/read/',           NotificationMarkReadView.as_view(),       name='notifications-read-all'),
    path('notifications/<int:pk>/read/',  NotificationMarkReadView.as_view(),       name='notifications-read-one'),
    path('payments/',                     PaymentListCreateView.as_view(),          name='payment-list'),
    path('payments/<int:pk>/',            PaymentDetailView.as_view(),              name='payment-detail'),
]
