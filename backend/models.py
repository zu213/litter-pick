from tortoise import fields
from tortoise.models import Model

class User(Model):
  id = fields.IntField(pk=True)
  name = fields.CharField(max_length=100)

  roads: fields.ManyToManyRelation["Road"]

  def __str__(self):
    return self.name


class Road(Model):
  id = fields.IntField(pk=True)

  users: fields.ManyToManyRelation[User] = fields.ManyToManyField(
    "models.User",
    related_name="roads",
    through="road_users",
  )
