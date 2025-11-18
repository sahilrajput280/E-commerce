import React, { useState } from "react";
import { activities } from "../data/Activities";

interface Activity {
  title: string;
  subtitle: string;
  details: string;
  description: string;
  price: string;
  images: string[];
}

const Activities: React.FC = () => {
  const [cart, setCart] = useState<Activity[]>([]);

  const handleAddToCart = (activity: Activity) => {
    setCart((prev) => [...prev, activity]);

    const stored: Activity[] = JSON.parse(localStorage.getItem("cart") || "[]");
    stored.push(activity);
    localStorage.setItem("cart", JSON.stringify(stored));

    alert(`${activity.title} added to cart!`);
  };

  return (
    <section className="bg-[#ccd7cd] py-12 min-h-screen">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
        Discover Your Destination
      </h2>
      <p className="text-center text-gray-500 mb-8">
        Our collection of the most popular things to do in India.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {activities.map((activity: Activity, idx: number) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-md flex flex-col pop-card overflow-hidden"
          >
            <div className="flex">
              {activity.images?.map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  alt={activity.title}
                  className="h-28 w-1/3 object-cover"
                />
              ))}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-1">
                {activity.title}
              </h3>
              <div className="text-xs text-purple-700 font-semibold mb-1">
                {activity.subtitle}
              </div>
              <div className="text-xs text-gray-500 mb-2">{activity.details}</div>
              <div className="text-sm text-gray-600 mb-3 flex-1">
                {activity.description}
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <span className="block text-xs text-gray-400">from</span>
                  <span className="font-bold text-indigo-700">{activity.price}</span>
                </div>
                <button
                  className="bg-indigo-600 text-white px-5 py-2 rounded-md text-xs font-semibold hover:bg-indigo-700 transition-transform transform hover:-translate-y-0.5 active:translate-y-0"
                  onClick={() => handleAddToCart(activity)}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden">Cart: {cart.length}</div>
    </section>
  );
};

export default Activities;
