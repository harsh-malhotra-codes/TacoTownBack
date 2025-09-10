// Reviews Page JavaScript
class ReviewsManager {
    constructor() {
        this.reviews = [];
        this.currentRating = 0;
        this.init();
    }

    async init() {
        await this.loadReviewsData();
        this.setupEventListeners();
        this.loadReviewsGrid();
        this.setupRatingSystem();
    }

    async loadReviewsData() {
        this.reviews = await this.loadReviews();
    }

    setupEventListeners() {
        // Review form submission
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => this.handleReviewSubmit(e));
        }

        // Modal close
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeReviewModal());
        }

        // Modal close button
        const closeBtn = document.querySelector('#review-modal .modal-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeReviewModal());
        }

        // Close modal when clicking outside
        const modal = document.getElementById('review-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeReviewModal();
                }
            });
        }
    }

    setupRatingSystem() {
        const ratingStars = document.querySelectorAll('#rating-stars i');
        ratingStars.forEach((star, index) => {
            star.addEventListener('click', () => this.setRating(index + 1));
            star.addEventListener('mouseover', () => this.previewRating(index + 1));
            star.addEventListener('mouseout', () => this.resetRatingPreview());
        });
    }

    setRating(rating) {
        this.currentRating = rating;
        this.updateRatingDisplay(rating);
    }

    previewRating(rating) {
        this.updateRatingDisplay(rating);
    }

    resetRatingPreview() {
        this.updateRatingDisplay(this.currentRating);
    }

    updateRatingDisplay(rating) {
        const stars = document.querySelectorAll('#rating-stars i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    }

    async loadReviews() {
        try {
            // Fetch reviews from backend API
            const response = await fetch('/api/reviews');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Transform backend data to match frontend format
                    return data.data.map(review => ({
                        id: review.id,
                        name: review.name,
                        email: review.email || '',
                        rating: review.rating,
                        text: review.text,
                        date: review.created_at ? review.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                        avatar: review.name.charAt(0).toUpperCase()
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }

        // Fallback to empty array if API fails
        return [];
    }

    saveReviews() {
        localStorage.setItem('tacoReviews', JSON.stringify(this.reviews));
    }

    loadReviewsGrid() {
        // Load reviews for both homepage and dedicated reviews page
        this.loadHomepageReviews();
        this.loadDedicatedReviewsPage();
    }

    loadHomepageReviews() {
        const homepageGrid = document.getElementById('homepage-reviews-grid');
        if (!homepageGrid) return;

        // Clear existing content
        homepageGrid.innerHTML = '';

        // Display only the first 3 reviews on homepage
        const reviewsToShow = this.reviews.slice(0, 3);

        if (reviewsToShow.length === 0) {
            homepageGrid.innerHTML = '<p class="text-center text-muted">No reviews yet. Be the first to share your experience!</p>';
            return;
        }

        reviewsToShow.forEach(review => {
            const reviewCard = this.createReviewCard(review);
            homepageGrid.appendChild(reviewCard);
        });
    }

    loadDedicatedReviewsPage() {
        const reviewsGrid = document.getElementById('reviews-grid');
        if (!reviewsGrid) return;

        // Clear existing content
        reviewsGrid.innerHTML = '';

        // Display only the first 6 reviews
        const reviewsToShow = this.reviews.slice(0, 6);

        if (reviewsToShow.length === 0) {
            reviewsGrid.innerHTML = '<p class="text-center text-muted">No reviews yet. Be the first to share your experience!</p>';
            return;
        }

        reviewsToShow.forEach(review => {
            const reviewCard = this.createReviewCard(review);
            reviewsGrid.appendChild(reviewCard);
        });
    }

    createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.dataset.reviewId = review.id;

        const ratingStars = this.generateRatingStars(review.rating);
        const formattedDate = this.formatDate(review.date);

        card.innerHTML = `
            <div class="review-header">
                <div class="review-avatar">${review.avatar}</div>
                <div class="review-info">
                    <h4>${review.name}</h4>
                    <div class="review-date">${formattedDate}</div>
                </div>
            </div>
            <div class="review-rating">
                <div class="rating-stars">
                    ${ratingStars}
                </div>
            </div>
            <div class="review-text">
                <p>${review.text}</p>
            </div>
        `;

        return card;
    }

    generateRatingStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    async handleReviewSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('reviewer-name').value.trim();
        const email = document.getElementById('reviewer-email').value.trim();
        const text = document.getElementById('review-text').value.trim();

        // Validation
        if (!name || !text || this.currentRating === 0) {
            this.showNotification('Please fill in all required fields and select a rating', 'error');
            return;
        }

        try {
            // Submit review to backend API
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email || '',
                    rating: this.currentRating,
                    text: text
                })
            });

            const result = await response.json();

            if (result.success) {
                // Reload reviews from API
                this.reviews = await this.loadReviews();

                // Reset form
                this.resetForm();

                // Reload reviews grid
                this.loadReviewsGrid();

                // Show success modal
                this.showReviewModal();

                // Show notification
                this.showNotification('Thank you for your review!', 'success');
            } else {
                this.showNotification('Failed to submit review. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            this.showNotification('Failed to submit review. Please try again.', 'error');
        }
    }

    resetForm() {
        document.getElementById('reviewer-name').value = '';
        document.getElementById('reviewer-email').value = '';
        document.getElementById('review-text').value = '';
        this.currentRating = 0;
        this.updateRatingDisplay(0);
    }

    showReviewModal() {
        const modal = document.getElementById('review-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeReviewModal() {
        const modal = document.getElementById('review-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide notification after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // Admin functions for managing reviews
    getAllReviews() {
        return this.reviews;
    }

    deleteReview(reviewId) {
        this.reviews = this.reviews.filter(review => review.id !== reviewId);
        this.saveReviews();
        this.loadReviewsGrid();
        return true;
    }

    getReviewStats() {
        const totalReviews = this.reviews.length;
        const averageRating = totalReviews > 0
            ? (this.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
            : 0;

        const ratingDistribution = [0, 0, 0, 0, 0];
        this.reviews.forEach(review => {
            ratingDistribution[review.rating - 1]++;
        });

        return {
            total: totalReviews,
            average: averageRating,
            distribution: ratingDistribution
        };
    }
}

// Global function for modal close (accessible from HTML)
function closeReviewModal() {
    const reviewsManager = window.reviewsManager;
    if (reviewsManager) {
        reviewsManager.closeReviewModal();
    }
}

// Initialize reviews manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        window.reviewsManager = new ReviewsManager();
    }, 100);
});

// Export for admin use
window.ReviewsManager = ReviewsManager;
