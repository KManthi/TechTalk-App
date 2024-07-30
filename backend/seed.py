from random import randint, choice
from faker import Faker
from app import app
from models import db, User, UserProfile, Rating, Post

fake = Faker()

def create_users(n=10):
    """Create and seed users."""
    users = []
    for _ in range(n):
        user = User(
            username=fake.user_name(),
            email=fake.email(),
            password_hash=fake.password()
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

def create_posts(users, n=20):
    """Create and seed posts."""
    posts = []
    for _ in range(n):
        post = Post(
            user_id=choice(users).id,
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


if __name__ == '__main__':
    with app.app_context():
        print('Seeding database...')
        db.create_all()  # Create the database schema if it doesn't exist
        
        users = create_users()
        user_profiles = create_user_profiles(users)
        posts = create_posts(users)
        ratings = create_ratings(users, posts)
        
        print("Fake data has been generated and added to the database.")