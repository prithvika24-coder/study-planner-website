from django.urls import path
from .views import get_tasks, add_task, signup, user_login, signup_page, login_page, current_user, user_logout

urlpatterns = [
    path("tasks/", get_tasks, name="get_tasks"),
    path("tasks/add/", add_task, name="add_task"),
    path("signup/", signup, name="signup"),
    path("login/", user_login, name="login"),
    path("signup-page/", signup_page, name="signup_page"),
    path("login-page/", login_page, name="login_page"),
    path("user/", current_user, name="current_user"),
    path("logout/", user_logout, name="logout"),
]