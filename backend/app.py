from flask import Flask, request, make_response, jsonify
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from models import db, UserProfile, Rating, Post, User, Notifications, UserFavourites, Category, Followers, Settings, Attachment, Tag, Messages, Comment
from werkzeug.security import generate_password_hash



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///techtalk.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
jwt = JWTManager(app)


@app.route('/')
def index():
    return 'Welcome to the Tech Talk API!'

class UserResource(Resource):
    def post(self):
        data = request.get_json()
        if not data or not all(key in data for key in ('username', 'email', 'password')):
            return {'message': 'Missing data'}, 400

        hashed_password = generate_password_hash(data['password'])
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=hashed_password,
            profile_pic=data.get('profile_pic'),
            followers_count=data.get('followers_count', 0),
            following_count=data.get('following_count', 0)
        )
        db.session.add(user)
        db.session.commit()
        return user.to_dict(), 201

    def get(self, id):
        user = User.query.get_or_404(id)
        return user.to_dict()

    def put(self, id):
        user = User.query.get_or_404(id)
        data = request.get_json()

        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        if 'profile_pic' in data:
            user.profile_pic = data['profile_pic']
        if 'password' in data:
            user.password_hash = generate_password_hash(data['password'])
        if 'followers_count' in data:
            user.followers_count = data['followers_count']
        if 'following_count' in data:
            user.following_count = data['following_count']

        db.session.commit()
        return user.to_dict()

    def delete(self, id):
        user = User.query.get_or_404(id)
        db.session.delete(user)
        db.session.commit()
        return {'message': 'User deleted'}, 204

class CheckPasswordResource(Resource):
    def post(self, id):
        data = request.get_json()
        if not data or 'password' not in data:
            return {'message': 'Missing password'}, 400

        user = User.query.get_or_404(id)
        if user.check_password(data['password']):
            return {'message': 'Password is correct'}, 200
        else:
            return {'message': 'Incorrect password'}, 401

api.add_resource(UserResource, '/users', '/users/<int:id>')
api.add_resource(CheckPasswordResource, '/users/<int:id>/check_password')

# UserProfile Resources
class UserProfiles(Resource):
    def get(self):
        user_profiles = UserProfile.query.all()
        result = [up.to_dict() for up in user_profiles]
        return make_response(jsonify(result), 200)
    
    def post(self):
        data = request.get_json()
        if not data or 'user_id' not in data:
            return make_response(jsonify({'message': 'Bad Request: Missing data'}), 400)
        
        try:
            new_user_profile = UserProfile(
                user_id=data['user_id'],
                bio=data.get('bio'),
                social_links=data.get('social_links')
            )
            db.session.add(new_user_profile)
            db.session.commit()
            return make_response(jsonify({'message': 'User profile created'}), 201)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
    
