from flask import Blueprint, request, jsonify
from app import db
from app.models import Post

bp = Blueprint('posts', __name__)

@bp.route('/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    new_post = Post(
        user_id=data['user_id'],
        category_id=data['category_id'],
        title=data['title'],
        content=data['content']
    )
    db.session.add(new_post)
    db.session.commit()
    return jsonify({'message': 'Post created successfully'}), 201
