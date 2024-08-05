from random import randint, choice
from faker import Faker
from app import app
from models import db, User, UserProfile, Rating, Post, Category, Followers, Settings, UserFavourites, Comment, Tag, Messages, Attachment
from sqlalchemy.exc import IntegrityError
fake = Faker()

def create_users(n=10):
    """Create and seed users."""
    users = []
    for _ in range(n):
        user = User(
            username=fake.user_name(),
            email=fake.email(),
            password_hash=fake.password(),
            profile_pic=fake.image_url(),
            followers_count=randint(0, 1000),
            following_count=randint(0, 1000),
            is_admin=choice([True, False])
        )
        db.session.add(user)
        users.append(user)
    db.session.commit()
    return users

def create_user_profiles(users, n=10):
    """Create and seed user profiles."""
    user_profiles = []
    for user in users:
        user_profile = UserProfile(
            user_id=user.id,
            bio=fake.text(max_nb_chars=200),
            social_links=fake.url()
        )
        db.session.add(user_profile)
        user_profiles.append(user_profile)
    db.session.commit()
    return user_profiles

def create_categories(n=5):
    """Create and seed categories."""
    categories = []
    for _ in range(n):
        category = Category(name=fake.word())
        db.session.add(category)
        categories.append(category)
    db.session.commit()
    return categories

def create_posts(users, categories, n=20):
    """Create and seed posts."""
    posts = []
    for _ in range(n):
        post = Post(
            user_id=choice(users).id,
            category_id=choice(categories).id,
            title=fake.sentence(),
            content=fake.text(),
            created_at=fake.date_time_this_year(),
            updated_at=fake.date_time_this_year()
        )
        db.session.add(post)
        posts.append(post)
    db.session.commit()
    return posts

def create_ratings(users, posts, n=100):
    """Create and seed ratings."""
    ratings = []
    for _ in range(n):
        rating = Rating(
            post_id=choice(posts).id,
            user_id=choice(users).id,
            status=choice(['like', 'dislike'])
        )
        db.session.add(rating)
        ratings.append(rating)
    db.session.commit()
    return ratings

def create_followers(users, n=50):
    """Create and seed followers."""
    followers = []
    for _ in range(n):
        follower = Followers(
            follower_id=choice(users).id,
            followed_id=choice(users).id,
            created_at=fake.date_time_this_year()
        )
        db.session.add(follower)
        followers.append(follower)
    db.session.commit()
    return followers

def create_settings(users, n=10):
    """Create and seed user settings."""
    settings = []
    for user in users:
        setting = Settings(
            user_id=user.id,
            preferences=fake.text(max_nb_chars=100)
        )
        db.session.add(setting)
        settings.append(setting)
    db.session.commit()
    return settings

def create_user_favourites(users, posts, n=30):
    """Create and seed user favourites."""
    favourites = set()
    added_favourites = []
    
    while len(added_favourites) < n:
        user_id = choice(users).id
        post_id = choice(posts).id
        if (user_id, post_id) not in favourites:
            favourites.add((user_id, post_id))
            try:
                favourite = UserFavourites(
                    user_id=user_id,
                    post_id=post_id
                )
                db.session.add(favourite)
                db.session.commit()
                added_favourites.append(favourite)
            except IntegrityError:
                db.session.rollback()  # Rollback to maintain database integrity

    return added_favourites


def create_comments(users, posts, n=50):
    """Create and seed comments."""
    comments = []
    for _ in range(n):
        comment = Comment(
            post_id=choice(posts).id,
            user_id=choice(users).id,
            content=fake.text(max_nb_chars=200),
            created_at=fake.date_time_this_year()
        )
        db.session.add(comment)
        comments.append(comment)
    db.session.commit()
    return comments

def create_tags(n=10):
    """Create and seed tags."""
    tags = []
    for _ in range(n):
        tag = Tag(name=fake.word())
        db.session.add(tag)
        tags.append(tag)
    db.session.commit()
    return tags

def create_messages(users, n=20):
    """Create and seed messages."""
    messages = []
    for _ in range(n):
        message = Messages(
            sender_id=choice(users).id,
            recipient_id=choice(users).id,
            content=fake.text(max_nb_chars=200),
            created_at=fake.date_time_this_year()
        )
        db.session.add(message)
        messages.append(message)
    db.session.commit()
    return messages

def create_attachments(users, posts, comments, n=30):
    """Create and seed attachments."""
    attachments = []
    for _ in range(n):
        attachment = Attachment(
            filename=fake.file_name(extension='jpg'),
            filepath=f'/fake/path/{fake.file_name(extension="jpg")}',
            post_id=choice(posts).id if choice([True, False]) else None,
            comment_id=choice(comments).id if choice([True, False]) else None,
            user_id=choice(users).id,
            
        )
        db.session.add(attachment)
        attachments.append(attachment)
    db.session.commit()
    return attachments

if __name__ == '__main__':
    with app.app_context():
        print('Seeding database...')
        db.create_all()  
        
        users = create_users()
        user_profiles = create_user_profiles(users)
        categories = create_categories()
        posts = create_posts(users, categories)
        ratings = create_ratings(users, posts)
        followers = create_followers(users)
        settings = create_settings(users)
        user_favourites = create_user_favourites(users, posts)
        comments = create_comments(users, posts)
        tags = create_tags()
        messages = create_messages(users)
        attachments = create_attachments(users, posts, comments)
        
        print("Fake data has been generated and added to the database.")
