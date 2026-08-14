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
]