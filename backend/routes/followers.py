from flask import Blueprint, request, jsonify
from app import db
from models import Followers

bp = Blueprint('followers', __name__)

@bp.route('/followers', methods=['POST'])
def follow_user():
    data = request.get_json()
    new_follow = Followers(
        follower_id=data['follower_id'],
        followed_id=data['followed_id']
    )
    db.session.add(new_follow)
    db.session.commit()
    return jsonify({'message': 'Followed successfully'}), 201
