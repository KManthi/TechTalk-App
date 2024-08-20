import os
from flask import Flask, request, make_response, jsonify
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token, get_jwt, create_refresh_token
from models import db, UserProfile, Rating, Post, User, Notifications, UserFavourites, Category, followers, Settings, Attachment, Tag, Messages, Comment
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from datetime import timedelta
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
CORS(app)

db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
jwt = JWTManager(app)

UPLOAD_FOLDER = 'upload_folder'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx'}

blacklist = set()
expires = timedelta(hours=24)

@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in blacklist

@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token), 200

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


# Login and Logout Routes
@app.route('/')
def index():
    return 'Welcome to the Tech Talk API!'

@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    username = request.json.get('username')
    if not email or not username:
        return {'message': 'Missing username or password'}, 400
    
    user = User.query.filter_by(email=email).first()
    if user:
        access_token = create_access_token(identity=user.id, expires_delta=expires)
        refresh_token = create_refresh_token(identity=user.id)
        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 200
    else:
        return {'message': 'Invalid credentials'}, 401
    

@app.route('/logout', methods=['DELETE'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    blacklist.add(jti)
    return jsonify({'message': 'Logged out successfully'}), 200

# User Resources
class UserResource(Resource):
    def post(self):
        data = request.get_json()
        required_fields = ['username', 'email', 'password']
        if not data or not all(key in data for key in required_fields):
            return {'message': 'Missing required fields'}, 400

        if User.query.filter_by(username=data['username']).first():
            return {'message': 'Username already exists'}, 400
        
        if User.query.filter_by(email=data['email']).first():
            return {'message': 'Email already exists'}, 400

        if len(data['password']) < 8:
            return {'message': 'Password must be at least 8 characters long'}, 400
        
        hashed_password = generate_password_hash(data['password'])
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=hashed_password
        )
        db.session.add(user)
        db.session.commit()
        return user.to_dict(), 201
    
    @jwt_required()
    def get(self):
        users = User.query.all()
        result = [user.to_dict() for user in users]
        return make_response(jsonify(result), 200)
    
class SpecificUser(Resource):
    @jwt_required()
    def get(self, id):
        user = User.query.get_or_404(id)
        return user.to_dict()
    
    @jwt_required()
    def put(self, id):
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        user = User.query.get_or_404(id)
        data = request.get_json()

        if 'username' in data:
            if User.query.filter_by(username=data['username']).first():
                return {'message': 'Username already taken'}, 400
            user.username = data['username']
        
        if 'email' in data:
            if User.query.filter_by(email=data['email']).first():
                return {'message': 'Email already taken'}, 400
            user.email = data['email']
        
        if 'profile_pic' in data:
            user.profile_pic = data['profile_pic']
        
        if 'password' in data:
            if 'current_password' not in data or not user.check_password(data['current_password']):
                return {'message': 'Incorrect current password'}, 401
            user.password_hash = generate_password_hash(data['password'])
        
        if 'followers_count' in data:
            user.followers_count = data['followers_count']
        
        if 'following_count' in data:
            user.following_count = data['following_count']
        
        if 'is_admin' in data and current_user.is_admin:
            user.is_admin = data['is_admin']

        db.session.commit()
        return user.to_dict()
    
    @jwt_required()
    def delete(self, id):
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        user = User.query.get_or_404(id)
        if current_user.id != user.id and not current_user.is_admin:
            return {'message': 'Unauthorized'}, 403

        db.session.delete(user)
        db.session.commit()
        return {'message': 'User deleted'}, 204

class CheckPasswordResource(Resource):
    @jwt_required()
    def post(self, id):
        data = request.get_json()
        if not data or 'password' not in data:
            return {'message': 'Missing password'}, 400

        user = User.query.get_or_404(id)
        if user.check_password(data['password']):
            return {'message': 'Password is correct'}, 200
        else:
            return {'message': 'Incorrect password'}, 401
        
class RecommendedUsers(Resource):
    def get(self):
        users = User.query.filter_by(is_admin=False).order_by(User.followers_count.desc()).limit(10).all()
        result = [user.to_dict() for user in users]
        return make_response(jsonify(result), 200)

api.add_resource(UserResource, '/users')
api.add_resource(SpecificUser, '/users/<int:id>')
api.add_resource(CheckPasswordResource, '/users/<int:id>/check_password')
api.add_resource(RecommendedUsers, '/recommended-users')

# UserProfile Resources
class UserProfiles(Resource):
    @jwt_required()
    def get(self):
        user_profiles = UserProfile.query.all()
        result = [up.to_dict() for up in user_profiles]
        return make_response(jsonify({'data': result}), 200)
    
    @jwt_required()
    def post(self):
        data = request.get_json()
        if not data or 'user_id' not in data:
            return make_response(jsonify({'message': 'Bad Request: Missing user_id'}), 400)
        
        user = User.query.get(data['user_id'])
        if not user:
            return make_response(jsonify({'message': 'User not found'}), 404)
        
        existing_profile = UserProfile.query.filter_by(user_id=data['user_id']).first()
        if existing_profile:
            return make_response(jsonify({'message': 'User profile already exists'}), 400)

        try:
            new_user_profile = UserProfile(
                user_id=data['user_id'],
                bio=data.get('bio', ''),
                social_links=data.get('social_links', '')
            )
            db.session.add(new_user_profile)
            db.session.commit()
            return make_response(jsonify({'message': 'User profile created', 'data': new_user_profile.to_dict()}), 201)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
    
class UserProfileByID(Resource):
    @jwt_required()
    def get(self, id):
        user_profile = UserProfile.query.filter_by(id=id).first()
        if not user_profile:
            return make_response(jsonify({'message': 'User profile not found'}), 404)
        return make_response(jsonify({'data': user_profile.to_dict()}), 200)
    
    @jwt_required()
    def put(self, id):
        user_profile = UserProfile.query.filter_by(id=id).first()
        if not user_profile:
            return make_response(jsonify({'message': 'User profile not found'}), 404)
        
        data = request.get_json()
        if not data:
            return make_response(jsonify({'message': 'Bad Request: Missing data'}), 400)
        
        if 'bio' not in data and 'social_links' not in data:
            return make_response(jsonify({'message': 'Bad Request: At least one of bio or social_links must be provided'}), 400)
        
        if 'bio' in data:
            user_profile.bio = data['bio']
        if 'social_links' in data:
            user_profile.social_links = data['social_links']
        
        db.session.commit()
        return make_response(jsonify({'message': 'User profile updated', 'data': user_profile.to_dict()}), 200)
    
    @jwt_required()
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
        
class MyProfile(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return make_response(jsonify({'message': 'User not found'}), 404)

        user_profile = UserProfile.query.filter_by(user_id=user_id).first()
        if not user_profile:
            return make_response(jsonify({'message': 'User profile not found'}), 404)

        response = {
            'user': user.to_dict(),
            'user_profile': user_profile.to_dict()
        }
        return make_response(jsonify({'data': response}), 200)

    @jwt_required()
    def put(self):
       user_id = get_jwt_identity()
       user = User.query.get(user_id)
       if not user:
           return make_response(jsonify({'message': 'User not found'}), 404)

       data = request.get_json()
       if not data:
           return make_response(jsonify({'message': 'Bad Request: Missing data'}), 400)

    
       if not any(key in data for key in ['bio', 'username', 'social_links', 'password', 'profile_picture']):
           return make_response(jsonify({'message': 'Bad Request: At least one field must be provided'}), 400)

    
       user_profile = UserProfile.query.filter_by(user_id=user_id).first()
       if not user_profile:
           return make_response(jsonify({'message': 'User profile not found'}), 404)

       if 'bio' in data:
           user_profile.bio = data['bio']
       if 'social_links' in data:
           user_profile.social_links = data['social_links']
       if 'profile_picture' in data:
           user_profile.profile_picture = data['profile_picture']

    
       if 'username' in data:
           user.username = data['username']
       if 'password' in data:
           user.password = generate_password_hash(data['password'])

       db.session.commit()
       return make_response(jsonify({'message': 'User profile updated'}), 200)
        
        
api.add_resource(UserProfiles, '/profiles')
api.add_resource(UserProfileByID, '/userprofiles/<int:id>')
api.add_resource(MyProfile, '/my-profile')

# Ratings resources
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
            # Update the existing rating
            return self.put(post_id, existing_rating.id)
        
        try:
            # Adjust the post's like/dislike count
            if status == 'like':
                post.likes_count += 1
            elif status == 'dislike':
                post.dislikes_count += 1

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

    @jwt_required()
    def put(self, post_id, id=None):
        data = request.get_json()
        status = data.get('status')
        if status not in ['like', 'dislike']:
            return make_response(jsonify({'message': 'Bad Request: Invalid status'}), 400)

        user_id = get_jwt_identity()

        rating = Rating.query.filter_by(post_id=post_id, id=id).first()
        if not rating:
            return make_response(jsonify({'message': 'Rating not found'}), 404)
        
        if rating.user_id != user_id:
            return make_response(jsonify({'message': 'Forbidden: You are not authorized to update this rating'}), 403)
        
        try:
            post = Post.query.get(post_id)
            # Update the post's like/dislike counts
            if rating.status == 'like':
                post.likes_count -= 1
            elif rating.status == 'dislike':
                post.dislikes_count -= 1

            if status == 'like':
                post.likes_count += 1
            elif status == 'dislike':
                post.dislikes_count += 1

            rating.status = status
            db.session.commit()

            return make_response(jsonify({'message': 'Rating updated', 'rating': rating.to_dict()}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)

    @jwt_required()
    def delete(self, post_id, id):
        rating = Rating.query.filter_by(post_id=post_id, id=id).first()
        if not rating:
            return make_response(jsonify({'message': 'Rating not found'}), 404)
        
        user_id = get_jwt_identity()
        if user_id != rating.user_id:
            return make_response(jsonify({'message': 'Forbidden: You are not authorized to delete this rating'}), 403)
        
        try:
            post = Post.query.get(post_id)
            if rating.status == 'like':
                post.likes_count -= 1
            elif rating.status == 'dislike':
                post.dislikes_count -= 1

            db.session.delete(rating)
            db.session.commit()
            return make_response(jsonify({'message': 'Rating deleted'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
        
class RatingByPost(Resource):
    @jwt_required()
    def get(self, post_id, id):
        rating = Rating.query.filter_by(post_id=post_id, id=id).first()
        if not rating:
            return make_response(jsonify({'message': 'Rating not found'}), 404)
                
        response = {'rating': rating.to_dict()}
        return make_response(jsonify(response), 200)
    
    @jwt_required()
    def put(self, post_id, id):
        data = request.get_json()
        status = data.get('status')
        if status not in ['like', 'dislike']:
            return make_response(jsonify({'message': 'Bad Request: Invalid status'}), 400)

        rating = Rating.query.filter_by(post_id=post_id, id=id).first()
        if not rating:
            return make_response(jsonify({'message': 'Rating not found'}), 404)

        user_id = get_jwt_identity()
        if rating.user_id != user_id:
            return make_response(jsonify({'message': 'Forbidden: You are not authorized to update this rating'}), 403)

        try:
            post = Post.query.get(post_id)
            # Adjust the post's like/dislike count
            if rating.status == 'like':
                post.likes_count -= 1
            elif rating.status == 'dislike':
                post.dislikes_count -= 1

            if status == 'like':
                post.likes_count += 1
            elif status == 'dislike':
                post.dislikes_count += 1

            rating.status = status
            db.session.commit()

            return make_response(jsonify({'message': 'Rating updated', 'rating': rating.to_dict()}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
    
    @jwt_required()
    def delete(self, post_id, id):
        rating = Rating.query.filter_by(post_id=post_id, id=id).first()
        if not rating:
            return make_response(jsonify({'message': 'Rating not found'}), 404)
        
        user_id = get_jwt_identity()
        if user_id != rating.user_id:
            return make_response(jsonify({'message': 'Forbidden: You are not authorized to delete this rating'}), 403)
        
        try:
            post = Post.query.get(post_id)
            if rating.status == 'like':
                post.likes_count -= 1
            elif rating.status == 'dislike':
                post.dislikes_count -= 1

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

api.add_resource(Ratings, '/ratings')
api.add_resource(RatingByPost, '/posts/<int:post_id>/ratings/<int:id>')
api.add_resource(RatingsForPost, '/posts/<int:post_id>/ratings')

# PosTags Resources
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
        
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        if not user.is_admin:
            return make_response(jsonify({'message': 'Forbidden: You are not authorized to add tags to this post'}), 403)
        
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
        
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        if not user.is_admin:
            return make_response(jsonify({'message': 'Forbidden: You are not authorized to remove tags from this post'}), 403)

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

api.add_resource(PostTags, '/posts/<int:post_id>/tags', '/posts/<int:post_id>/tags/<int:tag_id>')
api.add_resource(PostsByTag, '/tags/<int:tag_id>/posts')

#Notifications Resources
class NotificationsResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        content = data.get('content')
        receiver_id = data.get('receiver_id')

        if not content or not receiver_id:
            return make_response(jsonify({'message': 'Bad Request: Missing content or user_id'}), 400)
        
        receiver_user = User.query.get(receiver_id)
        if not receiver_user:
            return make_response(jsonify({'message': 'User not found'}), 404)
        
        new_notif = Notifications(user_id=receiver_id, content=content)

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
        notifications = Notifications.query.filter_by(receiver_id=user_id).all()
        
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
        notification = Notifications.query.filter_by(id=id, receiver_id=user_id).first_or_404()

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
        notification = Notifications.query.filter_by(id=id, receiver_id=user_id).first_or_404()

        response = {'notification': notification.to_dict()}
        return make_response(jsonify(response), 200)
    
    @jwt_required()
    def delete(self, id):
        user_id = get_jwt_identity()
        notification = Notifications.query.filter_by(id=id, receiver_id=user_id).first_or_404()

        try:
            db.session.delete(notification)
            db.session.commit()
            return make_response(jsonify({'message': 'Notification deleted'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)

api.add_resource(NotificationsResource, '/notifications', '/users/me/notifications')
api.add_resource(NotificationByID, '/notifications/<int:id>')

# User Favourites Resources
class UserFavouritesResource(Resource):
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
    def get(self, post_id=None):
        user_id = get_jwt_identity()

        if post_id:
            favourite_exists = UserFavourites.query.filter_by(user_id=user_id, post_id=post_id).first()
            exists = favourite_exists is not None
            return make_response(jsonify({'exists': exists}), 200)
        
        favourites = UserFavourites.query.filter_by(user_id=user_id).all()
        if not favourites:
            return make_response(jsonify({'message': 'No favourites found'}), 404)

        result = [{'post_id': favourite.post_id} for favourite in favourites]
        return make_response(jsonify(result), 200)

api.add_resource(UserFavouritesResource, '/users/me/favourites', '/users/me/favourites/<int:post_id>', '/users/me/favourites?post_id=<post_id>')

# Posts Resources
class Posts(Resource):
    def get(self):
        posts = Post.query.all()
        result = [post.to_dict() for post in posts]
        return make_response(jsonify(result), 200)
    
    @jwt_required()
    def post(self):
        author_id = get_jwt_identity()
        data = request.get_json()
        title = data.get('title')
        content = data.get('content')
        tags = data.get('tags', [])  # Tags are optional

        if not title or not content:
            return make_response(jsonify({'message': 'Bad Request: Missing title or content'}), 400)

        new_post = Post(
            title=title,
            content=content,
            author_id=author_id
        )
        try:
            db.session.add(new_post)
            db.session.commit()
            
            # Handle tags
            if tags:
                for tag_id in tags:
                    tag = Tag.query.get(tag_id)
                    if tag:
                        new_post.tags.append(tag)  # Assuming a many-to-many relationship between Post and Tag
                db.session.commit()
                
            return make_response(jsonify({'message': 'Post created successfully'}), 201)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
            
class PostByID(Resource):
    def get(self, id):
        post = Post.query.filter_by(id=id).first()
        if not post:
            return make_response(jsonify({'message': 'Post not found'}), 404)
        return make_response(jsonify(post.to_dict()), 200)
    
    @jwt_required()
    def put(self, id):
        author_id = get_jwt_identity()
        data = request.get_json()
        post = Post.query.filter_by(id=id).first()
        if not post:
            return make_response(jsonify({'message': 'Post not found'}), 404)
        
        if post.author_id != author_id:
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
        title = data.get('title')
        content = data.get('content')
        
        if not title or not content:
            return make_response(jsonify({'message': 'Bad Request: Missing title or content'}), 400)
        
        post.title = title
        post.content = content
        try:
            db.session.commit()
            return make_response(jsonify({'message': 'Post updated successfully'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
    
    @jwt_required()
    def delete(self, id):
        author_id = get_jwt_identity()
        post = Post.query.filter_by(id=id).first()
        if not post:
            return make_response(jsonify({'message': 'Post not found'}), 404)
        
        if post.author_id != author_id:
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
        try:
            db.session.delete(post)
            db.session.commit()
            return make_response(jsonify({'message': 'Post deleted successfully'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error: {str(e)}'}), 500)
        
class PostsFromFollowedUsers(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()

        followed_users_ids = db.session.query(followers.c.followed_id).filter(followers.c.follower_id == user_id).subquery()

        posts = Post.query.filter(Post.author_id.in_(followed_users_ids)).order_by(Post.created_at.desc()).all()

        result = [post.to_dict() for post in posts]

        return make_response(jsonify(result), 200)
    
class PopularPosts(Resource):
    def get(self):
        posts = Post.query.order_by(Post.likes_count.desc()).limit(5).all()
        result = [post.to_dict() for post in posts]
        return make_response(jsonify(result), 200) 
    
class MyPosts(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        posts = Post.query.filter_by(author_id=user_id).order_by(Post.created_at.desc()).all()
        result = [post.to_dict() for post in posts]
        return make_response(jsonify(result), 200)

api.add_resource(PostsFromFollowedUsers, '/posts/followed')
api.add_resource(Posts, '/posts')
api.add_resource(PostByID, '/posts/<int:id>')
api.add_resource(PopularPosts, '/trending-posts')
api.add_resource(MyPosts, '/my-posts')

# Categories Resources
class Categories(Resource):
    def get(self):
        categories = Category.query.all()
        result = [category.to_dict() for category in categories]
        return make_response(jsonify(result), 200)
    
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        if not is_admin(user_id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
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
    
    @jwt_required()
    def put(self, id):
        user_id = get_jwt_identity()
        if not is_admin(user_id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
        data = request.get_json()
        category = Category.query.filter_by(id=id).first()
        if not category:
            return make_response(jsonify({'message': 'Category not found'}), 404)
        
        category.name = data['name']
        category.description = data.get('description')
        db.session.commit()
        return make_response(jsonify({'message': 'Category updated successfully'}), 200)
    
    @jwt_required()
    def delete(self, id):
        user_id = get_jwt_identity()
        if not is_admin(user_id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
        category = Category.query.filter_by(id=id).first()
        if not category:
            return make_response(jsonify({'message': 'Category not found'}), 404)
        
        db.session.delete(category)
        db.session.commit()
        return make_response(jsonify({'message': 'Category deleted successfully'}), 200)

api.add_resource(Categories, '/categories')
api.add_resource(CategoryByID, '/categories/<int:id>')

# Followers Resources
class Myfollowers(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()        
        
        follower_ids = db.session.query(followers.c.follower_id).filter(followers.c.followed_id == user_id).all()
        follower_ids = [f[0] for f in follower_ids]          
        
        followers_list = User.query.filter(User.id.in_(follower_ids)).all()
        
        result = [user.to_dict() for user in followers_list]
        
        return make_response(jsonify(result), 200)
    
class MyFollowing(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        following_ids = db.session.query(followers.c.followed_id).filter(followers.c.follower_id == user_id).all()
        following_ids = [f[0] for f in following_ids]  
        
        following_list = User.query.filter(User.id.in_(following_ids)).all()
        
        result = [user.to_dict() for user in following_list]
        
        return make_response(jsonify(result), 200)

class Follow(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        followed_user_id = data.get('followed_user_id')

        if not followed_user_id:
            return make_response(jsonify({'message': 'Invalid request data'}), 400)

        if user_id == followed_user_id:
            return make_response(jsonify({'message': 'Cannot follow yourself'}), 400)

        existing_follow = db.session.query(followers).filter_by(follower_id=user_id, followed_id=followed_user_id).first()
        if not existing_follow:
            db.session.execute(followers.insert().values(follower_id=user_id, followed_id=followed_user_id))
            db.session.commit()

            User.query.filter_by(id=user_id).update({'following_count': User.following_count + 1})
            User.query.filter_by(id=followed_user_id).update({'followers_count': User.followers_count + 1})
            db.session.commit()

            return make_response(jsonify({'message': 'Followed successfully'}), 200)
        else:
            return make_response(jsonify({'message': 'Already following'}), 400)
        
class Unfollow(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        followed_user_id = data.get('followed_user_id')

        if not followed_user_id:
            return make_response(jsonify({'message': 'Invalid request data'}), 400)

        if user_id == followed_user_id:
            return make_response(jsonify({'message': 'Cannot unfollow yourself'}), 400)

        existing_follow = db.session.query(followers).filter_by(follower_id=user_id, followed_id=followed_user_id).first()
        if existing_follow:
            db.session.execute(followers.delete().where(followers.c.follower_id == user_id, followers.c.followed_id == followed_user_id))
            db.session.commit()

            # Update counts
            User.query.filter_by(id=user_id).update({'following_count': User.following_count - 1})
            User.query.filter_by(id=followed_user_id).update({'followers_count': User.followers_count - 1})
            db.session.commit()

            return make_response(jsonify({'message': 'Unfollowed successfully'}), 200)
        else:
            return make_response(jsonify({'message': 'Not following this user'}), 400)
    
api.add_resource(Myfollowers, '/myfollowers')
api.add_resource(MyFollowing, '/myfollowing')
api.add_resource(Follow, '/follow')
api.add_resource(Unfollow, '/unfollow')

# Setting Resources
class SettingsResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        settings = Settings.query.filter_by(user_id=user_id).first()
        if settings:
            return make_response(jsonify(settings.to_dict()), 200)
        else:
            return make_response(jsonify({'message': 'No settings found'}), 404)

    @jwt_required()
    def put(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        settings = Settings.query.filter_by(user_id=user_id).first()
        if settings:
            settings.preferences = data['preferences']
        else:
            settings = Settings(user_id=user_id, preferences=data['preferences'])
            db.session.add(settings)
        db.session.commit()
        return make_response(jsonify({'message': 'Settings updated successfully'}), 200)

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        settings = Settings.query.filter_by(user_id=user_id).first()
        if settings:
            return make_response(jsonify({'message': 'Settings already exist, use PUT to update'}), 400)
        settings = Settings(user_id=user_id, preferences=data['preferences'])
        db.session.add(settings)
        db.session.commit()
        return make_response(jsonify({'message': 'Settings created successfully'}), 201)

    @jwt_required()
    def delete(self):
        user_id = get_jwt_identity()
        settings = Settings.query.filter_by(user_id=user_id).first()
        if not settings:
            return make_response(jsonify({'message': 'No settings found'}), 404)
        db.session.delete(settings)
        db.session.commit()
        return make_response(jsonify({'message': 'Settings deleted successfully'}), 200)

api.add_resource(SettingsResource, '/users/me/settings')

# Comment Resources
class CommentResource(Resource):    
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
        
        user_id = get_jwt_identity()
        if comment.user_id != user_id and not is_admin(user_id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)

        content = data.get('content')
        if not content:
            return make_response(jsonify({'message': 'Bad Request: Missing content'}), 400)
        
        comment.content = content
        db.session.commit()
        return make_response(jsonify({'message': 'Comment updated successfully'}), 200)
    
    @jwt_required()
    def delete(self, post_id, id):
        comment = Comment.query.filter_by(id=id, post_id=post_id).first()
        if not comment:
            return make_response(jsonify({'message': 'Comment not found'}), 404)
        
        user_id = get_jwt_identity()
        if comment.user_id != user_id and not is_admin(user_id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)

        db.session.delete(comment)
        db.session.commit()
        return make_response(jsonify({'message': 'Comment deleted successfully'}), 200)
    
class CommentsListResource(Resource):
    @jwt_required()
    def post(self, post_id):
        data = request.get_json()
        user_id = get_jwt_identity()
        content = data.get('content')

        if not content:
            return make_response(jsonify({'message': 'Bad Request: Missing content'}), 400)

        new_comment = Comment(
            content=content,
            user_id=user_id,
            post_id=post_id
        )
        db.session.add(new_comment)
        post = Post.query.get(post_id)
        if post:
            post.comments_count += 1
        db.session.commit()
        return make_response(jsonify({'message': 'Comment created successfully'}), 201)
    
    def get(self, post_id):  

        try:
            comments = Comment.query.filter_by(post_id=post_id).all()
            comments_list = [{'id': c.id, 'content': c.content} for c in comments]
            return jsonify({
                'comments': comments_list,
                'total': len(comments)
            })
        except Exception as e:
            print(f"Error fetching comments: {e}")
            return {'message': 'Error fetching comments'}, 500
        
class MyComments(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        comments = Comment.query.filter_by(user_id=user_id).all()
        comments_list = [{'id': c.id, 'content': c.content} for c in comments]
        return jsonify({'comments': comments_list})
   
api.add_resource(CommentResource, '/posts/<int:post_id>/comments/<int:id>')
api.add_resource(CommentsListResource, '/posts/<int:post_id>/comments')
api.add_resource(MyComments, '/my-comments')

# Messages Resources
class MessageResource(Resource):
    @jwt_required()
    def post(self, recipient_id):
        data = request.get_json()
        user_id = get_jwt_identity()
        content = data.get('content')

        if not content:
            return make_response(jsonify({'message': 'Bad Request: Missing content'}), 400)

        new_message = Messages(
            content=content,
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
        if message.sender_id != user_id:
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
        content = data.get('content')
        if not content:
            return make_response(jsonify({'message': 'Bad Request: Missing content'}), 400)
        
        message.content = content
        db.session.commit()
        return make_response(jsonify({'message': 'Message updated successfully'}), 200)
    
    @jwt_required()
    def delete(self, id):
        user_id = get_jwt_identity()
        message = Messages.query.filter_by(id=id).first()
        if not message:
            return make_response(jsonify({'message': 'Message not found'}), 404)
        if message.sender_id != user_id:
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
        db.session.delete(message)
        db.session.commit()
        return make_response(jsonify({'message': 'Message deleted successfully'}), 200)

api.add_resource(MessageResource, '/users/me/messages/<int:id>', '/users/me/messages')

def is_admin(user_id):
    user = User.query.filter_by(id=user_id).first()
    return user.is_admin if user else False

# Tag Resources
class TagResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        if not is_admin(user_id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
        data = request.get_json()
        if 'name' not in data:
            return make_response(jsonify({'message': 'Bad Request: Missing name'}), 400)
        
        existing_tag = Tag.query.filter_by(name=data['name']).first()
        if existing_tag:
            return make_response(jsonify({'message': 'Tag already exists'}), 400)
        
        new_tag = Tag(name=data['name'])
        db.session.add(new_tag)
        db.session.commit()
        return make_response(jsonify({'message': 'Tag created successfully'}), 201)
    
    @jwt_required()
    def get(self, id):
        tag = Tag.query.get(id)
        if not tag:
            return make_response(jsonify({'message': 'Tag not found'}), 404)
        return make_response(jsonify(tag.to_dict()), 200)
    
    @jwt_required()
    def put(self, id):
        user_id = get_jwt_identity()
        if not is_admin(user_id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
        data = request.get_json()
        tag = Tag.query.get(id)
        if not tag:
            return make_response(jsonify({'message': 'Tag not found'}), 404)
        
        if 'name' not in data:
            return make_response(jsonify({'message': 'Bad Request: Missing name'}), 400)
        
        existing_tag = Tag.query.filter_by(name=data['name']).first()
        if existing_tag and existing_tag.id != id:
            return make_response(jsonify({'message': 'Tag name already in use'}), 400)
        
        tag.name = data['name']
        db.session.commit()
        return make_response(jsonify({'message': 'Tag updated successfully'}), 200)
    
    @jwt_required()
    def delete(self, id):
        user_id = get_jwt_identity()
        if not is_admin(user_id):
            return make_response(jsonify({'message': 'Unauthorized'}), 403)
        
        tag = Tag.query.get(id)
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
    


api.add_resource(TagResource, '/tags/<int:id>')
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
