from flask import Flask, request, make_response, jsonify
from flask_migrate import Migrate
from flask_restful import Api, Resource
from models import db, UserProfile, Post, Category, Followers, Settings

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///techtalk.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
migrate = Migrate(app, db)
db.init_app(app)
api = Api(app)

@app.route('/')
def index():
    return 'Welcome to the Tech Talk API!'

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
    
api.add_resource(UserProfiles, '/userprofiles')
api.add_resource(UserProfileByID, '/userprofiles/<int:id>')

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
