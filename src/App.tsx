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

/** Display name for the NLCF youth ministry (used on /ministries/youth and cards). */
const YOUTH_MINISTRY_NAME = 'Newlife Youth Unlimited';

/** Display name for the young adults ministry (Fortress). */
const FORTRESS_YOUNG_ADULTS_NAME = 'Fortress (Young Adults)';

const YOUTH_FACEBOOK_URL = 'https://www.facebook.com/newlifeyouthunlimited';
const YOUTH_INSTAGRAM_URL = 'https://www.instagram.com/newlifeyouthunlimited';

/** All youth ministry photos in `public/youth/` (youth-01 … youth-10). */
const YOUTH_PHOTO_GALLERY: { path: string; label: string }[] = [
  { path: '/youth/youth-01.png', label: 'Baptism celebration' },
  { path: '/youth/youth-02.png', label: 'Baptism in the pool' },
  { path: '/youth/youth-03.png', label: 'Teaching and discussion' },
  { path: '/youth/youth-04.png', label: 'Group gathering at Love Con' },
  { path: '/youth/youth-05.png', label: 'Youth worship night' },
  { path: '/youth/youth-06.png', label: 'Youth ministry moment' },
  { path: '/youth/youth-07.png', label: 'Youth community' },
  { path: '/youth/youth-08.png', label: 'Praying together' },
  { path: '/youth/youth-09.png', label: 'Youth leaders' },
  { path: '/youth/youth-10.png', label: 'Pastor Leo' },
];

const YOUTH_HERO_IMAGE = YOUTH_PHOTO_GALLERY[3].path;
const YOUTH_WELCOME_SIDE_IMAGE = YOUTH_PHOTO_GALLERY[7].path;

/**
 * Full-bleed row below Youth Konek service block (youth-10, youth-05, youth-06, no gutters).
 */
const YOUTH_SERVICE_PHOTO_ROW: { path: string; label: string }[] = [
  { path: '/youth/youth-10.png', label: 'Teaching and leadership' },
  { path: '/youth/youth-05.png', label: 'Youth worship night' },
  { path: '/youth/youth-06.png', label: 'Youth ministry' },
];

/** Hero / welcome / card imagery for Fortress (Young Adults) — files live in `public/fortress/`. */
/** Wide stage group photo — full-bleed hero on /ministries/young-adults */
const FORTRESS_HERO_IMAGE = '/fortress/fortress-hero-full.png';
const FORTRESS_WELCOME_SIDE_IMAGE = '/fortress/fortress-welcome-portrait.png';

/** Fortress young adults Facebook group */
const FORTRESS_FACEBOOK_URL = 'https://www.facebook.com/share/g/1C9KcFsL5S/';

/**
 * Full-bleed row below the “Get Connected” block (same layout as Youth).
 */
const FORTRESS_SERVICE_PHOTO_ROW: { path: string; label: string }[] = [
  { path: '/fortress/fortress-fellowship-meal.png', label: 'Fellowship and shared meals' },
  { path: '/fortress/fortress-group-night.png', label: 'Community gatherings' },
  { path: '/fortress/fortress-worship.png', label: 'Worship together' },
];

