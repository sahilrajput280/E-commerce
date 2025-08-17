import React from "react";

const CustomerSupport: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50">
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Customer Support
      </h2>
      <p className="mb-6 text-gray-700 text-sm sm:text-base text-center">
        How can we help you? Fill out the form below and our team will get back
        to you soon.
      </p>
      <form className="space-y-4">
        <div>
          <label className="block font-semibold mb-1 text-sm sm:text-base">
            Subject
          </label>
          <input
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            type="text"
            placeholder="Subject"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-sm sm:text-base">
            Message
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            rows={5}
            placeholder="Describe your issue or question..."
          />
        </div>
        <button
          type="submit"
          className="mt-6 w-full bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 font-semibold transition text-sm sm:text-base"
        >
          Send
        </button>
      </form>
    </div>
  </div>
);

export default CustomerSupport;