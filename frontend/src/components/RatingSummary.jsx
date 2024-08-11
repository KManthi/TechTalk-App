import React from 'react';

const RatingSummary = ({ reviews }) => {
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0;

  return (
    <div className="rating-summary">
      <h3>Rating Summary</h3>
      <p>Average Rating: {averageRating.toFixed(1)} / 5</p>
      <p>Total Reviews: {reviews.length}</p>
    </div>
  );
};

export default RatingSummary;
