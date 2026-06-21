import React from 'react';
import Stars from './Stars';

export interface ReviewItem {
  user: string;
  rating: number;
  text: string;
}

export interface ReviewsBlockProps {
  items: ReviewItem[];
  loading?: boolean;
  error?: string | null;
  showTitle?: boolean;
}

const ReviewsBlock: React.FC<ReviewsBlockProps> = ({ items, loading, error, showTitle = true }) => {
  // Show loading state only if we have no items yet (initial load)
  // If we have items, don't show loading to avoid flickering
  if (loading && items.length === 0) {
    return (
      <section className="mt-8">
        {showTitle && <h2 className="text-[30px] font-normal text-[#2ECC71] mb-6">Reviews</h2>}
        <div className="text-center py-8 text-[#949494]">Loading reviews...</div>
      </section>
    );
  }

  if (error && items.length === 0) {
    return (
      <section className="mt-8">
        {showTitle && <h2 className="text-[30px] font-normal text-[#2ECC71] mb-6">Reviews</h2>}
        <div className="text-center py-8 text-red-500 text-sm">{error}</div>
      </section>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <section className="mt-8">
        {showTitle && <h2 className="text-[30px] font-normal text-[#2ECC71] mb-6">Reviews</h2>}
        <div className="text-center py-8 text-[#949494]">
          No reviews yet. Be the first to review this product!
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      {showTitle && <h2 className="text-[30px] font-normal text-[#2ECC71] mb-6">Reviews</h2>}
      <div className="space-y-6">
        {items.map((r, idx) => (
          <div key={idx} className="border border-[#2ECC71] rounded-[10px] p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[16px] font-semibold text-[#2ECC71]">{r.user}</div>
              <div className="flex items-center gap-1">
                <Stars rating={r.rating} size="sm" />
                {/* <span className="text-[12px] text-[#949494]">({r.rating})</span> */}
              </div>
            </div>
            <p className="text-[12px] font-normal text-[#665345] leading-[1.3]">{r.text}</p>
          </div>
        ))}
        {items.length >= 10 && (
          <div className="flex justify-end">
            <button className="bg-[#2ECC71] text-white rounded-[10px] px-5 py-2 text-[15px] font-bold hover:bg-[#27AE60] transition-colors">
              See more
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsBlock;


