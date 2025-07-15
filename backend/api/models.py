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

#工場（Inventoryより前に定義）
class Factory(models.Model):
    id = models.AutoField(primary_key=True)
    factory_name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    status = models.CharField(max_length=255,choices=[
        ("active","active"),
        ("inactive","inactive")
        ],default="active")
    capacity = models.IntegerField(default=0)
    memo = models.TextField(null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.factory_name

# 工場管理者テーブル
class Manager(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey('Account', on_delete=models.CASCADE, help_text="管理者ユーザー")
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, help_text="管理対象工場")
    role = models.CharField(max_length=255, choices=[
        ("primary", "主任管理者"),
        ("assistant", "副管理者"),
        ("supervisor", "監督者")
    ], default="primary", help_text="管理者の役割")
    permissions = models.JSONField(default=dict, help_text="権限設定")
    assigned_at = models.DateTimeField(auto_now_add=True, help_text="任命日時")
    is_active = models.BooleanField(default=True, help_text="有効/無効")
    memo = models.TextField(null=True, blank=True, help_text="メモ")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'factory']  # 同じユーザーが同じ工場を重複して管理しないように
        verbose_name = "工場管理者"
        verbose_name_plural = "工場管理者"
    
    def __str__(self):
        return f"{self.user.id} - {self.factory.factory_name} ({self.get_role_display()})"
    
class Account(AbstractUser):
    id=models.CharField(max_length=255, primary_key=True,unique=True)
    email =models.EmailField(blank=True)
    # 多対多関係を削除し、Managerテーブル経由でアクセスするように変更
    # factories = models.ManyToManyField(Factory, blank=True, help_text="管理する工場")
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    
    USERNAME_FIELD="id"
    REQUIRED_FIELDS=["email"]
    
    objects=AccountManager()
    
    @property
    def managed_factories(self):
        """管理している工場を取得"""
        return Factory.objects.filter(manager__user=self, manager__is_active=True)
    
    def is_factory_manager(self, factory):
        """特定の工場の管理者かどうかを確認"""
        return Manager.objects.filter(user=self, factory=factory, is_active=True).exists()
    
    def get_factory_role(self, factory):
        """特定の工場での役割を取得"""
        try:
            manager = Manager.objects.get(user=self, factory=factory, is_active=True)
            return manager.role
        except Manager.DoesNotExist:
            return None

# 在庫
class Inventory(models.Model):
    id = models.AutoField(primary_key=True)
    image = models.ImageField(upload_to="inventory_images/",null=True,blank=True, help_text="画像")
    item_code = models.CharField(max_length=255,unique=True, help_text="商品コード")
    product_name = models.CharField(max_length=255, help_text="商品名")
    standard = models.CharField(max_length=255,null=True,blank=True, help_text="規格")
    category = models.CharField(max_length=255, help_text="カテゴリ")
    stock_quantity = models.IntegerField(default=0, help_text="在庫数")
    lowest_stock = models.IntegerField(default=0, help_text="最低在庫数")
    unit = models.CharField(max_length=255, help_text="単位")
    unit_price = models.DecimalField(max_digits=10,decimal_places=2,default=0.00, help_text="単価")
    storing_place = models.CharField(max_length=255,null=True,blank=True, help_text="保管場所")
    memo = models.TextField(null=True,blank=True, help_text="メモ")
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, help_text="所属工場")
    
    created_at = models.DateTimeField(auto_now_add=True, help_text="作成日時")
    updated_at = models.DateTimeField(auto_now=True, help_text="更新日時")
    
    def __str__(self):
        return f"{self.item_code} - {self.product_name}"

#在庫移動
class StockMovement(models.Model):
    id = models.AutoField(primary_key=True)
    item_id = models.ForeignKey(Inventory,on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=255,choices=[
        ("in","in"),
        ("out","out")
        ],default="in")
    quantity = models.IntegerField(default=0)
    reason = models.TextField(null=True,blank=True)
    user_id = models.ForeignKey(Account, on_delete=models.CASCADE, help_text="実行者")
    factory_id = models.ForeignKey(Factory, on_delete=models.CASCADE, help_text="対象工場")
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