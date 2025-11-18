import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import About from "../components/About";
import Services from "../components/services";
import Destinations from "../components/Destinations";
import BookingForm from "../components/bookings";
import Activities from "../components/Activities";
import ChatBot from "../components/ChatBot";

const planeImages = [
  "/images/5.jpg",
  "/images/2.jpg",
  "/images/4.jpg",
  "/images/1.jpg",
  "/images/3.jpg",
];

const sections = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "destinations", label: "Destinations" },
  { id: "Activities", label: "Activities" },
  { id: "bookings", label: "Booking" },
];

const LandingPage: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user"));

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ id: string; label: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);

  const handleResultClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setSearch("");
    setShowResults(false);
  };


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % planeImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem("cart");
      setCartCount(cart ? JSON.parse(cart).length : 0);
    };
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  useEffect(() => {
    (window as unknown as { openChatBot?: () => void }).openChatBot = () => setShowChatBot(true);
  }, []);

  useEffect(() => {
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem("user"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setResults([]);
      setShowResults(false);
      return;
    }
    const filtered = sections.filter((section) =>
      section.label.toLowerCase().includes(search.toLowerCase())
    );
    setResults(filtered);
    setShowResults(filtered.length > 0);
  }, [search]);

  return (
    <div className="text-center font-sans min-h-screen themed-page relative">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed top-0 right-0 h-full w-64 bg-card text-primary shadow-lg z-50 flex flex-col p-6 transition-transform duration-300">
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          <Link to="/profile" className="mb-2 hover:underline text-left">Profile</Link>
          <Link to="/cart" className="mb-2 hover:underline text-left">
            Manage Cart 
          </Link>
          <Link to="/cart" className="mb-2 hover:underline text-left">
            Order History  
          </Link>
          <Link to="/support" className="mb-2 hover:underline text-left">Customer Support</Link>
          <Link to="/feedback" className="mb-4 hover:underline text-left">Feedback</Link>
          <button
            onClick={() => {  
              localStorage.removeItem("user");
              setIsLoggedIn(false);
              setIsSidebarOpen(false);
            }}
            className="px-4 py-2 theme-outline rounded mb-2"
          >
            Logout
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="mt-2 text-sm text-muted hover:underline"
          >
            Close
          </button>
        </div>
      )}

      {/* Transparent Navbar */}
      <header className="sticky top-0 left-0 w-full flex items-center justify-between px-4 md:px-8 py-4 bg-card-soft backdrop-blur-md shadow-none z-40">
        <div className="flex items-center gap-3">
          <div className="logo-glow">
            <img
              src="https://cdn-icons-png.flaticon.com/512/854/854894.png"
              alt="CarSe-Chalo Logo"
              className="w-10 h-10 object-contain mr-2 logo-img"
            />
            <span className="ml-2 text-3xl md:text-4xl flex items-center font-sans logo-img text-primary">
              <span className="font-black">CarSe</span>
              <span className="font-normal">-Chalo</span>
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative ml-4 hidden md:block">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for Activities, Destinations and More"
            className="pl-10 pr-4 py-2 rounded-md bg-card border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 w-80 text-sm placeholder-gray-500 text-primary"
            onFocus={() => setShowResults(results.length > 0)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
          />
          {showResults && (
            <div className="absolute top-12 right-0 bg-card border border-primary rounded shadow w-80 z-50">
              {results.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block px-4 py-2 text-left text-sm surface-hover"
                  onClick={(e) => {
                    e.preventDefault();
                    handleResultClick(section.id);
                  }}
                >
                  {section.label}
                </a>
              ))}
              {results.length === 0 && (
                <div className="px-4 py-2 text-muted text-sm">No results found</div>
              )}
            </div>
          )}
        </div>

  <nav className="flex items-center gap-1 flex-wrap text-sm md:text-base text-primary">
          <a href="#home" className="font-medium px-3 py-1 rounded surface-hover">HOME</a>
          <a href="#about" className="font-medium px-3 py-1 rounded surface-hover">ABOUT</a>
          <a href="#services" className="font-medium px-3 py-1 rounded surface-hover">SERVICES</a>
          <a href="#Activities" className="font-medium px-3 py-1 rounded surface-hover">ACTIVITIES</a>

          {isLoggedIn ? (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="ml-4 p-2 rounded surface-hover"
            >
              {/* Hamburger Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 theme-outline rounded">LOG-IN</Link>
              <Link to="/register" className="px-4 py-2 theme-outline rounded">REGISTER</Link>
            </>
          )}
          {/* Theme Toggle */}
          <ThemeToggle />
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="relative h-[80vh] flex flex-col items-center justify-center"
        style={{
          backgroundImage: `url(${planeImages[current].replace('/public', '')})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 0.5s ease-in-out",
        }}
      >
        <hr className="w-1/2 border-t-2 border-white mb-6" />
        <h1 className="text-white text-3xl md:text-6xl font-bold uppercase tracking-widest mb-2">LOSE | YOURSELF</h1>
        <h1 className="text-white text-3xl md:text-6xl font-bold uppercase tracking-widest">DISCOVER | YOURSELF</h1>
        <hr className="w-1/2 border-t-2 border-white mt-6" />
        <div className="flex justify-center mt-8 space-x-2">
          {planeImages.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-1 rounded-full ${current === idx ? "bg-white" : "bg-gray-500"} focus:outline-none`}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Activities Icons */}
      <section className="flex flex-wrap justify-center gap-6 sm:gap-12 bg-section py-12 px-4">
        <div className="flex flex-col items-center">
          <img src="https://cdn-icons-png.flaticon.com/512/201/201623.png" alt="Car Booking" className="w-16 h-16 mb-2" />
          <span className="text-primary text-sm">Booking</span>
        </div>
        <div className="flex flex-col items-center">
          <img src="https://cdn-icons-png.flaticon.com/512/616/616494.png" alt="Hot Air Balloon" className="w-16 h-16 mb-2" />
          <span className="text-primary text-sm">Accessible</span>
        </div>
        <div className="flex flex-col items-center">
          <img src="https://cdn-icons-png.flaticon.com/512/854/854866.png" alt="Travelling" className="w-16 h-16 mb-2" />
          <span className="text-primary text-sm">Travelling</span>
        </div>
      </section>

      <section id="about"><About /></section>
      <section id="services"><Services /></section>
      {/* Floating Chat Button */}
<button
  onClick={() => setShowChatBot((prev) => !prev)}
  className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg z-50"
>
  💬
</button>

{/* Floating ChatBot Container */}
{showChatBot && (
  <div className="fixed bottom-20 right-3 sm:right-6 w-[92vw] sm:w-80 h-[70vh] sm:h-[28rem] bg-card rounded-2xl shadow-lg z-50 overflow-hidden flex flex-col">
    {/* Header */}
    <div className="bg-section-alt text-section-alt p-3 flex justify-between items-center">
      <span className="font-bold">CarSe-Chalo ChatBot</span>
      <button
        onClick={() => setShowChatBot(false)}
        className="text-section-alt hover:opacity-80 text-lg"
        aria-label="Close Chatbot"
      >
        ✖
      </button>
    </div>

    {/* ChatBot Content */}
    <div className="flex-1 overflow-y-auto">
      <ChatBot />
    </div>
  </div>
)}


      <section id="destinations" className="bg-section"><Destinations /></section>
      <section id="Activities" className="bg-section"><Activities /></section>
      <section id="bookings" className="bg-section"><BookingForm /></section>
    </div>
  );
};

export default LandingPage;

const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="ml-3 p-2 rounded-full bg-white/80 dark:bg-black/60 shadow hover:scale-105 transition-transform"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
};