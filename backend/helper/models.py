from tortoise import fields
from tortoise.models import Model
import uuid

class User(Model):
  id = fields.UUIDField(pk=True, default=uuid.uuid4)
  username = fields.CharField(max_length=100, unique=True)
  hashed_password = fields.CharField(max_length=100)

  roads: fields.ManyToManyRelation["Road"]

  def __str__(self):
    return self.username

class Road(Model):
  id = fields.UUIDField(pk=True, default=uuid.uuid4)
  details = fields.CharField(max_length=20000)

  users: fields.ManyToManyRelation[User] = fields.ManyToManyField(
    "models.User",
    related_name="roads",
    through="road_users",
  )
