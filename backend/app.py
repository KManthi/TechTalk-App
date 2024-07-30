from flask import Flask, request, make_response, jsonify
from flask_migrate import Migrate
from flask_restful import Api, Resource
from models import db, UserProfile


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///techtalk.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
migrate = Migrate(app, db)
db.init_app(app)
api = Api(app)

@app.route('/')
def index():
    return 'Welcome to the Tech Talk API!'

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

if __name__ == '__main__':
    app.run(port=5555, debug=True)