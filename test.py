
@repr_of('email', 'name')
class User:
    email = fields.StringField()
    name = fields.StringField()

# vs

class User:
    email = fields.StringField()
    name = fields.StringField()

    __repr__ = repr_of('email', 'name')
