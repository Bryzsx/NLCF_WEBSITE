from django.urls import path

from . import views

urlpatterns = [
    path("events", views.events, name="events"),
    path("contact", views.contact, name="contact"),
]

