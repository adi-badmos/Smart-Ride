import { Link } from 'react-router-dom';
import './LandingPage.css';

const features = [
  {
    icon: '🚗',
    title: 'Smart Subscriptions',
    desc: 'Choose a plan that fits your commute. Daily, weekly, or monthly — always at the best price.',
  },
  {
    icon: '📍',
    title: 'Live Route Tracking',
    desc: 'Track your ride in real-time on optimized routes. Never wonder where your cab is again.',
  },
  {
    icon: '🔒',
    title: 'Safe & Verified Drivers',
    desc: 'Every driver is background-checked and verified. Travel with complete peace of mind.',
  },
  {
    icon: '💳',
    title: 'Seamless Payments',
    desc: 'Integrated payment gateway for quick, secure checkouts. View invoices anytime.',
  },
  {
    icon: '🛠️',
    title: 'Support & Complaints',
    desc: 'Raise concerns directly through the app. Our team responds fast so you stay happy.',
  },
  {
    icon: '📊',
    title: 'Earnings Dashboard',
    desc: 'Drivers get a transparent earnings breakdown with payout history at a glance.',
  },
];



const steps = [
  { num: '01', title: 'Create an Account', desc: 'Sign up in under 30 seconds — no credit card required.' },
  { num: '02', title: 'Pick Your Plan', desc: 'Browse route-based subscription plans that fit your schedule.' },
  { num: '03', title: 'Ride & Relax', desc: 'Your cab arrives on time, every time. Sit back and enjoy the ride.' },
];

export default function LandingPage() {
  return (
    <div className="lp-root">
      {/* ─── Navbar ─── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <span className="lp-logo-icon">⚡</span>
            <span className="lp-logo-text">SmartRide</span>
          </div>
          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#how-it-works" className="lp-nav-link">How It Works</a>

            <Link to="/login" className="lp-btn-outline">Log In</Link>
            <Link to="/register" className="lp-btn-primary">Sign Up Free</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="lp-hero">
        <div className="lp-hero-bg-overlay" />
        <div className="lp-hero-content">
          <h1 className="lp-hero-title">
            Your Daily Commute,
            <br />
            <span className="lp-hero-gradient">Reimagined.</span>
          </h1>
          <p className="lp-hero-sub">
            Subscribe to smart cab routes, track rides in real-time, and ride with confidence.
            Built for modern professionals who value time and comfort.
          </p>
          <div className="lp-hero-cta">
            <Link to="/register" className="lp-btn-primary lp-btn-lg">
              Get Started — It's Free
              <span className="lp-btn-arrow">→</span>
            </Link>
            <Link to="/login" className="lp-btn-ghost lp-btn-lg">
              Already a member? Log In
            </Link>
          </div>
        </div>


      </section>



      {/* ─── Features ─── */}
      <section id="features" className="lp-features">
        <div className="lp-section-header">
          <div className="lp-section-badge">Everything You Need</div>
          <h2 className="lp-section-title">Why Riders Choose SmartRide</h2>
          <p className="lp-section-sub">
            From subscription plans to real-time tracking, we've thought of everything.
          </p>
        </div>
        <div className="lp-features-grid">
          {features.map((f) => (
            <div className="lp-feature-card" key={f.title}>
              <div className="lp-feature-icon">{f.icon}</div>
              <h3 className="lp-feature-title">{f.title}</h3>
              <p className="lp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="lp-how">
        <div className="lp-section-header">
          <div className="lp-section-badge">Simple Process</div>
          <h2 className="lp-section-title">Get Moving in 3 Easy Steps</h2>
        </div>
        <div className="lp-steps">
          {steps.map((step, i) => (
            <div className="lp-step" key={step.num}>
              <div className="lp-step-num">{step.num}</div>
              <div className="lp-step-body">
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
              {i < steps.length - 1 && <div className="lp-step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="lp-cta-section">
        <div className="lp-cta-glow" />
        <div className="lp-cta-content">
          <h2 className="lp-cta-title">Ready to Transform Your Commute?</h2>
          <p className="lp-cta-sub">
            Join thousands of smart commuters. No hidden fees, no hassle.
          </p>
          <div className="lp-hero-cta">
            <Link to="/register" className="lp-btn-primary lp-btn-lg">
              Create Free Account
              <span className="lp-btn-arrow">→</span>
            </Link>
            <Link to="/login" className="lp-btn-ghost lp-btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-logo">
            <span className="lp-logo-icon">⚡</span>
            <span className="lp-logo-text">SmartRide</span>
          </div>
          <p className="lp-footer-copy">© {new Date().getFullYear()} SmartRide. All rights reserved.</p>
          <div className="lp-footer-links">
            <Link to="/login" className="lp-footer-link">Login</Link>
            <Link to="/register" className="lp-footer-link">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
