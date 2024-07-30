from flask import Blueprint, request, jsonify
from app import db
from app.models import Category

bp = Blueprint('categories', __name__)

@bp.route('/categories', methods=['POST'])
def create_category():
    data = request.get_json()
    new_category = Category(name=data['name'])
    db.session.add(new_category)
    db.session.commit()
    return jsonify({'message': 'Category created successfully'}), 201
