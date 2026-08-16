/**
 * astra-blog — About
 *
 * Página fija con mucho contenido, resuelta por la pre-built request
 * getStaticPages() → pages.about.
 */
import { component } from '@bpjs159/core';
import { Link } from '@bpjs159/router';
import { db } from '../db.js';

export const AboutPage = component(() => {
  const about = db.pages().about as {
    title: string;
    subtitle: string;
    hero: string;
    mission: string;
    story: string[];
    pillars: { icon: string; title: string; text: string }[];
    faq: { q: string; a: string }[];
    teamTitle: string;
    teamSubtitle: string;
  };

  return (
    <div class="page wrap">
      <section class="static-hero">
        <h1>{about.title}</h1>
        <p class="static-sub">{about.subtitle}</p>
        <p class="static-hero-text">{about.hero}</p>
      </section>

      <section class="section prose-block">
        <h2 class="section-title">La misión</h2>
        <p>{about.mission}</p>
      </section>

      <section class="section prose-block">
        <h2 class="section-title">La historia</h2>
        {about.story.map((para) => (
          <p>{para}</p>
        ))}
      </section>

      <section class="section">
        <h2 class="section-title">Los cuatro pilares</h2>
        <div class="pillar-grid">
          {about.pillars.map((pillar) => (
            <div class="pillar-card">
              <span class="pillar-icon">{pillar.icon}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">{about.teamTitle}</h2>
        <p class="section-sub">{about.teamSubtitle}</p>
        <div class="author-grid">
          {db.listAuthors().map((author) => (
            <Link href={`/authors/${author.slug}`} class="author-mini">
              <span class="author-avatar">{author.avatar}</span>
              <span class="author-mini-name">{author.name}</span>
              <span class="author-mini-role">{author.role}</span>
              <span class="author-mini-count">{db.postsByAuthor(author.slug).length} artículos</span>
            </Link>
          ))}
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Preguntas frecuentes</h2>
        <div class="faq-list">
          {about.faq.map((item) => (
            <details class="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
});
