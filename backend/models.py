from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.fernet import Fernet
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.types import JSON
from enum import Enum
from sqlalchemy import Enum as SqlEnum

key = Fernet.generate_key()
cipher_suite = Fernet(key)

class RatingStatus(Enum):
    LIKE = "like"
    DISLIKE = "dislike"
    NEUTRAL = "neutral"

metadata = MetaData(
    naming_convention={
        "pk": "pk_%(table_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s",
        "ix": "ix_%(table_name)s_%(column_0_name)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
    }
)

db = SQLAlchemy(metadata=metadata)

post_tags = db.Table('post_tags',
    db.Column('post_id', db.Integer, db.ForeignKey('posts.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

followers = db.Table('followers',
    db.Column('follower_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('followed_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=datetime.utcnow),
    db.UniqueConstraint('follower_id', 'followed_id', name='uix_follower_followed')
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_pic = db.Column(db.String(255), nullable=True)
    followers_count = db.Column(db.Integer, default=0)
    following_count = db.Column(db.Integer, default=0)
    is_admin = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'profile_pic': self.profile_pic,
            'followers_count': self.followers_count,
            'following_count': self.following_count,
            'is_admin': self.is_admin
        }   

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bio = db.Column(db.String(200))
    social_links = db.Column(db.String(255))

    user = db.relationship('User', backref='profile')

    def __repr__(self):
        return f'<UserProfile {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bio': self.bio,
            'social_links': self.social_links
        }

class Rating(db.Model):
    __tablename__ = 'ratings'
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(SqlEnum(RatingStatus), nullable=False)

    def __repr__(self):
        return f'<Rating {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'user_id': self.user_id,
            'status': self.status.name 
        }

class Notifications(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    content = db.Column(db.String(30))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Notification {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.receiver_id,
            'content': self.content,
            'created_at': self.created_at,
            'read': self.read
        }

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    likes_count = db.Column(db.Integer, default=0)
    dislikes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)

    user = db.relationship('User', backref=db.backref('posts', lazy=True))
    category = db.relationship('Category', backref=db.backref('posts', lazy=True))

    def __repr__(self):
        return f'<Post {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'author': self.user.username,
            'author_id': self.author_id,
            'category_id': self.category_id,
            'title': self.title,
            'content': self.content,
            'likes_count': self.likes_count,
            'dislikes_count': self.dislikes_count,
            'comments_count': self.comments_count,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }

class Settings(db.Model):
    __tablename__ = 'settings'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, primary_key=True)
    preferences = db.Column(MutableDict.as_mutable(JSON), nullable=False)  

    user = db.relationship('User', backref=db.backref('settings', lazy=True))

    def __repr__(self):
        return f'<Settings {self.user_id}>'
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'preferences': self.preferences
        }

class UserFavourites(db.Model):
    __tablename__ = 'user_favourites'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), primary_key=True)

    user = db.relationship('User', backref=db.backref('favourites', lazy=True))
    post = db.relationship('Post', backref=db.backref('favourited_by', lazy=True))

    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='uix_user_post'),)

    def __repr__(self):
        return f'<UserFavourite user_id={self.user_id} post_id={self.post_id}>'
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'post_id': self.post_id
        }

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    post = db.relationship('Post', backref=db.backref('comments', lazy=True))
    user = db.relationship('User', backref=db.backref('comments', lazy=True))
    
    def __repr__(self):
        return f'<Comment {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'user_id': self.user_id,
            'content': self.content,
            'created_at': self.created_at

        }
    
class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)

    def __repr__(self):
        return f'<Tag {self.name}>'
    
    def to_dict(self):
                return {
            'id': self.id,
            'name':self.name

        }
    
class Messages(db.Model):
    __tablename__ ='messages'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    sender = db.relationship('User', foreign_keys=[sender_id], backref=db.backref('sent_messages', lazy='dynamic'))
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref=db.backref('received_messages', lazy='dynamic'))

    def __repr__(self):
        return f'<Message {self.id}>'

    def to_dict(self):
        decrypted_content = cipher_suite.decrypt(self.content.encode()).decode()
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'content': decrypted_content,
            'created_at': self.created_at
        }

    def encrypt_content(self, content):
        self.content = cipher_suite.encrypt(content.encode()).decode()

    def set_content(self, content):
        self.encrypt_content(content)

class Attachment(db.Model):
    __tablename__ = 'attachments'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=True)
    comment_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  

    post = db.relationship('Post', backref=db.backref('attachments', lazy='dynamic'))
    comment = db.relationship('Comment', backref=db.backref('attachments', lazy='dynamic'))
    user = db.relationship('User', backref=db.backref('attachments', lazy='dynamic'))

    def __repr__(self):
        return f'<Attachment {self.filename}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'filepath': self.filepath,
            'post_id': self.post_id,
            'comment_id': self.comment_id,
            'user_id': self.user_id  
        }
