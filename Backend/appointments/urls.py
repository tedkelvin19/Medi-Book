from django.urls import path
from .views import (
    DoctorListView, DoctorDetailView,
    AppointmentListCreateView, AppointmentDetailView, CreateDoctorProfileView,
)

urlpatterns = [
    path('doctors/',              DoctorListView.as_view(),            name='doctor-list'),
    path('doctors/create/',        CreateDoctorProfileView.as_view(),  name='doctor-create'), 
    path('doctors/<int:pk>/',     DoctorDetailView.as_view(),          name='doctor-detail'),
    path('appointments/',         AppointmentListCreateView.as_view(),  name='appointment-list'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(),    name='appointment-detail'),
]