import React from 'react';

const ReviewList = ({ reviews }) => {
  return (
    <div className="review-list">
      <h3>Reviews</h3>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.id} className="review">
            <p><strong>Rating:</strong> {review.rating}/5</p>
            <p>{review.comment}</p>
            <p><em>- {review.username}</em></p>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
};

export default ReviewList;
