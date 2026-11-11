import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';
import ContactForm from '../components/ContactForm';
import SocialIcon from '../components/SocialIcon';
import HeroWords from '../components/HeroWords';
import CountUp from '../components/CountUp';
import WorkGallery from '../components/WorkGallery';
import { BRAND, PRODUCTS, SERVICES, SOCIALS, getGithub, getProductImages, getWork } from '../lib/moovma';
import { CONTACT_EMAIL } from '../lib/elyssa-docs';

export const revalidate = 3600; // refresh the live GitHub numbers at most once an hour

export const metadata: Metadata = {
  title: 'Moovma: open hardware from Tunisia',
  description:
    'Moovma designs and open-sources electronics in Tunisia: the Elyssa ESP32-S3 dev board, smart power controllers, motor drivers and more. Founded by Bejaoui Hamza.',
};

const WORDS = ['hardware', 'PCBs', 'firmware', 'open source', 'community'];
const MARQUEE = ['Hardware', 'PCB design', 'Embedded', 'Open source', 'Made in Tunisia', 'Community'];

export default async function MoovmaHome() {
  const [gh, work] = await Promise.all([getGithub(), Promise.resolve(getWork())]);
  const featured = PRODUCTS.find((p) => p.featured)!;
  const photos = getProductImages();
  const featuredPhoto = photos.find((p) => p.kind === 'front') ?? photos[0];
  const aboutPhoto = photos.find((p) => p.kind === 'detail');
  const others = PRODUCTS.filter((p) => !p.featured);

  const stats = [
    { label: 'Products & projects', value: PRODUCTS.length },
    { label: 'Open-source repos', value: gh.repoCount },
    { label: 'GitHub stars', value: gh.stars },
    { label: 'GitHub followers', value: gh.followers },
  ].filter((s) => s.value > 0);

  return (
    <main className="mv-page">
      <ScrollReveal />
      <Navbar variant="moovma" />

      {/* ───────── HERO (white) ───────── */}
      <section className="mv-hero" id="top">
        <div className="section-wrap">
          <p className="eyebrow mv-fade" style={{ ['--d' as string]: '0s' }}>Moovma · {BRAND.country}</p>
          <h1 className="mv-fade" style={{ ['--d' as string]: '.08s' }}>
            We make <HeroWords words={WORDS} /><br />
            for people who <em>build things.</em>
          </h1>
          <p className="hero-intro mv-fade" style={{ ['--d' as string]: '.16s' }}>
            Moovma is a Tunisian hardware company and community. We design, ship and open-source electronics so makers,
            students and engineers can create, not just consume.
          </p>
          <div className="hero-actions mv-fade" style={{ ['--d' as string]: '.24s' }}>
            <Link className="button button-acid" href="/shop">Visit the shop</Link>
            <a className="button button-dark" href="#work">See our work</a>
            <a className="text-link" href="#about">What is Moovma? <span>↓</span></a>
          </div>
          <ul className="mv-social-row mv-fade" style={{ ['--d' as string]: '.32s' }} aria-label="Moovma on social media">
            {SOCIALS.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noreferrer" aria-label={`Moovma on ${s.name}`} title={s.name}>
                  <SocialIcon id={s.id} size={20} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mv-marquee" aria-hidden="true">
          <div className="mv-marquee-track">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((w, i) => (
              <span key={i}>{w}<i>✦</i></span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── ABOUT (black) ───────── */}
      <section className="mv-band mv-dark" id="about">
        <div className="section-wrap">
          <div className="section-label reveal"><span>01</span><span>What is Moovma</span></div>
          <div className="mv-about-grid">
            <div className="reveal">
              <h2>A movement,<br /><em>not just a startup.</em></h2>
              <p className="mv-lead">
                Moovma designs and open-sources electronics in Tunisia: from the Elyssa ESP32-S3 dev board to smart
                power controllers and motor drivers. {BRAND.githubTagline.replace('Creating', 'Our goal is creating')}.
              </p>
              <p className="mv-lead">{BRAND.youtubeTagline}</p>
              <div className="mv-founder">
                <small>Founded by</small>
                <strong>{BRAND.founder}</strong>
                <a className="text-link" href={BRAND.founderGithub} target="_blank" rel="noreferrer">GitHub ↗</a>
              </div>
            </div>
            <div className="mv-slogan reveal delay-one" aria-label={BRAND.slogan}>
              <span>na3mlou</span>
              <span>MoovMa</span>
              <span>sa7bi <b>#</b></span>
            </div>
          </div>

          {aboutPhoto && (
            <figure className="mv-about-photo reveal">
              <img src={aboutPhoto.src} alt={aboutPhoto.alt} loading="lazy" />
              <figcaption><small>Elyssa</small><span>Designed &amp; engineered in Tunisia for makers</span></figcaption>
            </figure>
          )}

          {stats.length > 0 && (
            <ul className="mv-stats reveal">
              {stats.map((s) => (
                <li key={s.label}>
                  <strong><CountUp to={s.value} /></strong>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ───────── SERVICES (white) ───────── */}
      <section className="mv-band" id="services">
        <div className="section-wrap">
          <div className="section-label reveal"><span>02</span><span>Services</span></div>
          <h2 className="reveal">What we <em>do for you.</em></h2>
          <div className="mv-services reveal">
            {SERVICES.map((s) => (
              <article key={s.n} className="mv-service">
                <span className="mv-service-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PRODUCTS (black) ───────── */}
      <section className="mv-band mv-dark" id="products">
        <div className="section-wrap">
          <div className="section-label reveal"><span>03</span><span>Products</span></div>
          <h2 className="reveal">Boards we <em>made.</em></h2>

          <article className="mv-featured reveal">
            <div className={`mv-featured-img${featuredPhoto.kind === 'cutout' ? '' : ' is-photo'}`}>
              <img src={featuredPhoto.src} alt={featuredPhoto.alt} loading="lazy" />
            </div>
            <div className="mv-featured-copy">
              <small>Featured · Dev board</small>
              <h3>{featured.name}</h3>
              <p>{featured.tagline}</p>
              <ul className="mv-chips">
                {featured.specs.map((s) => <li key={s}>{s}</li>)}
              </ul>
              <div className="mv-featured-actions">
                <Link href="/elyssa" className="button button-acid">Overview</Link>
                <Link href="/preorder" className="button button-dark">Pre-order</Link>
                <Link href="/shop" className="text-link">In the shop →</Link>
              </div>
            </div>
          </article>

          <div className="mv-products reveal">
            {others.map((p) => (
              <article key={p.id} className="mv-product">
                <h3>{p.name}</h3>
                <p>{p.tagline}</p>
                <ul className="mv-chips">
                  {p.specs.map((s) => <li key={s}>{s}</li>)}
                </ul>
                {p.href ? (
                  <a className="text-link" href={p.href} target={p.external ? '_blank' : undefined} rel="noreferrer">
                    {p.external ? 'Open on GitHub ↗' : 'Learn more →'}
                  </a>
                ) : (
                  <span className="mv-soon">Contact us to order</span>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── OUR WORK (white) ───────── */}
      <section className="mv-band" id="work">
        <div className="section-wrap">
          <div className="section-label reveal"><span>04</span><span>Our work</span></div>
          <h2 className="reveal">Projects, <em>in posters.</em></h2>
          <p className="mv-lead mv-lead-light reveal">Tap a poster to see it full size. Every design is open source.</p>
          <WorkGallery
            items={work.map(({ src, full, width, height, title, tag, blurb }) => ({ src, full, width, height, title, tag, blurb }))}
          />
        </div>
      </section>

      {/* ───────── COMMUNITY (black) ───────── */}
      <section className="mv-band mv-dark" id="community">
        <div className="section-wrap">
          <div className="section-label reveal"><span>05</span><span>Follow the build</span></div>
          <h2 className="reveal">Find us <em>everywhere.</em></h2>
          <div className="mv-socials reveal">
            {SOCIALS.map((s) => (
              <a key={s.id} className="mv-social" href={s.url} target="_blank" rel="noreferrer">
                <span className="mv-social-ico"><SocialIcon id={s.id} size={22} /></span>
                <small>{s.name}</small>
                <strong>{s.handle}</strong>
                <span>{s.blurb}</span>
                <b>↗</b>
              </a>
            ))}
          </div>

          <div className="mv-repos reveal">
            <div className="mv-repos-head">
              <span className={`status-dot${gh.live ? ' is-ready' : ''}`} />
              <span>{gh.live ? 'Live from GitHub' : 'GitHub'}</span>
            </div>
            <ul>
              {gh.repos.map((r) => (
                <li key={r.name}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    <strong>{r.name}</strong>
                    <span>{r.description || 'Open-source project'}</span>
                    <em>{[r.language, r.stars ? `★ ${r.stars}` : null].filter(Boolean).join(' · ')}</em>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── CONTACT (white) ───────── */}
      <section className="mv-band" id="contact">
        <div className="section-wrap">
          <div className="docs-cta-grid">
            <div>
              <div className="section-label reveal"><span>06</span><span>Contact us</span></div>
              <h2 className="reveal">Let’s build <em>something.</em></h2>
              <p className="mv-lead mv-lead-light reveal">
                A question about a board, a custom design, a collaboration or a workshop? Write to us and your mail app
                opens with the message ready to send to{' '}
                <a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
              <ul className="mv-contact-links reveal">
                {SOCIALS.map((s) => (
                  <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer"><SocialIcon id={s.id} size={15} />{s.name}</a></li>
                ))}
              </ul>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
