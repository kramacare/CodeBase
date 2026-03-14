from django.urls import path
from .views import (
    CustomTokenObtainPairView,
    patient_signup_view,
    clinic_signup_view,
    login_view,
    profile_view
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('patient/signup/', patient_signup_view, name='patient-signup'),
    path('clinic/signup/', clinic_signup_view, name='clinic-signup'),
    path('login/', login_view, name='login'),
    path('profile/', profile_view, name='profile'),
]
