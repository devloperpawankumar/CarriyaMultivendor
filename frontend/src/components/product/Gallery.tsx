import React, { useState } from 'react';

const Gallery: React.FC<{ images: string[] }> = ({ images }) => {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setIndex(i => (i + 1) % images.length);

  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div>
      <div className="relative w-full h-[321px] md:aspect-square overflow-hidden bg-[#C7FFDF] md:border md:border-[#2ECC71] flex items-center justify-center">
        <button onClick={() => setLightboxOpen(true)} className="w-full h-full">
          <img src={images[index]} alt="Product" className="h-full w-full object-contain" />
        </button>

        {/* Desktop arrows */}
        <button
          aria-label="Previous"
          onClick={prev}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#2ECC71] bg-opacity-50 text-white items-center justify-center hover:bg-opacity-70 transition-all"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <button
          aria-label="Next"
          onClick={next}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#2ECC71] bg-opacity-50 text-white items-center justify-center hover:bg-opacity-70 transition-all"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>

        {/* Mobile counter pill */}
        <div className="md:hidden absolute bottom-3 right-3 bg-white border border-[#2ECC71]/75 px-3 py-1 flex items-center gap-2 text-[#2ECC71]">
          {/* Camera icon */}
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
              stroke="#2ECC71"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="13" r="3.5" stroke="#2ECC71" strokeWidth="1.5" />
          </svg>
          {/* Counter */}
          <span className="text-[15px] leading-none">{index + 1}/{images.length}</span>
          {/* Controls */}
          <button aria-label="Prev" onClick={prev} className="p-0.5 -mr-0.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button aria-label="Next" onClick={next} className="p-0.5 -ml-0.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop thumbnails only */}
      <div className="mt-5 hidden md:flex gap-5">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-[104px] h-[104px] overflow-hidden border ${
              i === index ? 'border-[#2ECC71]' : 'border-transparent opacity-60'
            }`}
          >
            <img src={src} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <img src={images[index]} alt="Preview" className="max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      )}
    </div>
  );
};

export default Gallery;
