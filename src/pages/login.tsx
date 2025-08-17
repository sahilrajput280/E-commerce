import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { EmailIcon, LockIcon } from "../components/Icons";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const Login: React.FC = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const userData = userCredential.user;
      localStorage.setItem("user", JSON.stringify(userData));
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleResetPassword = async () => {
    if (!form.email) {
      alert("Please enter your email address to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, form.email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative px-4"
      style={{
        backgroundImage: "url('/images/register-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-700 via-blue-500 to-blue-300 opacity-30"></div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 w-full flex justify-between md:justify-end items-center px-4 md:px-8 py-4 z-20 text-sm md:text-base">
        <Link
          to="/"
          className="text-white font-semibold mr-4 md:mr-6 hover:underline transition"
        >
          HOME
        </Link>
        <Link
          to="/register"
          className="text-white font-semibold hover:underline transition"
        >
          REGISTER
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full h-screen items-center justify-center md:justify-end px-4 md:px-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white bg-opacity-95 p-6 md:p-8 rounded shadow-lg w-full max-w-sm md:max-w-md flex flex-col gap-4"
        >
          <h2 className="text-xl md:text-2xl font-semibold mb-1">Login</h2>
          <p className="text-gray-500 mb-4 text-xs md:text-sm">
            Welcome back! Please login to your account.
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
              <EmailIcon />
            </span>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="pl-10 pr-3 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
              required
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
              <LockIcon />
            </span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="pl-10 pr-3 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 w-full font-semibold mt-2 text-sm md:text-base"
          >
            Login
          </button>
          <button
            type="button"
            onClick={handleResetPassword}
            className="text-blue-600 hover:underline text-xs md:text-sm mt-2"
          >
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
