
import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    // Wait for DOM to be ready
    const scrollToHash = () => {
      if (location.hash) {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Slight delay ensures element exists
    const timeout = setTimeout(scrollToHash, 50);
    return () => clearTimeout(timeout);
  }, [location]);
  return (
    <div className="page home">
      <section className="hero card">
        <div className="hero-content">
          <h1>Welcome to brew & co</h1>
          <p>Discover the finest coffee experience — book tables, pre-order your favorites, and pay securely</p>
          <div className="actions">
            <Link className="btn primary" to="/register">Get Started</Link>
            <Link className="btn" to="/login">Sign In</Link>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img src="https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=600&h=400&fit=crop" alt="Premium Coffee" className="hero-image" />
        </div>
      </section>

      <section className="features" id='features'>
        <div className="card feature-card">
          <img src="https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=300&h=200&fit=crop" alt="Artisan Coffee" className="feature-image" />
          <h3>☕ Artisan Coffee</h3>
          <p>Handpicked beans roasted to perfection for your unique taste.</p>
        </div>
        <div className="card feature-card">
          <img src="https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?w=300&h=200&fit=crop" alt="Easy Reservations" className="feature-image" />
          <h3>📅 Easy Reservations</h3>
          <p>Book your table for any date and time at your favorite brew & co location.</p>
        </div>
        <div className="card feature-card">
          <img src="https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?w=300&h=200&fit=crop" alt="Pre-Order Treats" className="feature-image" />
          <h3>🥐 Pre-Order Treats</h3>
          <p>Order pastries and snacks ahead so they're fresh when you arrive.</p>
        </div>
        <div className="card feature-card">
          <img src="https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?w=300&h=200&fit=crop" alt="Secure Payments" className="feature-image" />
          <h3>💳 Secure Payments</h3>
          <p>Safe, seamless transactions with complete transparency.</p>
        </div>
      </section>

      <section className="info" id='how-it-works'>
        <div className="info-content">
          <h2>How brew & co Works</h2>
          <div className="steps-wrapper">
            <ol className="steps">
           <li>
  <div>
    <strong>Create Account:</strong>
    <span> Register and complete your profile</span>
  </div>
</li>

<li>
  <div>
    <strong>Browse Locations:</strong>
    <span> Explore our Brew & Co locations</span>
  </div>
</li>

<li>
  <div>
    <strong>Reserve Seat:</strong>
    <span> Pick your favorite spot and time</span>
  </div>
</li>

            </ol>
            <ol className="steps" style={{ counterReset: 'step 3' }}>
             <li>
  <div>
    <strong>Order Ahead:</strong>
    <span> Choose from our signature menu with Varieties</span>
  </div>
</li>



<li>
  <div>
    <strong>Relax & Enjoy:</strong>
    <span> Track your order and savor the moment</span>
  </div>
</li>
<li>
  <div>
    <strong>Pay Online:</strong>
    <span> Quick and secure payment</span>
  </div>
</li>

            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
