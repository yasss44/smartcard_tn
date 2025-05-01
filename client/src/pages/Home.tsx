import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useEffect } from 'react';
import NFCCard3D from '../components/NFCCard3D';

const Home = () => {
  // Add cursor glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cursor = document.createElement('div');
      cursor.className = 'cursor-glow';
      cursor.style.left = `${e.pageX}px`;
      cursor.style.top = `${e.pageY}px`;
      document.body.appendChild(cursor);

      setTimeout(() => {
        cursor.remove();
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="hero hero-section">
        <div className="container">
          <div className="hero-content">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-cyan">
                <span className="neon-blue">Smart Card</span><span className="neon-pink"> Tunisia</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Create Your Digital Business Card
              </h2>
              <p className="text-xl mb-8">
                Design custom NFC business cards with our easy-to-use drag-and-drop editor.
                Share your contact info, social media, and more with a simple tap.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="btn btn-cyan animate-glow"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline"
                >
                  Log In
                </Link>
              </div>
            </div>
            <div>
              <div className="glass p-6 rounded-lg shadow-xl relative overflow-hidden h-[350px] w-[350px] bg-transparent border border-blue-500 border-opacity-30 nfc-card-container" style={{ touchAction: 'none' }}>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500 rounded-full opacity-20 blur-xl"></div>
                <div className="w-full h-full relative z-10" style={{ touchAction: 'none' }}>
                  <NFCCard3D />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="neon-blue">Features</h2>
          <div className="features-grid">
            <div className="card">
              <div className="card-icon bg-blue-500 bg-opacity-20 text-blue-500 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <h3 className="neon-blue">Drag-and-Drop Editor</h3>
              <p>
                Easily design your card with our intuitive drag-and-drop editor.
                No design skills required.
              </p>
            </div>
            <div className="card">
              <div className="card-icon bg-pink-500 bg-opacity-20 text-pink-500 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="neon-pink">Custom Backgrounds</h3>
              <p>
                Upload your own images or choose from our collection of
                backgrounds and color schemes.
              </p>
            </div>
            <div className="card">
              <div className="card-icon bg-cyan-500 bg-opacity-20 text-cyan-500 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="neon-cyan">Instant Sharing</h3>
              <p>
                Each card gets a unique URL. Share your digital card instantly
                with anyone, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="neon-pink">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number bg-blue-500 bg-opacity-20 text-white border border-blue-500 animate-glow">
                1
              </div>
              <h3 className="neon-blue">Create Account</h3>
              <p>
                Sign up for free and access our card editor.
              </p>
            </div>
            <div className="step">
              <div className="step-number bg-pink-500 bg-opacity-20 text-white border border-pink-500 animate-glow">
                2
              </div>
              <h3 className="neon-pink">Design Your Card</h3>
              <p>
                Use our editor to create your perfect digital card.
              </p>
            </div>
            <div className="step">
              <div className="step-number bg-purple-500 bg-opacity-20 text-white border border-purple-500 animate-glow">
                3
              </div>
              <h3 className="neon-purple">Order NFC Cards</h3>
              <p>
                Order physical NFC cards linked to your digital profile.
              </p>
            </div>
            <div className="step">
              <div className="step-number bg-cyan-500 bg-opacity-20 text-white border border-cyan-500 animate-glow">
                4
              </div>
              <h3 className="neon-cyan">Share Your Info</h3>
              <p>
                Tap your NFC card on any phone to share your details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="neon-cyan">Ready to Get Started?</h2>
            <p>
              Create your digital business card today and make networking easier than ever.
            </p>
            <Link
              to="/register"
              className="btn btn-pink animate-glow"
            >
              Create Your Card
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h3><span className="neon-blue">Smart Card</span><span className="neon-pink"> Tunisia</span></h3>
              <p>© 2025 Smart Card Tunisia. All rights reserved</p>
            </div>
            <div className="footer-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
