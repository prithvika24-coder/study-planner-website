from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
import json
from .models import StudyTask


def get_tasks(request):
    tasks = StudyTask.objects.all().order_by("-created_at")

    data = []

    for task in tasks:
        data.append({
            "id": task.id,
            "title": task.title,
            "subject": task.subject,
            "description": task.description,
            "priority": task.priority,
            "due_date": task.due_date,
            "completed": task.completed,
        })

    return JsonResponse(data, safe=False)
from django.shortcuts import render


def home(request):
    return render(request, "index.html")
def signup_page(request):
    return render(request, "signup.html")
def login_page(request):
    return render(request, "login.html")
@csrf_exempt
def add_task(request):
    if request.method == "POST":
        data = json.loads(request.body)

        task = StudyTask.objects.create(
            title=data.get("title"),
            subject=data.get("subject"),
            description=data.get("description", ""),
            priority=data.get("priority", "Medium"),
            due_date=data.get("due_date") or None,
            time=data.get("time") or None,
            completed=data.get("completed", False),
        )

        return JsonResponse({
            "id": task.id,
            "title": task.title,
            "subject": task.subject,
            "description": task.description,
            "priority": task.priority,
            "due_date": task.due_date,
            "time": task.time,
            "completed": task.completed,
        })

    return JsonResponse(
        {"error": "Only POST request allowed"},
        status=405
    )
@csrf_exempt
def signup(request):
    if request.method == "POST":
        data = json.loads(request.body)

        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not password:
            return JsonResponse(
                {"error": "Username and password are required"},
                status=400
            )

        if User.objects.filter(username=username).exists():
            return JsonResponse(
                {"error": "Username already exists"},
                status=400
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        return JsonResponse({
            "message": "Signup successful",
            "username": user.username
        })

    return JsonResponse(
        {"error": "Only POST request allowed"},
        status=405
    )
@csrf_exempt
def user_login(request):
    if request.method == "POST":
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:
            login(request, user)

            return JsonResponse({
                "message": "Login successful",
                "username": user.username
            })

        return JsonResponse(
            {"error": "Invalid username or password"},
            status=401
        )

    return JsonResponse(
        {"error": "Only POST request allowed"},
        status=405
    )
from django.contrib.auth import logout


def current_user(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "logged_in": True,
            "username": request.user.username,
            "email": request.user.email
        })

    return JsonResponse({
        "logged_in": False
    })


@csrf_exempt
def user_logout(request):
    if request.method == "POST":
        logout(request)

        return JsonResponse({
            "message": "Logout successful"
        })

    return JsonResponse(
        {"error": "Only POST request allowed"},
        status=405
    )