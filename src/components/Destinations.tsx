import React, { useRef, useEffect } from "react";
import { destinations } from "../data/Destinations";

const Destinations: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    const originalChildren = Array.from(scrollContainer.children);
    originalChildren.forEach((child) => {
      const clone = child.cloneNode(true);
      scrollContainer.appendChild(clone);
    });

  let animationFrame: number;
  const scrollSpeed = 0.8; // Increased speed (px per frame)

    const animate = () => {
      if (!scrollContainer || isPaused.current) return;
      scrollContainer.scrollLeft += scrollSpeed; // Change to += for rightward movement

      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    // Add event listeners
    scrollContainer.addEventListener("mouseenter", () => { isPaused.current = true; });
    scrollContainer.addEventListener("mouseleave", () => { isPaused.current = false; animate(); });

    return () => {
      cancelAnimationFrame(animationFrame);
      if (scrollContainer) {
        const total = scrollContainer.children.length;
        for (let i = total - 1; i >= destinations.length; i--) {
          scrollContainer.removeChild(scrollContainer.children[i]);
        }
      }
      // Clean up event listeners
      scrollContainer.removeEventListener("mouseenter", () => { isPaused.current = true; });
      scrollContainer.removeEventListener("mouseleave", () => { isPaused.current = false; animate(); });
    };
  }, []);

  return (
    <section id="destinations" className="bg-[#cdd7cd] py-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-gray-800">
        Popular Destinations
      </h2>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 sm:gap-8 px-4 sm:px-8 pb-4 hide-scrollbar scroll-smooth"
        style={{
          scrollBehavior: "smooth",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        {destinations.map((dest, idx) => (
          <div
            key={dest.id + "-" + idx}
            className="flex-shrink-0 w-64 sm:w-80 rounded-3xl bg-white shadow-lg overflow-hidden pop-card"
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold text-gray-700">
                {dest.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
      {/* Removed 'Press Cto view recent work' as requested */}
    </section>
  );
};

export default Destinations;