/** Worship ministry — Calvary-style layout using uploaded reference images. */
const WORSHIP_HERO_IMAGE = '/worship/worship-new-hero.png';
const WORSHIP_INTRO_SIDE_IMAGE = '/worship/worship-new-split.png';
const WORSHIP_GALLERY_ROW: { path: string; label: string }[] = [
  { path: '/worship/worship-new-gallery-1.png', label: 'Worship moment' },
  { path: '/worship/worship-new-gallery-2.png', label: 'Worship moment' },
  { path: '/worship/worship-new-gallery-3.png', label: 'Worship moment' },
];

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
    <header className={`header${isMenuOpen ? ' header--menu-open' : ''}`}>
      <div className="container nav">
        <Link className="logo-link" to="/">
          <img src={nlcfLogo} alt="NLCF logo" className="logo-image" />
        </Link>
        <div className="brand-copy">
          <p className="brand-wordmark">New Life In Christ Fellowship</p>
        </div>
        <div className="nav-secondary">
          <Link to="/give" className="button nav-give-btn">
            Give
          </Link>
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
        </div>
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
                {FORTRESS_YOUNG_ADULTS_NAME}
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
  const imgYouth = YOUTH_HERO_IMAGE;
  const imgYoungAdults = FORTRESS_HERO_IMAGE;
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
                <h4>{YOUTH_MINISTRY_NAME}</h4>
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
                <h4>{FORTRESS_YOUNG_ADULTS_NAME}</h4>
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
      imageUrl: '/ministry-kids.png',
      route: '/ministries/kids',
      detailTitle: 'Kids Ministry',
      detailBody:
        'A safe and joyful environment where children learn biblical truth, worship together, and build a strong foundation in Christ.',
    },
    {
      key: 'youth',
      title: 'Newlife Youth Unlimited',
      imageUrl: YOUTH_HERO_IMAGE,
      route: '/ministries/youth',
      detailTitle: 'Newlife Youth Unlimited',
      detailBody:
        'A community for students to grow in faith, build godly friendships, and discover their purpose through discipleship.',
    },
    {
      key: 'young-adults',
      title: FORTRESS_YOUNG_ADULTS_NAME,
      imageUrl: FORTRESS_HERO_IMAGE,
      route: '/ministries/young-adults',
      detailTitle: FORTRESS_YOUNG_ADULTS_NAME,
      detailBody:
        'Fortress (Young Adults) helps college-aged and young adults grow in faith through Life Groups, meet ups, events, and special services throughout the year—walking with biblical wisdom, mentoring, and Christ-centered community.',
    },
    {
      key: 'worship',
      title: 'Worship',
      imageUrl: WORSHIP_HERO_IMAGE,
      route: '/ministries/worship',
      detailTitle: 'Worship Ministry',
      detailBody:
        'Our worship teams help the church exalt Jesus in spirit and truth—through music, vocals, audio, and creative arts—so people can encounter God together.',
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

function MinistryDetailHero(props: {
  title: string;
  imageUrl: string;
  variant?: 'bottom' | 'center';
  /** Small line above the title (e.g. “Youth”) */
  kicker?: string;
  /** Use tighter typography for longer ministry names */
  brandLayout?: boolean;
  /** Tall full-width hero (e.g. Fortress) with stronger overlay */
  fullView?: boolean;
}) {
  const alignClass =
    props.variant === 'center'
      ? 'ministry-detail-hero-content ministry-detail-hero-content--center'
      : 'ministry-detail-hero-content';
  const sectionClass = [
    'ministry-detail-hero',
    'ministry-detail-hero--kids',
    props.brandLayout ? 'ministry-detail-hero--brand' : '',
    props.fullView ? 'ministry-detail-hero--fortress-full' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const overlayClass = props.fullView
    ? 'ministry-detail-hero-overlay ministry-detail-hero-overlay--strong'
    : 'ministry-detail-hero-overlay';
  return (
    <section className={sectionClass} style={{ backgroundImage: `url(${props.imageUrl})` }}>
      <div className={overlayClass} />
      <div className={`container ${alignClass}`}>
        {props.kicker ? (
          <p className="ministry-detail-hero-kicker">{props.kicker}</p>
        ) : null}
        <h2>{props.title}</h2>
      </div>
    </section>
  );
}

function MinistryDetailRow(props: {
  title: string;
  paragraphs: string[];
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
        {props.paragraphs.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>
    </div>
  );
}

function NextgenMinistryBanner(props: { tone?: 'black' | 'blue'; phrase?: string }) {
  const tone = props.tone ?? 'black';
  const phrase: string = props.phrase ?? 'NEXTGEN MINISTRY';
  const items = Array.from({ length: 14 }, (_, i) => (
    <span
      key={i}
      className={i % 2 === 0 ? 'kids-nextgen-word outline' : 'kids-nextgen-word solid'}
    >
      {phrase}
    </span>
  ));
  const track = (suffix: string) => (
    <div className="kids-nextgen-track" key={suffix} aria-hidden={suffix === 'b'}>
      {items}
    </div>
  );
  const dense = phrase.length > 16;
  const barClass = [
    tone === 'blue' ? 'kids-nextgen-banner kids-nextgen-banner--blue' : 'kids-nextgen-banner',
    dense ? 'kids-nextgen-banner--dense' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={barClass} aria-hidden="true">
      <div className="kids-nextgen-marquee">
        {track('a')}
        {track('b')}
      </div>
    </div>
  );
}

function KidsMinistryPage() {
  const heroImg = '/kids/kids-01.png';
  const gallery1 = '/kids/kids-02.png';
  const gallery2 = '/kids/kids-03.png';
  const gallery3 = '/kids/kids-04.png';
  const nurseryImg = '/kids/kids-05.png';
  const preschoolImg = '/kids/kids-06.png';
  const elementaryImg = '/kids/kids-07.png';
  const posterImg = '/kids/kids-08.png';

  return (
    <>
      <MinistryDetailHero title="Kids" imageUrl={heroImg} variant="center" />

      <section className="kids-welcome">
        <div className="container narrow cal-center">
          <h3 className="kids-welcome-title">Welcome to NLCF Kids</h3>
          <p className="kids-welcome-copy">
            We’re committed to a clean, safe, fun, and well-staffed place where
            children can experience God’s love and feel at home.
          </p>
          <p className="kids-welcome-copy">
            Our hope is that every child grows a real relationship with Jesus,
            builds a biblical foundation, connects with friends and leaders, and
            loves coming to church.
          </p>
        </div>
      </section>

      <div className="kids-banner-gallery">
        <NextgenMinistryBanner tone="black" />
        <div className="kids-photo-strip">
          <div className="kids-photo-frame">
            <img src={gallery1} alt="" />
          </div>
          <div className="kids-photo-frame">
            <img src={gallery2} alt="" />
          </div>
          <div className="kids-photo-frame">
            <img src={gallery3} alt="" />
          </div>
        </div>
      </div>

      <section className="kids-first-visit">
        <div className="kids-first-visit-inner">
          <h3>Your First Visit</h3>
          <p>
            From infants through fifth grade, our team wants your family to have
            a smooth, excellent experience from the moment you arrive.
          </p>
          <p>
            When you get here, we’ll walk you to the kids area. At first-time
            check-in, you can share your family details, any allergies, and the
            best way to reach you during the service.
          </p>
          <p>
            Parents and children receive matching security stickers. If we need
            you, we’ll contact you by text. Please keep your sticker handy—it’s
            required when you pick up your child after service.
          </p>
        </div>
      </section>

      <section className="section ministry-detail-section">
        <div className="container">
          <div className="ministry-detail-block">
            <MinistryDetailRow
              title="Nursery"
              paragraphs={[
                'Your baby is cared for by a loving, well-staffed team in rooms prepared with age-appropriate toys that are cleaned between services.',
                'We know little ones have unique rhythms. A simple form lets you share feeding, sleep, and changing preferences, and our team prays for your child each week.',
              ]}
              imageUrl={nurseryImg}
              reverse={false}
            />
            <MinistryDetailRow
              title="Preschool"
              paragraphs={[
                'Preschoolers engage more each week through Bible stories, crafts, and songs that teach truth in a way they can understand and enjoy.',
                'They also begin friendships with peers and consistent leaders who cheer them on in faith.',
              ]}
              imageUrl={preschoolImg}
              reverse
            />
            <MinistryDetailRow
              title="Elementary"
              paragraphs={[
                'On weekends, kids experience worship and teaching designed for their age. Midweek often emphasizes small groups so the same leaders walk alongside them.',
                'Together they explore Scripture, memorize verses, build friendship, and learn what it means to follow Jesus in everyday life.',
              ]}
              imageUrl={elementaryImg}
              reverse={false}
            />
          </div>
        </div>
      </section>

      <section className="ministry-upcoming ministry-upcoming--kids">
        <div className="container cal-center">
          <p className="section-label">Upcoming Events</p>
          <h3 className="cal-section-heading">Don’t Miss What’s Next</h3>
          <p className="ministry-upcoming-lead">
            Stay connected—check out upcoming kids events built for fun, faith,
            and friendship.
          </p>
          <article className="kids-event-card">
            <div className="kids-event-poster">
              <img src={posterImg} alt="" />
            </div>
            <div className="kids-event-body">
              <h4>Spring Family Party</h4>
              <p className="kids-event-date">
                <span className="kids-event-date-icon" aria-hidden>
                  ◷
                </span>
                April 1, 2026
              </p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

function YouthMinistryPage() {
  const [youthEvents, setYouthEvents] = useState<ChurchEvent[]>([]);
  const [youthEventsStatus, setYouthEventsStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetchEvents();
        if (!active) {
          return;
        }
        setYouthEvents(response);
        setYouthEventsStatus('ready');
      } catch {
        if (!active) {
          return;
        }
        setYouthEventsStatus('error');
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <MinistryDetailHero
        title={YOUTH_MINISTRY_NAME}
        imageUrl={YOUTH_HERO_IMAGE}
        variant="center"
        brandLayout
      />

      <section className="youth-welcome">
        <div className="container youth-welcome-inner">
          <div className="youth-welcome-copy">
            <h3 className="youth-welcome-title">Welcome to {YOUTH_MINISTRY_NAME}</h3>
            <p>
              {YOUTH_MINISTRY_NAME} is a community for students in 6th–12th grade to grow in
              faith, build real friendships, and discover purpose through worship, teaching,
              and small groups.
            </p>
            <p>
              Follow us for updates, highlights, and ways to stay connected during the week—we
              can’t wait to see you on Wednesday nights and at special events.
            </p>
            <div className="youth-social-row">
              <a
                className="button cal-btn-gold youth-social-btn"
                href={YOUTH_FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a
                className="button cal-btn-gold youth-social-btn"
                href={YOUTH_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </div>
          </div>
          <div className="youth-welcome-photo">
            <img
              src={YOUTH_WELCOME_SIDE_IMAGE}
              alt={`${YOUTH_MINISTRY_NAME} — ${YOUTH_PHOTO_GALLERY[7].label}`}
            />
          </div>
        </div>
      </section>

      <NextgenMinistryBanner
        tone="blue"
        phrase={YOUTH_MINISTRY_NAME.toUpperCase()}
      />

      <section className="youth-service">
        <div className="container cal-center">
          <p className="youth-service-label">Youth Konek</p>
          <h3 className="youth-service-heading">Every Sunday 3:00–6:00pm</h3>
          <p className="youth-service-note">Lobby doors open at 2:30pm for check in.</p>
        </div>
      </section>

      <section
        className="youth-gallery-wrap youth-gallery-wrap--flush-ui"
        aria-label={`${YOUTH_MINISTRY_NAME} photo gallery`}
      >
        <div
          className="youth-gallery-fullbleed"
          aria-label={`${YOUTH_MINISTRY_NAME} photo strip`}
        >
          <div className="youth-photo-strip youth-photo-strip--flush">
            {YOUTH_SERVICE_PHOTO_ROW.map((photo) => (
              <div className="youth-photo-cell" key={photo.path}>
                <div className="youth-photo-frame">
                  <img
                    src={photo.path}
                    alt={`${YOUTH_MINISTRY_NAME} — ${photo.label}`}
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ministry-upcoming ministry-upcoming--youth">
        <div className="container cal-center">
          <h3 className="youth-upcoming-title">Upcoming Events</h3>
          <p className="ministry-upcoming-lead ministry-upcoming-lead--youth">
            Discover what&apos;s happening next—join our upcoming youth events to grow in faith,
            build friendships, and have an unforgettable time!
          </p>

          {youthEventsStatus === 'loading' && (
            <p className="youth-events-status">Loading events...</p>
          )}
          {youthEventsStatus === 'error' && (
            <p className="youth-events-status">Could not load events right now.</p>
          )}
          {youthEventsStatus === 'ready' && youthEvents.length === 0 && (
            <p className="youth-events-status">No Events Found</p>
          )}

          {youthEvents.length > 0 && (
            <div className="youth-events-grid">
              {youthEvents.slice(0, 6).map((event) => (
                <article className="youth-event-card" key={event.id}>
                  <h4>{event.title}</h4>
                  <p className="youth-event-card-meta">
                    <strong>{event.schedule}</strong>
                  </p>
                  <p className="youth-event-card-loc">{event.location}</p>
                  <p className="youth-event-card-desc">{event.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function FortressYoungAdultsMinistryPage() {
  const [fortressEvents, setFortressEvents] = useState<ChurchEvent[]>([]);
  const [fortressEventsStatus, setFortressEventsStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetchEvents();
        if (!active) {
          return;
        }
        setFortressEvents(response);
        setFortressEventsStatus('ready');
      } catch {
        if (!active) {
          return;
        }
        setFortressEventsStatus('error');
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <MinistryDetailHero
        title={FORTRESS_YOUNG_ADULTS_NAME}
        imageUrl={FORTRESS_HERO_IMAGE}
        variant="center"
        brandLayout
        fullView
      />

      <section className="youth-welcome">
        <div className="container youth-welcome-inner">
          <div className="youth-welcome-copy">
            <h3 className="youth-welcome-title">
              Welcome to {FORTRESS_YOUNG_ADULTS_NAME}
            </h3>
            <p>
              {FORTRESS_YOUNG_ADULTS_NAME} is for college-aged and young adults who want to grow in
              faith through Life Groups, meet ups, events, and special services—walking with biblical
              wisdom, mentoring, and Christ-centered community.
            </p>
            <p>
              Join our Facebook group for the latest Fortress gatherings, highlights, and ways to stay
              connected during the week.
            </p>
            <div className="youth-social-row">
              <a
                className="button cal-btn-gold youth-social-btn"
                href={FORTRESS_FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fortress young adults Facebook group (opens in a new tab)"
              >
                Facebook group
              </a>
            </div>
          </div>
          <div className="youth-welcome-photo">
            <img
              src={FORTRESS_WELCOME_SIDE_IMAGE}
              alt={`${FORTRESS_YOUNG_ADULTS_NAME} — community`}
            />
          </div>
        </div>
      </section>

      <NextgenMinistryBanner tone="blue" phrase={FORTRESS_YOUNG_ADULTS_NAME.toUpperCase()} />

      <section className="youth-service">
        <div className="container cal-center">
          <p className="youth-service-label">Get Connected</p>
          <h3 className="youth-service-heading">Life Groups, meet ups &amp; special services</h3>
          <p className="youth-service-note">
            Times and locations vary—check announcements on Sunday and our Facebook group for
            what&apos;s coming up next.
          </p>
        </div>
      </section>

      <section
        className="youth-gallery-wrap youth-gallery-wrap--flush-ui"
        aria-label={`${FORTRESS_YOUNG_ADULTS_NAME} photo gallery`}
      >
        <div
          className="youth-gallery-fullbleed"
          aria-label={`${FORTRESS_YOUNG_ADULTS_NAME} photo strip`}
        >
          <div className="youth-photo-strip youth-photo-strip--flush">
            {FORTRESS_SERVICE_PHOTO_ROW.map((photo) => (
              <div className="youth-photo-cell" key={photo.path}>
                <div className="youth-photo-frame">
                  <img
                    src={photo.path}
                    alt={`${FORTRESS_YOUNG_ADULTS_NAME} — ${photo.label}`}
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ministry-upcoming ministry-upcoming--youth">
        <div className="container cal-center">
          <h3 className="youth-upcoming-title">Upcoming Events</h3>
          <p className="ministry-upcoming-lead ministry-upcoming-lead--youth">
            Discover what&apos;s happening next—join our upcoming events to grow in faith, build
            friendships, and stay connected with the church family!
          </p>

          {fortressEventsStatus === 'loading' && (
            <p className="youth-events-status">Loading events...</p>
          )}
          {fortressEventsStatus === 'error' && (
            <p className="youth-events-status">Could not load events right now.</p>
          )}
          {fortressEventsStatus === 'ready' && fortressEvents.length === 0 && (
            <p className="youth-events-status">No Events Found</p>
          )}

          {fortressEvents.length > 0 && (
            <div className="youth-events-grid">
              {fortressEvents.slice(0, 6).map((event) => (
                <article className="youth-event-card" key={event.id}>
                  <h4>{event.title}</h4>
                  <p className="youth-event-card-meta">
                    <strong>{event.schedule}</strong>
                  </p>
                  <p className="youth-event-card-loc">{event.location}</p>
                  <p className="youth-event-card-desc">{event.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function WorshipMinistryPage() {
  return (
    <>
      <MinistryDetailHero
        title="Worship"
        imageUrl={WORSHIP_HERO_IMAGE}
        variant="center"
      />

      <section className="worship-split" aria-labelledby="worship-split-heading">
        <div className="worship-split-grid">
          <div className="worship-split-copy">
            <p className="worship-split-label">GET CONNECTED</p>
            <h2 id="worship-split-heading" className="worship-split-title">
              Be Part of the Worship Ministry
            </h2>
            <p>
              At NLCF, worship exists to lift Jesus high. When we gather and exalt Him together,
              something happens in hearts: faith deepens, burdens lift, and people meet God in real
              ways. Our musicians, singers, and production volunteers use their gifts to help the
              church respond in spirit and truth—not to rush through a song list, but to help the room
              follow what God is doing in the moment.
            </p>
            <p>
              If you sense a call to serve through music, vocals, audio, or visuals, we would love to
              hear from you. Reach out with questions or to take the next step toward joining the team.
            </p>
            <div className="worship-split-cta">
              <Link to="/contact" className="button cal-btn-gold worship-split-btn">
                Worship application
              </Link>
            </div>
          </div>
          <div className="worship-split-visual">
            <img
              src={WORSHIP_INTRO_SIDE_IMAGE}
              alt="Worship team leading on stage"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <NextgenMinistryBanner tone="blue" phrase="GET CONNECTED" />

      <section className="worship-gallery-wrap" aria-label="Worship ministry photo gallery">
        <div className="worship-photo-strip">
          {WORSHIP_GALLERY_ROW.map((photo, index) => (
            <div className="worship-photo-cell" key={`worship-gallery-${index}`}>
              <div className="worship-photo-frame">
                <img src={photo.path} alt={`Worship — ${photo.label}`} loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function WhoWeArePage() {
  return (
    <section className="section page-section">
      <div className="container narrow cal-center">
        <p className="section-label">Who We Are</p>
        <h3>A Church Family Centered on Christ</h3>
        <p>
          New Life In Christ Fellowship is a Bible-believing church committed to worship,
          discipleship, and mission. Our heart is to lead people into a growing relationship with
          Jesus and help families live out God&apos;s purpose together.
        </p>
        <h4 style={{ marginTop: '2rem' }}>Our Beliefs</h4>
        <p>
          We believe in one God — Father, Son, and Holy Spirit. We believe Jesus Christ is the
          Son of God, born of a virgin, crucified for our sins, and raised on the third day.
          Salvation is found in no one else but through faith in Christ alone.
        </p>
        <h4 style={{ marginTop: '1.5rem' }}>Our Mission</h4>
        <p>
          Helping people grow into wholehearted followers of Jesus — by knowing God, growing
          together, discovering purpose, and making a difference.
        </p>
      </div>
    </section>
  );
}

function GivePage() {
  const giveHero = '/hero-home.png';
  return (
    <>
      <section
        className="events-hero"
        style={{ backgroundImage: `url(${giveHero})` }}
      >
        <div className="events-hero-overlay" />
        <div className="container events-hero-content">
          <h2>Give</h2>
        </div>
      </section>

      <section className="section">
        <div className="container narrow cal-center">
          <p className="section-label">Give Now</p>
          <h3 className="cal-section-heading">We couldn&apos;t do it without you.</h3>
        </div>
      </section>

      <section className="section" style={{ background: '#f0f0f0', paddingTop: 0 }}>
        <div className="container narrow cal-center">
          <h3 className="give-why-title" style={{ marginTop: 0 }}>The Heart Behind Our Giving</h3>
          <p>
            Giving is an act of worship that reflects our gratitude to God for His abundant
            blessings. It allows us to partner with Him in advancing His Kingdom, supporting the
            local church, helping those in need, and making a tangible difference in the lives of
            others.
          </p>
          <p>
            When we give, we demonstrate faith, trust, and obedience, acknowledging that everything
            we have ultimately belongs to God. Generosity not only blesses others but also transforms
            our hearts, cultivating contentment, joy, and a deeper dependence on God&apos;s provision.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container cal-center">
          <div className="give-card">
            <div className="give-card-body">
              <h4>Give Online</h4>
              <p>
                Giving online is a simple, secure, and convenient way to support the mission and
                ministries of New Life In Christ Fellowship.
              </p>
              <a
                href="https://www.facebook.com/nlcfofficial"
                target="_blank"
                rel="noreferrer"
                className="button cal-btn-gold give-cta"
              >
                Give Now
              </a>
            </div>
          </div>
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
              <WhoWeArePage />
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
                label="Next Steps"
                title="Take Your Next Step With Christ"
                body="Whether you're exploring faith, ready for baptism, or looking to join a Life Group — there's a next step for you. Salvation through Jesus Christ is the beginning of a transformed life. Baptism is a public declaration of your faith. Life Groups help you grow in community. And missions give you a chance to make an eternal impact. Wherever you are in your journey, we're here to walk with you."
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
          <Route path="/ministries/youth" element={<YouthMinistryPage />} />
          <Route path="/ministries/young-adults" element={<FortressYoungAdultsMinistryPage />} />
          <Route path="/ministries/worship" element={<WorshipMinistryPage />} />
          <Route
            path="/missions"
            element={
              <SimplePage
                label="Missions"
                title="Pray, Give, and Go"
                body="We are called to make disciples of all nations. At NLCF, we support local and global missionaries, organize outreach initiatives, and provide opportunities for every believer to be involved in God's mission. Whether through prayer, financial support, or short-term trips, your participation brings the hope of Jesus to communities near and far."
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
                body="Deepen your faith with curated resources — sermon notes, Bible reading plans, study guides, and devotional materials. Whether you're studying on your own or leading a group, these tools are designed to help you grow in your knowledge and love of God's Word. Check back regularly as we add new content to support your spiritual journey."
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
            element={<GivePage />}
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
