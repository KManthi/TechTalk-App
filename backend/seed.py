from random import randint, choice
from faker import Faker
from werkzeug.utils import secure_filename
import os
import json
import random
from werkzeug.security import generate_password_hash
from app import app
from models import db, User, UserProfile, Rating, Post, Category, followers, Settings, UserFavourites, Comment, Tag, Messages, Attachment, RatingStatus, post_tags, Notifications
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from dotenv import load_dotenv

load_dotenv()

fake = Faker()

def create_users(num=20):
    users = []
    for _ in range(num):
        user = User(
            username=fake.user_name(),
            email=fake.email(),
            password_hash=generate_password_hash(fake.password(length=10, special_chars=True)),
            profile_pic=fake.image_url(width=150, height=150),
            followers_count=fake.random_int(min=0, max=100),
            following_count=fake.random_int(min=0, max=100),
            is_admin=fake.boolean()
        )
        users.append(user)
    db.session.add_all(users)
    db.session.commit()
    return users

def create_user_profiles(users):
    for user in users:
        user_profile = UserProfile(
            user_id=user.id,
            bio=fake.text(max_nb_chars=200),
            social_links=json.dumps([fake.url() for _ in range(5)])
        )
        db.session.add(user_profile)
    db.session.commit()

def create_categories(num=5):
    categories = []
    for _ in range(num):
        category = Category(
            name=fake.catch_phrase()
        )
        categories.append(category)
    db.session.add_all(categories)
    db.session.commit()
    return categories

def create_tags(num=10):
    tags = []
    for _ in range(num):
        tag = Tag(
            name=fake.word()
        )
        tags.append(tag)
    db.session.add_all(tags)
    db.session.commit()
    return tags

def create_posts(users, categories, num=30):
    posts = []
    for _ in range(num):
        post = Post(
            title=fake.sentence(),
            content=fake.text(max_nb_chars=500),
            author_id=choice(users).id,
            category_id=choice(categories).id,
            created_at=fake.date_time_between(start_date="-30d", end_date="now")
        )
        posts.append(post)
    db.session.add_all(posts)
    db.session.commit()
    return posts

def create_post_tags(posts, tags):
    post_tags_set = set()  
    for post in posts:
        num_tags = fake.random_int(min=1, max=3)
        for _ in range(num_tags):
            tag_id = fake.random_element(elements=[tag.id for tag in tags])
            post_tags_set.add((post.id, tag_id))  

    post_tags_list = [{'post_id': post_id, 'tag_id': tag_id} for post_id, tag_id in post_tags_set]
    db.session.execute(post_tags.insert(), post_tags_list)
    db.session.commit()

def create_ratings(posts, users, n=100):
    ratings = []
    for _ in range(n):
        rating = Rating(
            post_id=choice(posts).id,
            user_id=choice(users).id,
            status=choice([RatingStatus.LIKE, RatingStatus.DISLIKE])  # Use enumeration values
        )
        db.session.add(rating)
        ratings.append(rating)
    db.session.commit()
    return ratings

def create_notifications(users):
    notifications = []
    for user in users:
        num_notifications = fake.random_int(min=0, max=5)
        for _ in range(num_notifications):
            notification = Notifications(
                receiver_id=user.id,
                content=fake.sentence(),
                created_at=fake.date_time_between(start_date="-30d", end_date="now")
            )
            notifications.append(notification)
    db.session.add_all(notifications)
    db.session.commit()
    return notifications

def create_settings(users):
    settings_list = []
    for user in users:
        settings = Settings(
            user_id=user.id,
            preferences={
                'notifications': fake.boolean(),
                'notifications_frequency': fake.random_element(elements=['daily', 'weekly', 'monthly']),
                'theme': fake.random_element(elements=['light', 'dark']),
                'sound_effects': fake.boolean()
            }
        )
        settings_list.append(settings)
    db.session.add_all(settings_list)
    db.session.commit()
    return settings_list

def create_user_favourites(users, posts, num=100):
    user_favourites_set = set()
    user_favourites = []
    while len(user_favourites) < num:
        user_id = choice(users).id
        post_id = choice(posts).id
        if (user_id, post_id) not in user_favourites_set:
            user_favourites_set.add((user_id, post_id))
            user_favourite = UserFavourites(user_id=user_id, post_id=post_id)
            user_favourites.append(user_favourite)

    db.session.add_all(user_favourites)
    db.session.commit()
    return user_favourites

def create_comments(posts, users, num=100):
    comments = []
    for _ in range(num):
        comment = Comment(
            content=fake.text(max_nb_chars=200),
            post_id=choice(posts).id,
            user_id=choice(users).id,
            created_at=fake.date_time_between(start_date="-30d", end_date="now")
        )
        comments.append(comment)
    db.session.add_all(comments)
    db.session.commit()
    return comments

def create_attachments(posts, comments, users, num=100):
    attachments = []
    for _ in range(num):
        filename = fake.file_name(extension='pdf')
        filepath = os.path.join('static', 'uploads', filename)  

        attachment = Attachment(
            filename=filename,
            filepath=filepath,
            post_id=choice(posts).id if fake.random_int(min=0, max=1) else None,
            comment_id=choice(comments).id if fake.random_int(min=0, max=1) else None,
            user_id=choice(users).id
        )
        attachments.append(attachment)

    db.session.add_all(attachments)
    db.session.commit()
    return attachments

def create_followers(users, num=100):
    followers_set = set()  
    for _ in range(num):
        follower_id = choice(users).id
        followed_id = choice(users).id
        
        if follower_id != followed_id and (follower_id, followed_id) not in followers_set:
            followers_set.add((follower_id, followed_id))

    
    followers_list = [{'follower_id': f, 'followed_id': f2} for f, f2 in followers_set]

    
    db.session.execute(followers.insert(), followers_list)
    db.session.commit()
    return followers_list

def create_messages(users, num=100):
    messages = []
    for _ in range(num):
        message = Messages(
            content=fake.text(max_nb_chars=200),
            sender_id=choice(users).id,
            recipient_id=choice(users).id,
            created_at=fake.date_time_between(start_date="-30d", end_date="now")
        )
        messages.append(message)
    db.session.add_all(messages)
    db.session.commit()
    return messages

if __name__ == '__main__':
    with app.app_context():
        print('Seeding database...')

        db.drop_all()
        db.create_all()
        users = create_users()
        user_profiles = create_user_profiles(users)
        categories = create_categories()
        tags = create_tags()
        posts = create_posts(users, categories)
        post_tags = create_post_tags(posts, tags)
        ratings = create_ratings(posts, users)
        notifications = create_notifications(users)
        settings = create_settings(users)
        user_favourites = create_user_favourites(users, posts)
        comments = create_comments(posts, users)
        attachments = create_attachments(posts, comments, users)
        followers = create_followers(users)
        messages = create_messages(users)        
        
        print("Fake data has been generated and added to the database.")
