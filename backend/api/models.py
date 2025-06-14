from django.db import models
from django.contrib.auth.models import AbstractUser,BaseUserManager


class AccountManager(BaseUserManager):
    def create_user(self,id,email,password,**extra_fields):
        if not id:
            raise ValueError("the id must be set")
        if not password:
            raise ValueError("the password must be set")
        email=self.normalize_email(email)
        user=self.model(id=id,email=email,**extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self,id,email,password,**extra_fields):
        extra_fields.setdefault("is_staff",True)
        extra_fields.setdefault("is_superuser",True)
        
        return self.create_user(id,email,password,**extra_fields)
    
class Account(AbstractUser):
    id=models.CharField(max_length=255, primary_key=True,unique=True)
    email =models.EmailField(blank=True)
    
    USERNAME_FIELD="id"
    REQUIRED_FIELDS=["email"]
    
    objects=AccountManager()

class Inventory(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    count=models.IntegerField(default=0)
    
    