import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect } from "react";
import Navbar from "./Navbar";

export default function Home() {
  const user = auth.currentUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Global Navbar with shared search */}
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Share Knowledge,
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                {" "}Learn Together
              </span>
            </h1>
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              KidZone is the perfect platform for students and educators to share notes, 
              collaborate on learning materials, and discover new educational content.
            </p>
          </div>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
              <Link
                to="/signup"
                className="btn btn-gradient px-8 py-4 text-lg transform"
              >
                Start Learning Today
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary px-8 py-4 text-lg transform"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose MindBridge?
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need for collaborative learning
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="bg-gradient-to-r from-indigo-100 to-indigo-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">Share Notes</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload and share PDF documents and images with your learning community.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="bg-gradient-to-r from-green-100 to-green-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-green-600 transition-colors duration-300">Connect & Discover</h3>
              <p className="text-gray-600 leading-relaxed">
                Find other learners, explore their shared content, and expand your knowledge.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors duration-300">Organized Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Keep your study materials organized and easily accessible in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-indigo-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of students and educators sharing knowledge every day.
            </p>
            <Link
              to="/signup"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 MindBridge. Made with ❤️ for learners everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
