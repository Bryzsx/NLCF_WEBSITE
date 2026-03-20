import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import nlcfLogo from './assets/nlcf-logo.png';
import { Link, NavLink, Route, Routes } from 'react-router-dom';

type ContactPayload = {
  fullName: string;
  email: string;
  message: string;
};

type ChurchEvent = {
  id: string;
  title: string;
  schedule: string;
  location: string;
  description: string;
};

// Default API base:
// - In Vite dev (`npm run dev`), default to the local Django backend port.
// - In production builds, default to same-origin relative URLs.
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');

async function submitContact(payload: ContactPayload) {
  const response = await fetch(`${apiBaseUrl}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Unable to submit your message right now.');
  }

  return response.json();
}

function normalizeEvent(raw: unknown, index: number): ChurchEvent {
  const record = raw as Record<string, unknown>;
  const title = String(record?.title ?? record?.name ?? `Church Event ${index + 1}`);
  const schedule = String(
    record?.schedule ??
      record?.date ??
      record?.startDate ??
      'Schedule will be announced soon',
  );
  const location = String(record?.location ?? record?.venue ?? 'NLCF Main Campus');
  const description = String(
    record?.description ??
      record?.details ??
      'Join us for worship, fellowship, and discipleship.',
  );

  return {
    id: String(record?.id ?? index + 1),
    title,
    schedule,
    location,
    description,
  };
}

async function fetchEvents(): Promise<ChurchEvent[]> {
  const response = await fetch(`${apiBaseUrl}/events`);
  if (!response.ok) {
    throw new Error('Unable to fetch events.');
  }
  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map(normalizeEvent);
}

function ContactForm() {
  const [form, setForm] = useState<ContactPayload>({
    fullName: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>(
    'idle',
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    try {
      await submitContact(form);
      setStatus('success');
      setForm({ fullName: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={form.fullName}
          onChange={(event) =>
            setForm((current) => ({ ...current, fullName: event.target.value }))
          }
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
          required
        />
        <textarea
          placeholder="Your Message"
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          rows={5}
          required
        />
        <button className="button primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {status === 'success' && (
        <p className="feedback success">Your message was sent successfully.</p>
      )}
      {status === 'error' && (
        <p className="feedback error">
          Failed to submit. Check API and CORS settings on your NestJS backend.
        </p>
      )}
    </>
  );
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const navClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <header className="header">
      <div className="container nav">
        <Link className="logo-link" to="/">
          <img src={nlcfLogo} alt="NLCF logo" className="logo-image" />
        </Link>
        <div className="brand-copy">
          <p className="brand-wordmark">New Life In Christ Fellowship</p>
        </div>
        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={isMenuOpen ? 'open' : ''}>
          <div className="nav-group">
            <NavLink to="/" onClick={closeMenu} className={navClassName}>
              Home
            </NavLink>
          </div>

          <div className="nav-group">
            <NavLink to="/who-we-are" onClick={closeMenu} className={navClassName}>
              About Us
            </NavLink>
            <div className="dropdown">
              <Link to="/who-we-are" onClick={closeMenu}>
                New to NLCF
              </Link>
              <Link to="/contact" onClick={closeMenu}>
                Location
              </Link>
              <Link to="/who-we-are" onClick={closeMenu}>
                Meet Our Team
              </Link>
              <Link to="/who-we-are" onClick={closeMenu}>
                Our Beliefs
              </Link>
              <Link to="/contact" onClick={closeMenu}>
                Contact Us
              </Link>
            </div>
          </div>

          <div className="nav-group">
            <NavLink to="/connect" onClick={closeMenu} className={navClassName}>
              Next Steps
            </NavLink>
            <div className="dropdown">
              <Link to="/connect" onClick={closeMenu}>
                Salvation
              </Link>
              <Link to="/connect" onClick={closeMenu}>
                Baptism
              </Link>
              <Link to="/resources" onClick={closeMenu}>
                Bible Reading
              </Link>
              <Link to="/connect" onClick={closeMenu}>
                Life Groups
              </Link>
              <Link to="/missions" onClick={closeMenu}>
                Missions
              </Link>
            </div>
          </div>

          <div className="nav-group">
            <NavLink to="/ministries" onClick={closeMenu} className={navClassName}>
              Ministries
            </NavLink>
            <div className="dropdown">
              <Link to="/ministries/kids" onClick={closeMenu}>
                Kids
              </Link>
              <Link to="/ministries/youth" onClick={closeMenu}>
                Youth
              </Link>
              <Link to="/ministries/young-adults" onClick={closeMenu}>
                Young Adults
              </Link>
              <Link to="/ministries/worship" onClick={closeMenu}>
                Worship
              </Link>
            </div>
          </div>

          <div className="nav-group">
            <NavLink to="/watch" onClick={closeMenu} className={navClassName}>
              Media
            </NavLink>
            <div className="dropdown">
              <a
                href="https://www.facebook.com/nlcfofficial"
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
              >
                Live Stream
              </a>
              <a
                href="https://www.youtube.com/@NLCF-Main"
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
              >
                YouTube
              </a>
              <a
                href="https://www.instagram.com/nlcfofficial_/?igsh=N2FwdXN0c2ZpNmZ3"
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
              >
                Our Podcast
              </a>
            </div>
          </div>

          <div className="nav-group">
            <NavLink to="/events" onClick={closeMenu} className={navClassName}>
              Events
            </NavLink>
          </div>
          <div className="nav-group">
            <NavLink to="/give" onClick={closeMenu} className={navClassName}>
              Give
            </NavLink>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer footer-cal">
      <div className="container footer-cal-grid">
        <div className="footer-cal-brand">
          <img src={nlcfLogo} alt="" className="footer-cal-logo" width={56} height={56} />
          <p className="footer-cal-name">New Life In Christ Fellowship</p>
          <div className="footer-cal-social" aria-label="Social links">
            <a
              href="https://www.facebook.com/nlcfofficial"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="https://www.instagram.com/nlcfofficial_/?igsh=N2FwdXN0c2ZpNmZ3"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              in
            </a>
            <a
              href="https://www.youtube.com/@NLCF-Main"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
            >
              ▶
            </a>
          </div>
        </div>
        <div className="footer-cal-col">
          <span className="footer-cal-icon" aria-hidden>
            ✉
          </span>
          <h4>Email</h4>
          <a href="mailto:nlcfofficial@gmail.com">nlcfofficial@gmail.com</a>
        </div>
        <div className="footer-cal-col">
          <span className="footer-cal-icon" aria-hidden>
            ◎
          </span>
          <h4>Find Us</h4>
          <p>E.R. Ochoa Avenue, Butuan City, Philippines, 8600</p>
        </div>
        <div className="footer-cal-col">
          <span className="footer-cal-icon" aria-hidden>
            ☎
          </span>
          <h4>Call Us</h4>
          <a href="tel:+639171208415">0917 120 8415</a>
        </div>
      </div>
      <div className="container footer-cal-nav">
        <Link to="/who-we-are">New Here</Link>
        <Link to="/who-we-are">Our Beliefs</Link>
        <Link to="/connect">Ministries</Link>
        <Link to="/connect">Next Steps</Link>
        <Link to="/watch">Media</Link>
        <Link to="/events">Events</Link>
      </div>
      <div className="container footer-cal-bottom">
        <p>© {new Date().getFullYear()} New Life In Christ Fellowship</p>
      </div>
    </footer>
  );
}

function WelcomeMarquee() {
  const stacks = (
    <>
      <span className="welcome-stack outline">
        <span className="welcome-line">WELCOME</span>
        <span className="welcome-line">HOME</span>
      </span>
      <span className="welcome-stack fill">
        <span className="welcome-line">WELCOME</span>
        <span className="welcome-line">HOME</span>
      </span>
      <span className="welcome-stack outline">
        <span className="welcome-line">WELCOME</span>
        <span className="welcome-line">HOME</span>
      </span>
      <span className="welcome-stack fill">
        <span className="welcome-line">WELCOME</span>
        <span className="welcome-line">HOME</span>
      </span>
      <span className="welcome-stack outline">
        <span className="welcome-line">WELCOME</span>
        <span className="welcome-line">HOME</span>
      </span>
      <span className="welcome-stack fill">
        <span className="welcome-line">WELCOME</span>
        <span className="welcome-line">HOME</span>
      </span>
    </>
  );

  return (
    <section className="welcome-strip" aria-hidden="true">
      <div className="welcome-marquee">
        <div className="welcome-track">
          <div className="welcome-sequence">{stacks}</div>
          <div className="welcome-sequence" aria-hidden>
            {stacks}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const imgKids = '/ministry-kids.png';
  const imgYouth = '/ministry-youth.png';
  const imgYoungAdults = '/ministry-young-adults.png';
  const imgKnow = '/tile-know-us.png';
  const imgEvents = '/tile-events.png';
  const imgSteps = '/tile-next-steps.png';
  const imgMoreMinistries = '/more-ministries.png';
  const imgSermon1 = '/sermon-1.png';
  const imgSermon2 = '/sermon-2.png';
  const imgSermon3 = '/sermon-3.png';

  return (
    <>
      <section className="cal-hero cal-hero--home">
        <div className="hero-overlay cal-hero-overlay--dark" />
        <div className="container cal-hero-content">
          <h2 className="cal-hero-title">
            Worship.
            <br />
            Grow.
            <br />
            Serve.
          </h2>
          <div className="hero-actions">
            <Link to="/contact" className="button primary">
              Plan A Visit
            </Link>
            <a
              href="https://www.facebook.com/nlcfofficial"
              target="_blank"
              rel="noreferrer"
              className="button outline"
            >
              Watch Online <span className="btn-arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      <WelcomeMarquee />

      <section className="cal-triptych" aria-label="Quick links">
        <Link
          to="/who-we-are"
          className="cal-tile"
          style={{ backgroundImage: `url(${imgKnow})` }}
        >
          <div className="cal-tile-overlay" />
          <div className="cal-tile-content">
            <h3>Get To Know Us</h3>
            <span className="cal-tile-link">Learn More →</span>
          </div>
        </Link>
        <Link to="/events" className="cal-tile" style={{ backgroundImage: `url(${imgEvents})` }}>
          <div className="cal-tile-overlay" />
          <div className="cal-tile-content">
            <h3>Events</h3>
            <span className="cal-tile-link">Learn More →</span>
          </div>
        </Link>
        <Link
          to="/connect"
          className="cal-tile"
          style={{ backgroundImage: `url(${imgSteps})` }}
        >
          <div className="cal-tile-overlay" />
          <div className="cal-tile-content">
            <h3>Next Steps</h3>
            <span className="cal-tile-link">Learn More →</span>
          </div>
        </Link>
      </section>

      <section className="cal-mission-band">
        <div className="container cal-mission-inner">
          <h2 className="cal-mission-title">
            Helping people grow into wholehearted followers of Jesus
          </h2>
          <p className="cal-mission-sub">
            By supporting your journey of Know God, Grow Together, Discover
            Purpose, and Make a Difference.
          </p>
          <Link to="/who-we-are" className="button cal-btn-gold">
            What We Believe <span className="btn-arrow">→</span>
          </Link>
        </div>
      </section>

      <section className="section cal-connect-section">
        <div className="container cal-center">
          <h3 className="cal-section-heading">Get Connected</h3>
          <p className="cal-connect-lead">
            Explore our ministries and discover meaningful ways to serve, grow in
            faith, and build relationships.
          </p>
          <div className="cal-ministry-grid">
            <article
              className="cal-ministry-card"
              style={{ backgroundImage: `url(${imgKids})` }}
            >
              <div className="cal-ministry-card-inner">
                <h4>Kids</h4>
                <p>Birth - 5th Grade</p>
                <Link to="/ministries/kids" className="button cal-ministry-btn">
                  Learn More
                </Link>
              </div>
            </article>
            <article
              className="cal-ministry-card"
              style={{ backgroundImage: `url(${imgYouth})` }}
            >
              <div className="cal-ministry-card-inner">
                <h4>Youth</h4>
                <p>6th - 12th Grade</p>
                <Link to="/ministries/youth" className="button cal-ministry-btn">
                  Learn More
                </Link>
              </div>
            </article>
            <article
              className="cal-ministry-card"
              style={{ backgroundImage: `url(${imgYoungAdults})` }}
            >
              <div className="cal-ministry-card-inner">
                <h4>Young Adults</h4>
                <p>Age 18-25</p>
                <Link to="/ministries/young-adults" className="button cal-ministry-btn">
                  Learn More
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="cal-more-ministries">
        <div
          className="cal-more-ministries-bg"
          style={{ backgroundImage: `url(${imgMoreMinistries})` }}
        />
        <div className="container cal-more-ministries-content">
          <p className="cal-kicker-light">Wait, there&apos;s more!</p>
          <h2 className="cal-more-title">Looking For More Ministries?</h2>
          <p className="cal-more-copy">
            Discover new ways to connect, serve, and grow as you live out your faith
            alongside others at New Life In Christ Fellowship.
          </p>
          <Link to="/connect" className="button outline cal-ghost-light">
            View All Ministries →
          </Link>
        </div>
      </section>

      <section className="cal-home-events">
        <div className="container cal-center">
          <p className="section-label cal-label-dark">Latest Happenings</p>
          <h3 className="cal-section-heading">Upcoming Events</h3>
          <p className="cal-events-intro">
            Stay engaged and grow in community by joining upcoming events designed to
            inspire, connect, and strengthen your faith.
          </p>
          <div className="cal-event-cards">
            <article className="cal-event-card">
              <div
                className="cal-event-card-top cal-event-top-a"
                style={{ backgroundImage: `url(/home-app-bg.png)` }}
              >
                <strong>NLCF App</strong>
                <span>Stay connected on the go</span>
              </div>
              <div className="cal-event-card-body">
                <p>Download our church app for updates and resources.</p>
              </div>
            </article>
            <article className="cal-event-card">
              <div
                className="cal-event-card-top cal-event-top-b"
                style={{ backgroundImage: `url(/home-midweek-bg.png)` }}
              >
                <strong>Midweek</strong>
                <span>Prayer &amp; Worship • Wednesdays 7PM</span>
              </div>
              <div className="cal-event-card-body">
                <p>Midweek: Prayer &amp; Worship</p>
              </div>
            </article>
            <article className="cal-event-card">
              <div
                className="cal-event-card-top cal-event-top-c"
                style={{ backgroundImage: `url(/home-sunday-bg.png)` }}
              >
                <strong>Join Us This Sunday</strong>
                <span>9:00 AM &amp; 4:00 PM</span>
              </div>
              <div className="cal-event-card-body">
                <p>Sunday Service Times</p>
              </div>
            </article>
          </div>
          <Link to="/events" className="cal-view-events">
            View More Events →
          </Link>
        </div>
      </section>

      <section className="cal-sermons cal-sermons--full">
        <div className="container cal-sermons-row">
          <div className="cal-sermons-copy">
            <p className="section-label cal-label-on-blue">Watch &amp; Listen</p>
            <h3 className="cal-sermons-heading">Latest Sermons</h3>
            <p className="cal-sermons-text">
              Watch or listen to our most recent sermons to grow in faith, be
              encouraged, and apply God&apos;s Word to your life.
            </p>
            <Link to="/watch" className="button cal-btn-white">
              Latest Sermons <span className="btn-arrow">→</span>
            </Link>
          </div>
          <div className="cal-sermon-gallery">
            <img src={imgSermon1} alt="" className="cal-sermon-img" />
            <img src={imgSermon2} alt="" className="cal-sermon-img" />
            <img src={imgSermon3} alt="" className="cal-sermon-img" />
          </div>
        </div>
      </section>
    </>
  );
}

function SimplePage(props: { label: string; title: string; body: string }) {
  const { label, title, body } = props;
  return (
    <section className="section page-section">
      <div className="container narrow">
        <p className="section-label">{label}</p>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="section page-section">
      <div className="container narrow">
        <p className="section-label">Contact</p>
        <h3>Contact Us</h3>
        <p>Send us a message. This form posts directly to your NestJS API.</p>
        <ContactForm />
      </div>
    </section>
  );
}

function MediaPage() {
  const mediaHero = '/media-hero.png';
  const cardLive = '/media-live-stream.png';
  const cardYouTube = '/media-youtube.png';
  const cardPodcast = '/media-podcast.png';
  const cardApp = '/media-app.png';
  const cardRightNow = '/media-rightnow.png';

  return (
    <>
      <section className="media-hero" style={{ backgroundImage: `url(${mediaHero})` }}>
        <div className="media-hero-overlay" />
        <div className="container media-hero-content">
          <h2>Media</h2>
        </div>
      </section>

      <section className="section media-section">
        <div className="container cal-center">
          <p className="section-label">Get Connected</p>
          <h3 className="cal-section-heading">Explore Our Media</h3>
          <p className="cal-events-intro">
            Dive into our collection of sermons, teaching series, and videos to inspire
            your faith, grow in understanding, and stay connected with our church
            community.
          </p>

          <div className="media-grid">
            <a
              className="media-card"
              href="https://www.facebook.com/nlcfofficial"
              target="_blank"
              rel="noreferrer"
              style={{ backgroundImage: `url(${cardLive})` }}
            >
              <div className="media-card-overlay" />
              <div className="media-card-content">
                <h4>Live Stream</h4>
                <span className="button cal-ministry-btn">Learn More</span>
              </div>
            </a>

            <a
              className="media-card"
              href="https://www.youtube.com/@NLCF-Main"
              target="_blank"
              rel="noreferrer"
              style={{ backgroundImage: `url(${cardYouTube})` }}
            >
              <div className="media-card-overlay" />
              <div className="media-card-content">
                <h4>YouTube</h4>
                <span className="button cal-ministry-btn">Learn More</span>
              </div>
            </a>

            <a
              className="media-card"
              href="https://www.instagram.com/nlcfofficial_/?igsh=N2FwdXN0c2ZpNmZ3"
              target="_blank"
              rel="noreferrer"
              style={{ backgroundImage: `url(${cardPodcast})` }}
            >
              <div className="media-card-overlay" />
              <div className="media-card-content">
                <h4>Our Podcast</h4>
                <span className="button cal-ministry-btn">Learn More</span>
              </div>
            </a>

            <a className="media-card" href="#" style={{ backgroundImage: `url(${cardApp})` }}>
              <div className="media-card-overlay" />
              <div className="media-card-content">
                <h4>Our App</h4>
                <span className="button cal-ministry-btn">Learn More</span>
              </div>
            </a>

            <a className="media-card" href="#" style={{ backgroundImage: `url(${cardRightNow})` }}>
              <div className="media-card-overlay" />
              <div className="media-card-content">
                <h4>RightNow Media</h4>
                <span className="button cal-ministry-btn">Learn More</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

type MinistryCard = {
  key: 'kids' | 'youth' | 'young-adults' | 'worship';
  title: string;
  subtitle: string;
  imageUrl: string;
  route: string;
  detailTitle: string;
  detailBody: string;
};

function MinistriesPage(props: { selected?: MinistryCard['key'] }) {
  const ministryCards: MinistryCard[] = [
    {
      key: 'kids',
      title: 'Kids',
      subtitle: 'Birth - 5th Grade',
      imageUrl: '/ministry-kids.png',
      route: '/ministries/kids',
      detailTitle: 'Kids Ministry',
      detailBody:
        'A safe and joyful environment where children learn biblical truth, worship together, and build a strong foundation in Christ.',
    },
    {
      key: 'youth',
      title: 'Youth',
      subtitle: '6th - 12th Grade',
      imageUrl: '/ministry-youth.png',
      route: '/ministries/youth',
      detailTitle: 'Youth Ministry',
      detailBody:
        'A community for students to grow in faith, build godly friendships, and discover their purpose through discipleship.',
    },
    {
      key: 'young-adults',
      title: 'Young Adults',
      subtitle: 'Age 18-25',
      imageUrl: '/ministry-young-adults.png',
      route: '/ministries/young-adults',
      detailTitle: 'Young Adults',
      detailBody:
        'Helping young adults navigate life with biblical wisdom through fellowship, mentoring, and Christ-centered teaching.',
    },
    // `Worship` can be added once you have the matching image asset.
    {
      key: 'worship',
      title: 'Worship',
      subtitle: 'Music & Production',
      imageUrl: '/media-youtube.png',
      route: '/ministries/worship',
      detailTitle: 'Worship Ministry',
      detailBody:
        'Serving the church through music, production, and creative arts to lead people into heartfelt worship of God.',
    },
  ];

  const selectedCard =
    props.selected && ministryCards.find((c) => c.key === props.selected);

  return (
    <>
      <section
        className="events-hero"
        style={{ backgroundImage: `url(/hero-home.png)` }}
      >
        <div className="events-hero-overlay" />
        <div className="container events-hero-content">
          <h2>Ministries</h2>
        </div>
      </section>

      <section className="section events-content">
        <div className="container narrow cal-center">
          <p className="section-label">OUR MINISTRIES</p>
          <h3 className="cal-section-heading">There's a Place For You!</h3>
          <p>
            No matter who you are or where you’re coming from, there’s a place for
            you to belong, grow, and make an impact in our community.
          </p>

          <div className="cal-ministry-grid" style={{ marginTop: '1.8rem' }}>
            {ministryCards.map((card) => (
              <article
                key={card.key}
                className="cal-ministry-card"
                style={{ backgroundImage: `url(${card.imageUrl})` }}
              >
                <div className="cal-ministry-card-inner">
                  <h4>{card.title}</h4>
                  <p>{card.subtitle}</p>
                  <Link to={card.route} className="button cal-ministry-btn">
                    Learn More
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {selectedCard && (
            <div style={{ marginTop: '2.2rem' }}>
              <SimplePage
                label="Ministries"
                title={selectedCard.detailTitle}
                body={selectedCard.detailBody}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function MinistryDetailHero(props: { title: string; imageUrl: string }) {
  return (
    <section
      className="ministry-detail-hero"
      style={{ backgroundImage: `url(${props.imageUrl})` }}
    >
      <div className="ministry-detail-hero-overlay" />
      <div className="container ministry-detail-hero-content">
        <h2>{props.title}</h2>
      </div>
    </section>
  );
}

function MinistryDetailRow(props: {
  title: string;
  body: string;
  imageUrl: string;
  reverse?: boolean;
}) {
  const rowClass = props.reverse
    ? 'ministry-detail-row ministry-detail-row--reverse'
    : 'ministry-detail-row';

  return (
    <div className={rowClass}>
      <div className="ministry-detail-image">
        <img src={props.imageUrl} alt="" />
      </div>
      <div className="ministry-detail-text">
        <h4>{props.title}</h4>
        <p>{props.body}</p>
      </div>
    </div>
  );
}

function KidsMinistryPage() {
  const heroImg = '/ministry-kids.png';
  const nurseryImg = '/ministry-kids.png';
  const preschoolImg = '/ministry-kids.png';
  const elementaryImg = '/ministry-kids.png';
  const firstVisitImg = '/hero-home.png';
  const posterImg = '/home-sunday-bg.png';

  return (
    <>
      <MinistryDetailHero title="Kids" imageUrl={heroImg} />

      <section className="section ministry-detail-section">
        <div className="container narrow">
          <p className="section-label">WELCOME TO OUR KIDS MINISTRY</p>
          <h3 className="cal-section-heading">A Safe Space to Grow</h3>
          <p className="cal-events-intro" style={{ marginTop: '0.5rem' }}>
            We’re excited to partner with you as your child learns who God is
            through age-appropriate teaching, loving leaders, and fun activities.
          </p>

          <div className="ministry-first-visit">
            <div className="ministry-first-visit-inner">
              <h3>Your First Visit</h3>
              <p>
                From check-in to classroom time, we’ll help everything feel
                simple, safe, and welcoming. Bring your family and we’ll take
                care of the rest.
              </p>
              <img src={firstVisitImg} alt="" />
            </div>
          </div>

          <div className="ministry-detail-block">
            <MinistryDetailRow
              title="Nursery"
              body="For babies and toddlers: a calm, caring environment with patient leaders who support each child with gentle routines and age-appropriate play."
              imageUrl={nurseryImg}
              reverse={false}
            />
            <MinistryDetailRow
              title="Preschool"
              body="For young kids ready to learn: we focus on Bible stories, worship, and hands-on activities that help them understand God’s love in a simple way."
              imageUrl={preschoolImg}
              reverse
            />
            <MinistryDetailRow
              title="Elementary"
              body="For children building strong faith: we guide them through stories, discussion, and meaningful play so they grow in confidence and character."
              imageUrl={elementaryImg}
              reverse={false}
            />
          </div>

          <section className="ministry-upcoming">
            <div className="container cal-center">
              <p className="section-label">Upcoming Events</p>
              <h3 className="cal-section-heading">Family Moments</h3>
              <div className="ministry-poster">
                <img src={posterImg} alt="" />
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}

function EventsPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      try {
        const response = await fetchEvents();
        if (!active) {
          return;
        }
        setEvents(response);
        setStatus('ready');
      } catch {
        if (!active) {
          return;
        }
        setStatus('error');
      }
    };

    loadEvents();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="events-hero">
        <div className="events-hero-overlay" />
        <div className="container events-hero-content">
          <h2>Events</h2>
        </div>
      </section>
      <section className="section events-content">
        <div className="container narrow cal-center">
          <p className="section-label">Latest Happenings</p>
          <h3>Upcoming Events</h3>
          <p>Stay informed and get involved by checking out all upcoming church events.</p>

          {status === 'loading' && <p className="status-message">Loading events...</p>}
          {status === 'error' && (
            <p className="status-message error">
              Could not load events from backend. Start your NestJS API and create `GET /events`.
            </p>
          )}

          {status === 'ready' && events.length === 0 && (
            <p className="status-message">No events available yet. Add one from your backend.</p>
          )}

          {events.length > 0 && (
            <div className="cards">
              {events.map((event) => (
                <article className="card" key={event.id}>
                  <h4>{event.title}</h4>
                  <p>
                    <strong>{event.schedule}</strong>
                  </p>
                  <p>{event.location}</p>
                  <p>{event.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function App() {

  return (
    <div className="page">
      <Header />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/who-we-are"
            element={
              <SimplePage
                label="Who We Are"
                title="A Church Family Centered on Christ"
                body="We are a Bible-believing church committed to worship, discipleship, and mission. Our heart is to lead people into a growing relationship with Jesus and help families live out God's purpose together."
              />
            }
          />
          <Route
            path="/watch"
            element={<MediaPage />}
          />
          <Route
            path="/connect"
            element={
              <SimplePage
                label="Connect"
                title="Belong to a Discipleship Community"
                body="Grow through prayer, Bible study, and meaningful fellowship. We can connect this page to your NestJS backend for dynamic community groups and schedules."
              />
            }
          />
          <Route path="/ministries" element={<MinistriesPage />} />
          <Route
            path="/ministries/kids"
            element={
              <KidsMinistryPage />
            }
          />
          <Route
            path="/ministries/youth"
            element={
              <MinistriesPage selected="youth" />
            }
          />
          <Route
            path="/ministries/young-adults"
            element={
              <MinistriesPage selected="young-adults" />
            }
          />
          <Route
            path="/ministries/worship"
            element={
              <MinistriesPage selected="worship" />
            }
          />
          <Route
            path="/missions"
            element={
              <SimplePage
                label="Missions"
                title="Pray, Give, and Go"
                body="Take part in local and global outreach initiatives. This section can later pull mission stories and campaigns from backend APIs."
              />
            }
          />
          <Route
            path="/events"
            element={<EventsPage />}
          />
          <Route
            path="/resources"
            element={
              <SimplePage
                label="Resources"
                title="Grow with Biblical Materials"
                body="Access sermon notes, study guides, and growth materials for personal and group discipleship."
              />
            }
          />
          <Route
            path="/media/live-stream"
            element={
              <SimplePage
                label="Media"
                title="Live Stream"
                body="Join our live online worship services and sermons every Sunday from anywhere in the world."
              />
            }
          />
          <Route
            path="/media/youtube"
            element={
              <SimplePage
                label="Media"
                title="YouTube"
                body="Watch sermon highlights, full messages, and discipleship content on our official YouTube channel."
              />
            }
          />
          <Route
            path="/media/podcast"
            element={
              <SimplePage
                label="Media"
                title="Our Podcast"
                body="Listen to encouraging biblical messages on the go through our church podcast episodes."
              />
            }
          />
          <Route
            path="/give"
            element={
              <SimplePage
                label="Give"
                title="Support the Ministry"
                body="Partner with us through faithful giving. You can add your official payment channels and stewardship details on this page."
              />
            }
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
