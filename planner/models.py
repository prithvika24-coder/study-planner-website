# Create your models here.
from django.db import models


class StudyTask(models.Model):
    title = models.CharField(max_length=200)
    subject = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=20, default="Medium")
    due_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    time = models.TimeField(null=True, blank=True)
    def __str__(self):
        return self.title