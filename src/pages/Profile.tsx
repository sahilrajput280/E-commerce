import React from "react";
import profilePic from "../assets/react.svg"; // replace with your actual image path

const Profile: React.FC = () => {
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="flex flex-col md:flex-row bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-4xl">
        {/* Left Image Side */}
        <div className="w-full md:w-1/3 bg-teal-500 flex items-center justify-center relative py-10 md:py-0">
          <img
            src={profilePic}
            alt="Profile"
            className="rounded-full w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover border-4 border-white shadow-md md:absolute md:top-1/2 md:transform md:-translate-y-1/2"
          />
        </div>

        {/* Right Info Side */}
        <div className="w-full md:w-2/3 p-6 sm:p-10">
          <div className="mb-6 text-center md:text-left">
            <div className="w-16 h-1 bg-teal-400 rounded-full mb-3 mx-auto md:mx-0"></div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Personal Information
            </h2>
          </div>
          <ul className="space-y-3 text-gray-700 text-sm sm:text-base">
            <li>
              <span className="font-semibold">Name:</span>{" "}
              {user.firstName || "N/A"} {user.lastName || ""}
            </li>
            <li>
              <span className="font-semibold">Email:</span>{" "}
              {user.email || "N/A"}
            </li>
            <li>
              <span className="font-semibold">Contact Number:</span>{" "}
              {user.contact || "N/A"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;
