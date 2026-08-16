/**
 * astra-blog — Contact
 *
 * Página fija resuelta por la pre-built request getStaticPages()
 * → pages.contact.
 */
import { component } from '@bpjs159/core';
import { db } from '../db.js';

export const ContactPage = component(() => {
  const contact = db.pages().contact as {
    title: string;
    subtitle: string;
    intro: string;
    email: string;
    address: string;
    schedule: { day: string; hours: string }[];
    socials: { label: string; href: string; handle: string }[];
    notes: string;
  };

  return (
    <div class="page wrap">
      <section class="static-hero">
        <h1>{contact.title}</h1>
        <p class="static-sub">{contact.subtitle}</p>
        <p class="static-hero-text">{contact.intro}</p>
      </section>

      <section class="section contact-grid">
        <div class="contact-card">
          <span class="contact-icon">✉️</span>
          <h3>Email</h3>
          <a class="contact-value" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </div>
        <div class="contact-card">
          <span class="contact-icon">📍</span>
          <h3>Dirección</h3>
          <p class="contact-value">{contact.address}</p>
        </div>
        <div class="contact-card">
          <span class="contact-icon">🕐</span>
          <h3>Horario</h3>
          <table class="schedule-table">
            {contact.schedule.map((row) => (
              <tr>
                <td>{row.day}</td>
                <td>{row.hours}</td>
              </tr>
            ))}
          </table>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Redes</h2>
        <div class="contact-socials">
          {contact.socials.map((s) => (
            <a href={s.href} target="_blank" rel="noopener" class="contact-social">
              <span>{s.label}</span>
              <span class="contact-handle">{s.handle}</span>
            </a>
          ))}
        </div>
      </section>

      <section class="section">
        <div class="note-banner">
          <strong>Nota:</strong> {contact.notes}
        </div>
      </section>
    </div>
  );
});
