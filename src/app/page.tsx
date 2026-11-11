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
import Gfx, { CONTENT_RIGHT } from '../components/Gfx';

export const revalidate = 3600; // refresh the live GitHub numbers at most once an hour

export const metadata: Metadata = {
  title: 'Moovma: open hardware from Tunisia',
  description:
    'Moovma designs and open-sources electronics in Tunisia: the Elyssa ESP32-S3 dev board, smart power controllers, motor drivers and more. Founded by Bejaoui Hamza.',
};

const WORDS = ['board', 'idea', 'project', 'maker', 'invention'];
const MARQUEE = ['Innovation', 'Hardware', 'PCB design', 'Open source', 'Proudly Tunisian', 'The future', 'Community'];

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
      <Gfx shape="pinwheel" color="acid" size={190} right={CONTENT_RIGHT} bottom={112} spin />
        <div className="section-wrap">
          <p className="eyebrow mv-fade" style={{ ['--d' as string]: '0s' }}>Moovma · Proudly {BRAND.country === 'Tunisia' ? 'Tunisian' : BRAND.country}</p>
          <h1 className="mv-fade" style={{ ['--d' as string]: '.08s' }}>
            We create the future<br />
            of <em>Tunisia</em>, one <HeroWords words={WORDS} /> at a time.
          </h1>
          <p className="hero-intro mv-fade" style={{ ['--d' as string]: '.16s' }}>
            Moovma is a Tunisian hardware company and community. We design, build and open-source electronics, from the first Tunisian dev board to smart power controllers, so makers, students and engineers can stop importing ideas and start inventing them.
          </p>
          <div className="hero-actions mv-fade" style={{ ['--d' as string]: '.24s' }}>
            <Link className="button button-acid" href="/shop">Shop Elyssa</Link>
            <a className="button button-dark" href="#products">See what we build</a>
            <a className="text-link" href="#about">Our story <span>↓</span></a>
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

      {/* ───────── START HERE (white) ───────── */}
      <section className="mv-start" aria-label="Where to start">
        <div className="section-wrap mv-start-grid">
          <Link href="/shop" className="mv-start-card"><small>I want a board</small><strong>Get your hands on Elyssa</strong><b>→</b></Link>
          <Link href="/elyssa#quickstart" className="mv-start-card"><small>I want to learn</small><strong>Blink an LED in four steps</strong><b>→</b></Link>
          <a href="#contact" className="mv-start-card"><small>I have an idea</small><strong>Tell us what you are building</strong><b>↓</b></a>
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
                Moovma is a Tunisian hardware company and community on a simple mission: put real, open, world-class electronics in the hands of Tunisian makers, students and engineers. From Elyssa, the first Tunisian dev board, to smart power controllers and motor drivers, we design it here and share it with everyone. Our goal: the largest hardware community in Tunisia.
              </p>
              <p className="mv-lead">We believe Tunisia can create, not just consume. And we are proving it, one board at a time.</p>
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
      <Gfx shape="blocks" color="g2" size={130} right={CONTENT_RIGHT} top={104} />
        <div className="section-wrap">
          <div className="section-label reveal"><span>02</span><span>Services</span></div>
          <h2 className="reveal">How we help <em>you build.</em></h2>
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
      <Gfx shape="wave" color="d2" size={190} right={CONTENT_RIGHT} top={110} />
        <div className="section-wrap">
          <div className="section-label reveal"><span>03</span><span>Products</span></div>
          <h2 className="reveal">Real boards.<br /><em>Proudly Tunisian.</em></h2>

          <article className="mv-featured reveal">
            <div className={`mv-featured-img${featuredPhoto.kind === 'cutout' ? '' : ' is-photo'}`}>
              <img src={featuredPhoto.src} alt={featuredPhoto.alt} loading="lazy" />
            </div>
            <div className="mv-featured-copy">
              <small>The first Tunisian dev board</small>
              <h3>{featured.name}</h3>
              <p>{featured.tagline}</p>
              <ul className="mv-chips">
                {featured.specs.map((s) => <li key={s}>{s}</li>)}
              </ul>
              <div className="mv-featured-actions">
                <Link href="/elyssa" className="button button-acid">Discover Elyssa</Link>
                <Link href="/preorder" className="button button-dark">Reserve yours</Link>
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
      <Gfx shape="pinwheel" color="g2" size={112} right={CONTENT_RIGHT} top={104} spin />
        <div className="section-wrap">
          <div className="section-label reveal"><span>04</span><span>Our work</span></div>
          <h2 className="reveal">Our work, <em>out loud.</em></h2>
          <p className="mv-lead mv-lead-light reveal">Tap a poster to see it up close. Most of our designs are open source, so you can learn from them, build them or make them better.</p>
          <WorkGallery
            items={work.map(({ src, full, width, height, title, tag, blurb }) => ({ src, full, width, height, title, tag, blurb }))}
          />
        </div>
      </section>

      {/* ───────── COMMUNITY (black) ───────── */}
      <section className="mv-band mv-dark" id="community">
      <Gfx shape="clover" color="d2" size={92} right={CONTENT_RIGHT} top={100} />
        <div className="section-wrap">
          <div className="section-label reveal"><span>05</span><span>Follow the build</span></div>
          <h2 className="reveal">Join the <em>movement.</em></h2>
          <p className="mv-lead reveal">Follow the builds, borrow the schematics and ask us anything. This community grows with every maker who joins, and there is room for you.</p>
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
              <h2 className="reveal">Got an idea?<br /><em>Let’s build it.</em></h2>
              <p className="mv-lead mv-lead-light reveal">
                Tell us what you are working on. A question about a board, a custom design, a collaboration or a workshop: write to us and your mail app opens with the message ready to send to{' '}
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
