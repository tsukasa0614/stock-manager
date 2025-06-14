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

# 在庫
class Inventory(models.Model):
    id = models.AutoField(primary_key=True)
    image = models.ImageField(upload_to="inventory_images/",null=True,blank=True)
    item_code = models.CharField(max_length=255,unique=True)
    product_name = models.CharField(max_length=255)
    standard = models.CharField(max_length=255,null=True,blank=True)
    category = models.CharField(max_length=255)
    stock_quantity = models.IntegerField(default=0)
    lowest_stock = models.IntegerField(default=0)
    unit = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=10,decimal_places=2,default=0.00)
    storing_place = models.CharField(max_length=255,null=True,blank=True)
    memo = models.TextField(null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

#工場    
class Factory(models.Model):
    id = models.AutoField(primary_key=True)
    factory_name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    manager = models.CharField(max_length=255)
    status = models.CharField(max_length=255)
    capacity = models.IntegerField(default=0)
    memo = models.TextField(null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#在庫移動
class StockMovement(models.Model):
    id = models.AutoField(primary_key=True)
    item_id = models.ForeignKey(Inventory,on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=255)
    quantity = models.IntegerField(default=0)
    reason = models.CharField(max_length=255,null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#棚卸し
class Stocktaking(models.Model):
    id = models.AutoField(primary_key=True)
    item_id = models.ForeignKey(Inventory,on_delete=models.CASCADE)
    theoretical_stock = models.IntegerField(default=0)
    actual_stock = models.IntegerField(default=0)
    difference = models.IntegerField(default=0)
    user_id = models.ForeignKey(Account,on_delete=models.CASCADE)
    status = models.CharField(max_length=255)
    memo = models.TextField(null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
