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

# 倉庫テーブル
class Warehouse(models.Model):
    id = models.AutoField(primary_key=True)
    warehouse_name = models.CharField(max_length=255, help_text="倉庫名")
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, help_text="所属工場")
    description = models.TextField(null=True, blank=True, help_text="説明")
    width = models.IntegerField(default=10, help_text="マップ横幅（グリッド単位）")
    height = models.IntegerField(default=10, help_text="マップ縦幅（グリッド単位）")
    status = models.CharField(max_length=255, choices=[
        ("active", "稼働中"),
        ("inactive", "停止中"),
        ("maintenance", "メンテナンス中")
    ], default="active", help_text="倉庫ステータス")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "倉庫"
        verbose_name_plural = "倉庫"
    
    def __str__(self):
        return f"{self.factory.factory_name} - {self.warehouse_name}"

# 置き場テーブル（旧システム）
class StorageLocation(models.Model):
    id = models.AutoField(primary_key=True)
    location_name = models.CharField(max_length=255, help_text="置き場名")
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, help_text="所属倉庫")
    x_position = models.IntegerField(help_text="X座標（グリッド単位）")
    y_position = models.IntegerField(help_text="Y座標（グリッド単位）")
    width = models.IntegerField(default=1, help_text="置き場の横幅（グリッド単位）")
    height = models.IntegerField(default=1, help_text="置き場の縦幅（グリッド単位）")
    capacity = models.IntegerField(default=100, help_text="収容能力")
    current_stock = models.IntegerField(default=0, help_text="現在の在庫数")
    location_type = models.CharField(max_length=255, choices=[
        ("entrance", "入口"),
        ("square", "置き場四角"),
        ("circle", "置き場丸"),
        ("l_shape", "置き場L字"),
        ("u_shape", "置き場コの字")
    ], default="square", help_text="置き場タイプ")
    status = models.CharField(max_length=255, choices=[
        ("available", "利用可能"),
        ("occupied", "使用中"),
        ("maintenance", "メンテナンス中"),
        ("reserved", "予約済み")
    ], default="available", help_text="置き場ステータス")
    memo = models.TextField(null=True, blank=True, help_text="メモ")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "置き場（旧）"
        verbose_name_plural = "置き場（旧）"
        unique_together = ['warehouse', 'x_position', 'y_position']  # 同じ倉庫内で座標の重複を防ぐ
    
    def __str__(self):
        return f"{self.warehouse.warehouse_name} - {self.location_name} ({self.x_position}, {self.y_position})"
    
    @property
    def utilization_rate(self):
        """使用率を計算"""
        if self.capacity == 0:
            return 0.0
        return (self.current_stock / self.capacity) * 100

# 置き場テーブル（新システム）
class StorageArea(models.Model):
    id = models.AutoField(primary_key=True)
    area_name = models.CharField(max_length=1, help_text="置き場名（A, B, C...）")
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, help_text="所属工場")
    width = models.IntegerField(default=3, help_text="置き場の横幅（座標数）")
    height = models.IntegerField(default=3, help_text="置き場の縦幅（座標数）")
    description = models.TextField(null=True, blank=True, help_text="説明")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "置き場（新）"
        verbose_name_plural = "置き場（新）"
        unique_together = ['factory', 'area_name']  # 同じ工場内でアルファベットの重複を防ぐ
    
    def __str__(self):
        return f"{self.factory.factory_name} - {self.area_name}"
    
    @property
    def total_coordinates(self):
        """総座標数を取得"""
        return self.width * self.height
    
    @property
    def occupied_coordinates(self):
        """使用中の座標数を取得"""
        return self.coordinate_set.filter(inventory__isnull=False).count()

# 座標テーブル（新システム）
class Coordinate(models.Model):
    id = models.AutoField(primary_key=True)
    storage_area = models.ForeignKey(StorageArea, on_delete=models.CASCADE, help_text="所属置き場")
    x_position = models.IntegerField(help_text="X座標（1, 2, 3...）")
    y_position = models.IntegerField(help_text="Y座標（1, 2, 3...）")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "座標"
        verbose_name_plural = "座標"
        unique_together = ['storage_area', 'x_position', 'y_position']  # 同じ置き場内で座標の重複を防ぐ
    
    def __str__(self):
        return f"{self.storage_area.area_name}-{self.x_position}-{self.y_position}"
    
    @property
    def coordinate_name(self):
        """座標名を取得（例：A-1-1）"""
        return f"{self.storage_area.area_name}-{self.x_position}-{self.y_position}"
    
    @property
    def position_name(self):
        """位置名を取得（例：1-1）"""
        return f"{self.x_position}-{self.y_position}"

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
    supplier = models.CharField(max_length=255, null=True, blank=True, help_text="発注先")
    storing_place = models.CharField(max_length=255,null=True,blank=True, help_text="保管場所（旧システム互換）")
    coordinate = models.ForeignKey(Coordinate, on_delete=models.CASCADE, null=True, blank=True, help_text="保管座標（新システム）")
    memo = models.TextField(null=True,blank=True, help_text="メモ")
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, help_text="所属工場")
    
    created_at = models.DateTimeField(auto_now_add=True, help_text="作成日時")
    updated_at = models.DateTimeField(auto_now=True, help_text="更新日時")
    
    def __str__(self):
        return f"{self.item_code} - {self.product_name}"
    
    @property
    def storage_location_name(self):
        """保管場所名を取得（新旧システム対応）"""
        if self.coordinate:
            return self.coordinate.coordinate_name  # A-1-1形式
        return self.storing_place  # 旧システムの場所名

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

# 選択情報管理用のモデル
class SelectionOption(models.Model):
    id = models.AutoField(primary_key=True)
    option_type = models.CharField(max_length=50, choices=[
        ('category', 'カテゴリー'),
        ('supplier', '発注先'),
        ('unit', '単位')
    ], help_text="選択肢の種類")
    value = models.CharField(max_length=255, help_text="選択肢の値")
    is_active = models.BooleanField(default=True, help_text="有効/無効")
    sort_order = models.IntegerField(default=0, help_text="表示順序")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "選択肢"
        verbose_name_plural = "選択肢"
        unique_together = ['option_type', 'value']  # 同じ種類内で値の重複を防ぐ
        ordering = ['option_type', 'sort_order', 'value']
    
    def __str__(self):
        return f"{self.get_option_type_display()}: {self.value}"