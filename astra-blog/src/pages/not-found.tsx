/**
 * astra-blog — 404
 *
 * Se renderiza vía fallbackRoute() cuando ninguna guarda coincide.
 */
import { component } from 'astrajs.dev/core';
import { Link } from 'astrajs.dev/router';
import { db } from '../db.js';

export const NotFoundPage = component(() => (
  <div class="page wrap">
    <div class="notfound-block notfound-full">
      <span class="notfound-emoji">🛰</span>
      <h1>404 — Fuera de órbita</h1>
      <p>
        Ninguna guarda <code>route()</code> coincidió con esta URL. Recuerda: hasta el 404 de este
        blog está pre-construido.
      </p>
      <div class="orphan-actions">
        <Link href="/" class="btn btn-primary">
          ← Inicio
        </Link>
        <Link href="/blog" class="btn btn-ghost">
          Ir al blog
        </Link>
      </div>
      <div class="notfound-suggestions">
        <p class="section-sub">Quizás buscabas uno de estos autores:</p>
        <div class="tag-cloud tag-cloud-center">
          {db.listAuthors().map((a) => (
            <Link href={`/authors/${a.slug}`} class="tag-chip tag-link">
              {a.avatar} {a.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
));
