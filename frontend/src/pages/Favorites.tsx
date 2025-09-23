import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useFavorites } from '../contexts/FavoritesContext';

const Favorites: React.FC = () => {
  const { items, remove, clear } = useFavorites();

  return (
    <div className="min-h-screen bg-white">
      <Header variant="simple" />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-16 min-h-[50vh]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#2ECC71]">Favorites</h1>
          {items.length > 0 && (
            <button onClick={clear} className="text-sm text-red-500 underline">Clear all</button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center text-gray-600">
            No favorite products yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map(p => (
              <div key={p.id} className="border rounded-lg overflow-hidden">
                <div className="w-full aspect-square bg-[#C7FFDF] flex items-center justify-center">
                  <img src={p.image} alt={p.title} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="text-sm font-medium line-clamp-2 mr-2">{p.title}</div>
                  <button onClick={() => remove(p.id)} className="text-xs text-red-500 underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;


