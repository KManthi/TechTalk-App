import os
from flask import Flask, request, make_response, jsonify
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from models import db, UserProfile, Rating, Post, User, Notifications, UserFavourites, Category, Followers, Settings, Attachment, Tag, Messages, Comment
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///techtalk.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
jwt = JWTManager(app)
UPLOAD_FOLDER = 'backend/upload_folder'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx'}

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
            following_count=data.get('following_count', 0),
            is_admin=data.get('is_admin', False)
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
        if 'is_admin' in data:
            user.is_admin = data['is_admin']

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

# Comment Resources

class CommentResource(Resource):
    @jwt_required()
    def post(self, post_id):
        data = request.get_json()
        user_id = get_jwt_identity()
        new_comment = Comment(
            content=data['content'],
            user_id=user_id,
            post_id=post_id
        )
        db.session.add(new_comment)
        db.session.commit()
        return make_response(jsonify({'message': 'Comment created successfully'}), 201)
    
    @jwt_required()
    def get(self, post_id, id):
        comment = Comment.query.filter_by(id=id, post_id=post_id).first()
        if not comment:
            return make_response(jsonify({'message': 'Comment not found'}), 404)
        return make_response(jsonify(comment.to_dict()), 200)
    
    @jwt_required()
    def put(self, post_id, id):
        data = request.get_json()
        comment = Comment.query.filter_by(id=id, post_id=post_id).first()
        if not comment:
            return make_response(jsonify({'message': 'Comment not found'}), 404)
        
        comment.content = data['content']
        db.session.commit()
        return make_response(jsonify({'message': 'Comment updated successfully'}), 200)
    
    @jwt_required()
    def delete(self, post_id, id):
        comment = Comment.query.filter_by(id=id, post_id=post_id).first()
        if not comment:
            return make_response(jsonify({'message': 'Comment not found'}), 404)
        
        db.session.delete(comment)
        db.session.commit()
        return make_response(jsonify({'message': 'Comment deleted successfully'}), 200)
    
class CommmentsListResource(Resource):
    def get(self, post_id):
        comments = Comment.query.filter_by(post_id=post_id).all()
        result = [comment.to_dict() for comment in comments]
        return make_response(jsonify(result), 200)
    
api.add_resource(CommentResource, '/posts/<int:post_id>/comments/<int:id>')
api.add_resource(CommmentsListResource, '/posts/<int:post_id>/comments')

# Messages Resources

class MessageResource(Resource):
    @jwt_required()
    def post(self, recipient_id):
        data = request.get_json()
        user_id = get_jwt_identity()
        new_message = Messages(
            content=data['content'],
            sender_id=user_id,
            recipient_id=recipient_id
        )
        db.session.add(new_message)
        db.session.commit()
        return make_response(jsonify({'message': 'Message sent successfully'}), 201)
    
    @jwt_required()
    def get(self, id):
        user_id = get_jwt_identity()
        message = Messages.query.filter_by(id=id).first()
        if not message:
            return make_response(jsonify({'message': 'Message not found'}), 404)
        if message.sender_id != user_id and message.recipient_id != user_id:
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        return make_response(jsonify(message.to_dict()), 200)
    
    @jwt_required()
    def put(self, id):
        data = request.get_json()
        user_id = get_jwt_identity()
        message = Messages.query.filter_by(id=id).first()
        if not message:
            return make_response(jsonify({'message': 'Message not found'}), 404)
        if message.sender_id!= user_id:
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
        message.content = data['content']
        db.session.commit()
        return make_response(jsonify({'message': 'Message updated successfully'}), 200)
    
    @jwt_required()
    def delete(self, id):
        user_id = get_jwt_identity()
        message = Messages.query.filter_by(id=id).first()
        if not message:
            return make_response(jsonify({'message': 'Message not found'}), 404)
        if message.sender_id!= user_id:
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
        db.session.delete(message)
        db.session.commit()
        return make_response(jsonify({'message': 'Message deleted successfully'}), 200)
    
api.add_resource(MessageResource, '/users/me/messages/<int:id>', '/users/me/messages')

# Tag Resources

def is_admin(user_id):
    user = User.query.filter_by(id=user_id).first()
    return user.is_admin if user else False

class TagResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        if not is_admin(user_id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        data = request.get_json()
        new_tag = Tag(name=data['name'])
        db.session.add(new_tag)
        db.session.commit()
        return make_response(jsonify({'message': 'Tag created successfully'}), 201)
    
    def get(self, id):
        tag = Tag.query.filter_by(id=id).first()
        if not tag:
            return make_response(jsonify({'message': 'Tag not found'}), 404)
        return make_response(jsonify(tag.to_dict()), 200)
    
    @jwt_required()
    def put(self, id):
        user_id = get_jwt_identity()
        if not is_admin(user_id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        data = request.get_json()
        tag = Tag.query.filter_by(id=id).first()
        if not tag:
            return make_response(jsonify({'message': 'Tag not found'}), 404)
        
        tag.name = data['name']
        db.session.commit()
        return make_response(jsonify({'message': 'Tag updated successfully'}), 200)
    
    @jwt_required()
    def delete(self, id):
        user_id = get_jwt_identity()
        if not is_admin(user_id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        tag = Tag.query.filter_by(id=id).first()
        if not tag:
            return make_response(jsonify({'message': 'Tag not found'}), 404)
        
        db.session.delete(tag)
        db.session.commit()
        return make_response(jsonify({'message': 'Tag deleted successfully'}), 200)

class TagListResource(Resource):
    def get(self):
        tags = Tag.query.all()
        result = [tag.to_dict() for tag in tags]
        return make_response(jsonify(result), 200)


api.add_resource(TagResource, '/tags', '/tags/<int:id>')
api.add_resource(TagListResource, '/tags')

# Attachment Resources
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class AttachmentResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()

        if 'file' not in request.files:
            return {'message': 'No file part'}, 400

        file = request.files['file']
        if file.filename == '':
            return {'message': 'No selected file'}, 400

        if not allowed_file(file.filename):
            return {'message': 'File type not allowed'}, 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        try:
            file.save(filepath)
        except Exception as e:
            return {'message': 'Failed to save file'}, 500

        post_id = request.form.get('post_id')
        comment_id = request.form.get('comment_id')

        if not post_id and not comment_id:
            return {'message': 'Must provide either post_id or comment_id or both'}, 400

        if post_id:
            post = Post.query.get(post_id)
            if not post:
                os.remove(filepath)  
                return {'message': 'Post not found'}, 404

        if comment_id:
            comment = Comment.query.get(comment_id)
            if not comment:
                os.remove(filepath)  
                return {'message': 'Comment not found'}, 404

        new_attachment = Attachment(
            filename=filename,
            filepath=filepath,
            post_id=post_id,
            comment_id=comment_id,
        )

        try:
            db.session.add(new_attachment)
            db.session.commit()
        except Exception as e:
            os.remove(filepath)  
            return {'message': 'Failed to save attachment'}, 500

        return make_response(jsonify(new_attachment.to_dict()), 201)
    
    @jwt_required()
    def get(self, id):
        attachment = Attachment.query.get(id)
        if not attachment:
            return {'message': 'Attachment not found'}, 404

        return make_response(jsonify(attachment.to_dict()), 200)
    
    @jwt_required()
    def delete(self, attachment_id):
        user_id = get_jwt_identity()
        attachment = Attachment.query.get_or_404(attachment_id)
        
        if not attachment:
            return {'message': 'Attachment not found'}, 404
        if attachment.user_id != user_id and not is_admin(user_id):
            return {'message': 'Unauthorized'}, 403

        try:
            os.remove(attachment.filepath)  
            db.session.delete(attachment)
            db.session.commit()
            return {'message': 'Attachment deleted successfully'}, 200
        except Exception as e:
            return {'message': 'Failed to delete attachment'}, 500

api.add_resource(AttachmentResource, '/attachments', '/attachments/<int:id>')

class CommentAttachmentsResource(Resource):
    def get(self, comment_id):
        comment = Comment.query.get_or_404(comment_id)
        attachments = Attachment.query.filter_by(comment_id=comment_id).all()
        result = [attachment.to_dict() for attachment in attachments]
        return make_response(jsonify(result), 200)

api.add_resource(CommentAttachmentsResource, '/comments/<int:comment_id>/attachments')

class PostAttachmentsResource(Resource):
    def get(self, post_id):
        post = Post.query.get_or_404(post_id)
        attachments = Attachment.query.filter_by(post_id=post_id).all()
        result = [attachment.to_dict() for attachment in attachments]
        return make_response(jsonify(result), 200)

api.add_resource(PostAttachmentsResource, '/posts/<int:post_id>/attachments')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