class UserProfileByID(Resource):
    def get(self, id):
        user_profile = UserProfile.query.filter_by(id=id).first()
        if not user_profile:
            return make_response(jsonify({'message': 'User profile not found'}), 404)
        response = {
            'user_profile': user_profile.to_dict()
        }
        return make_response(jsonify(response), 200)
    
    def put(self, id):
        data = request.get_json()
        user_profile = UserProfile.query.filter_by(id=id).first()
        if not user_profile:
            return make_response(jsonify({'message': 'User profile not found'}), 404)
        
        if 'bio' in data:
            user_profile.bio = data['bio']
        if 'social_links' in data:
            user_profile.social_links = data['social_links']

        if 'bio' not in data and 'social_links' not in data:
            return make_response(jsonify({'message': 'Bad Request: At least one of bio or social_links must be provided'}), 400)
        
        db.session.commit()
        return make_response(jsonify({'message': 'User profile updated'}), 200)
    
    def delete(self, id):
        user_profile = UserProfile.query.filter_by(id=id).first()
        if not user_profile:
            return make_response(jsonify({'message': 'User profile not found'}), 404)
        
        try:
            db.session.delete(user_profile)
            db.session.commit()
            return make_response(jsonify({'message': 'User profile deleted'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)

class Ratings(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        post_id = data.get('post_id')
        status = data.get('status')

        if status not in ['like', 'dislike']:
            return make_response(jsonify({'message': 'Bad Request: Invalid status'}), 400)

        user_id = get_jwt_identity()

        post = Post.query.get(post_id)
        if not post:
            return make_response(jsonify({'message': 'Post not found'}), 404)

        existing_rating = Rating.query.filter_by(post_id=post_id, user_id=user_id).first()
        if existing_rating:
            return make_response(jsonify({'message': 'You have already rated this post.'}), 400)
        
        try:
            new_rating = Rating(
                post_id=post_id,
                user_id=user_id,
                status=status
            )
            db.session.add(new_rating)
            db.session.commit()
            return make_response(jsonify({'message': 'Rating created'}), 201)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
        
class RatingByID(Resource):
    @jwt_required()
    def get(self, id):
        rating = Rating.query.filter_by(id=id).first()
        if not rating:
            return make_response(jsonify({'message': 'Rating not found'}), 404)
                
        response = {'rating': rating.to_dict()}
        return make_response(jsonify(response), 200)
    
    @jwt_required()
    def put(self, id):
        data = request.get_json()
        status = data.get('status')
        if status not in ['like', 'dislike']:
            return make_response(jsonify({'message': 'Bad Request: Invalid status'}), 400)

        rating = Rating.query.filter_by(id=id).first()
        if not rating:
            return make_response(jsonify({'message': 'Rating not found'}), 404)

        user_id = get_jwt_identity()
        if rating.user_id != user_id:
            return make_response(jsonify({'message': 'Forbidden: You are not authorized to update this rating'}), 403)

        rating.status = status
        db.session.commit()

        return make_response(jsonify({'message': 'Rating updated', 'rating': rating.to_dict()}), 200)
    
    @jwt_required()
    def delete(self, id):
        rating = Rating.query.filter_by(id=id).first()
        if not rating:
            return make_response(jsonify({'message': 'Rating not found'}), 404)
        
        user_id = get_jwt_identity()
        if user_id!= rating.user_id:
            return make_response(jsonify({'message': 'Forbidden: You are not authorized to delete this rating'}), 403)
        
        try:
            db.session.delete(rating)
            db.session.commit()
            return make_response(jsonify({'message': 'Rating deleted'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)

class RatingsForPost(Resource):
    @jwt_required()
    def get(self, post_id):
        ratings = Rating.query.filter_by(post_id=post_id).all()
        if not ratings:
            return make_response(jsonify({'message': 'No ratings found for this post'}), 404)
        result = [rating.to_dict() for rating in ratings]
        return make_response(jsonify(result), 200)

class PostTags(Resource):
    @jwt_required()
    def post(self, post_id):
        tag_id = request.json.get('tag_id', None)
        if not tag_id:
            return make_response(jsonify({'message': 'Bad Request: Missing tag_id'}), 400)
        
        post = Post.query.get_or_404(post_id)
        tag = Tag.query.get_or_404(tag_id)

        if tag in post.tags:
            return make_response(jsonify({'message': 'Tag already exists for this post'}), 400)
        
        try:
            post.tags.append(tag)
            db.session.commit()
            return make_response(jsonify({'message': 'Tag added to post'}), 201)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
        
    @jwt_required()
    def delete(self, post_id, tag_id):
        post = Post.query.get_or_404(post_id)
        tag = Tag.query.get_or_404(tag_id)

        if tag not in post.tags:
            return make_response(jsonify({'message': 'Tag does not exist for this post'}), 404)
        
        try:
            post.tags.remove(tag)
            db.session.commit()
            return make_response(jsonify({'message': 'Tag removed from post'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
        
    def get(self, post_id):
        post = Post.query.get_or_404(post_id)
        tags = [tag.to_dict() for tag in post.tags]
        return make_response(jsonify(tags), 200)
    
class PostsByTag(Resource):
    def get(self, tag_id):
        tag = Tag.query.get_or_404(tag_id)
        posts = [post.to_dict() for post in tag.posts]
        return make_response(jsonify(posts), 200)
    
class Notifications(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        content = data.get('content')
        receiver_user_id = data.get('user_id')

        if not content or not receiver_user_id:
            return make_response(jsonify({'message': 'Bad Request: Missing content or user_id'}), 400)
        
        receiver_user = User.query.get(receiver_user_id)
        if not receiver_user:
            return make_response(jsonify({'message': 'User not found'}), 404)
        
        new_notif = Notifications(user_id=receiver_user_id, content=content)

        try:
            db.session.add(new_notif)
            db.session.commit()
            return make_response(jsonify({'message': 'Notification created'}), 201)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
        
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        notifications = Notifications.query.filter_by(user_id=user_id).all()
        
        if not notifications:
            return make_response(jsonify({'message': 'No notifications found'}), 404)

        result = [notification.to_dict() for notification in notifications]
        return make_response(jsonify(result), 200)

class NotificationByID(Resource):

    @jwt_required()
    def put(self, id):
        data = request.get_json()
        read_status = data.get('read', None)

        if read_status is None or not isinstance(read_status, bool):
            return make_response(jsonify({'message': 'Bad Request: Invalid read parameter'}), 400)
        
        user_id = get_jwt_identity()
        notification = Notifications.query.filter_by(id=id, user_id=user_id).first_or_404()

        try:
            notification.read = read_status
            db.session.commit()
            return make_response(jsonify({'message': 'Notification updated'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
        
    @jwt_required()
    def get(self, id):
        user_id = get_jwt_identity()
        notification = Notifications.query.filter_by(id=id, user_id=user_id).first_or_404()

        response = {'notification': notification.to_dict()}
        return make_response(jsonify(response), 200)
    
    @jwt_required()
    def delete(self, id):
        user_id = get_jwt_identity()
        notification = Notifications.query.filter_by(id=id, user_id=user_id).first_or_404()

        try:
            db.session.delete(notification)
            db.session.commit()
            return make_response(jsonify({'message': 'Notification deleted'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)

class UserFavourites(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        post_id = data.get('post_id')

        if not post_id:
            return make_response(jsonify({'message': 'Bad Request: Missing post_id'}), 400)
        
        post = Post.query.get_or_404(post_id)
        
        if post.user_id == user_id:
            return make_response(jsonify({'message': 'You cannot favourite your own post'}), 400)
        
        existing_favourites = UserFavourites.query.filter_by(user_id=user_id, post_id=post_id).first()
        if existing_favourites:
            return make_response(jsonify({'message': 'Post already exists in favourites'}), 400)
        
        try:
            new_favourite = UserFavourites(user_id=user_id, post_id=post_id)
            db.session.add(new_favourite)
            db.session.commit()
            return make_response(jsonify({'message': 'Post added to favourites'}), 201)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
        
    @jwt_required()
    def delete(self, post_id):
        user_id = get_jwt_identity()
        existing_favourite = UserFavourites.query.filter_by(user_id=user_id, post_id=post_id).first_or_404()

        if not existing_favourite:
            return make_response(jsonify({'message': 'Post not found in favourites'}), 404)

        try:
            db.session.delete(existing_favourite)
            db.session.commit()
            return make_response(jsonify({'message': 'Post removed from favourites'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
        
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        post_id = request.args.get('post_id', None)

        if post_id:
            favourite_exists = UserFavourites.query.filter_by(user_id=user_id, post_id=post_id).first()
            exists = favourite_exists is not None
            return make_response(jsonify({'exists': exists}), 200)
        
        favourites = UserFavourites.query.filter_by(user_id=user_id).all()
        if not favourites:
            return make_response(jsonify({'message': 'No favourites found'}), 404)

        result = [{'post_id': favourite.post_id} for favourite in favourites]
        return make_response(jsonify(result), 200)

api.add_resource(UserProfiles, '/userprofiles')
api.add_resource(UserProfileByID, '/userprofiles/<int:id>')
api.add_resource(Ratings, '/ratings')
api.add_resource(RatingByID, '/ratings/<int:id>')
api.add_resource(RatingsForPost, '/posts/<int:post_id>/ratings')
api.add_resource(PostTags, '/posts/<int:post_id>/tags', '/posts/<int:post_id>/tags/<int:tag_id>')
api.add_resource(PostsByTag, '/tags/<int:tag_id>/posts')
api.add_resource(Notifications, '/notifications', '/users/me/notifications')
api.add_resource(NotificationByID, '/notifications/<int:id>')
api.add_resource(UserFavourites, '/users/me/favourites', '/users/me/favourites/<int:post_id>', '/users/me/favourites?post_id=<post_id>')


# Posts Resources
class Posts(Resource):
    def get(self):
        posts = Post.query.all()
        result = [post.to_dict() for post in posts]
        return make_response(jsonify(result), 200)
    
    def post(self):
        data = request.get_json()
        new_post = Post(
            title=data['title'],
            content=data['content'],
            user_id=data['user_id']
        )
        db.session.add(new_post)
        db.session.commit()
        return make_response(jsonify({'message': 'Post created successfully'}), 201)
    
class PostByID(Resource):
    def get(self, id):
        post = Post.query.filter_by(id=id).first()
        if not post:
            return make_response(jsonify({'message': 'Post not found'}), 404)
        return make_response(jsonify(post.to_dict()), 200)
    
    def put(self, id):
        data = request.get_json()
        post = Post.query.filter_by(id=id).first()
        if not post:
            return make_response(jsonify({'message': 'Post not found'}), 404)
        
        post.title = data['title']
        post.content = data['content']
        db.session.commit()
        return make_response(jsonify({'message': 'Post updated successfully'}), 200)
    
    def delete(self, id):
        post = Post.query.filter_by(id=id).first()
        if not post:
            return make_response(jsonify({'message': 'Post not found'}), 404)
        
        db.session.delete(post)
        db.session.commit()
        return make_response(jsonify({'message': 'Post deleted successfully'}), 200)

api.add_resource(Posts, '/posts')
api.add_resource(PostByID, '/posts/<int:id>')

# Categories Resources
class Categories(Resource):
    def get(self):
        categories = Category.query.all()
        result = [category.to_dict() for category in categories]
        return make_response(jsonify(result), 200)
    
    def post(self):
        data = request.get_json()
        new_category = Category(
            name=data['name'],
            description=data.get('description')
        )
        db.session.add(new_category)
        db.session.commit()
        return make_response(jsonify({'message': 'Category created successfully'}), 201)
    
class CategoryByID(Resource):
    def get(self, id):
        category = Category.query.filter_by(id=id).first()
        if not category:
            return make_response(jsonify({'message': 'Category not found'}), 404)
        return make_response(jsonify(category.to_dict()), 200)
    
    def put(self, id):
        data = request.get_json()
        category = Category.query.filter_by(id=id).first()
        if not category:
            return make_response(jsonify({'message': 'Category not found'}), 404)
        
        category.name = data['name']
        category.description = data.get('description')
        db.session.commit()
        return make_response(jsonify({'message': 'Category updated successfully'}), 200)
    
    def delete(self, id):
        category = Category.query.filter_by(id=id).first()
        if not category:
            return make_response(jsonify({'message': 'Category not found'}), 404)
        
        db.session.delete(category)
        db.session.commit()
        return make_response(jsonify({'message': 'Category deleted successfully'}), 200)

api.add_resource(Categories, '/categories')
api.add_resource(CategoryByID, '/categories/<int:id>')

# Followers Resources
class FollowersResource(Resource):
    def post(self):
        data = request.get_json()
        new_follow = Followers(
            follower_id=data['follower_id'],
            followed_id=data['followed_id']
        )
        db.session.add(new_follow)
        db.session.commit()
        return make_response(jsonify({'message': 'Followed successfully'}), 201)

api.add_resource(FollowersResource, '/followers')

# Setting Resources
class SettingsResource(Resource):
    def post(self):
        data = request.get_json()
        settings = Settings.query.filter_by(user_id=data['user_id']).first()
        if settings:
            settings.preferences = data['preferences']
        else:
            settings = Settings(user_id=data['user_id'], preferences=data['preferences'])
            db.session.add(settings)
        db.session.commit()
        return make_response(jsonify({'message': 'Settings updated successfully'}), 200)

api.add_resource(SettingsResource, '/settings')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
