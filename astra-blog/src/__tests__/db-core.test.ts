/**
 * astra-blog — Tests de la capa de consultas (db-core)
 *
 * No importan prebuilt.ts a propósito: las llamadas server() pre-build
 * se inlinan en build time, así que aquí se prueba la lógica de
 * resolución con fixtures. Cubre especialmente las rutas dinámicas
 * anidadas (dinámica sobre dinámica).
 */
import { describe, it, expect } from 'vitest';
import { createDb } from '../db-core.js';
import type { BlogSnapshot } from '../db-core.js';

function fixture(): BlogSnapshot {
  return {
    site: {
      name: 'TestBlog',
      tagline: '',
      description: '',
      nav: [],
      footer: { about: '', columns: [] },
      socials: [],
    },
    authors: [
      { slug: 'ana', name: 'Ana', role: 'Editora', avatar: '🦊', location: '', joined: '2026-01', bio: '', socials: { github: '', x: '', site: '' }, specialties: ['a'] },
      { slug: 'ben', name: 'Ben', role: 'Dev', avatar: '🐺', location: '', joined: '2026-01', bio: '', socials: { github: '', x: '', site: '' }, specialties: ['b'] },
    ],
    categories: [
      { slug: 'guias', name: 'Guías', icon: '🧭', description: '' },
      { slug: 'notas', name: 'Notas', icon: '📝', description: '' },
    ],
    tags: ['compiler', 'router', 'css'],
    posts: [
      {
        slug: 'post-ana-1',
        authorSlug: 'ana',
        categorySlug: 'guias',
        title: 'Guía de Ana',
        excerpt: 'sobre compiler y router',
        tags: ['compiler', 'router'],
        date: '2026-01-10',
        readingMinutes: 5,
        featured: true,
        views: 100,
      },
      {
        slug: 'post-ana-2',
        authorSlug: 'ana',
        categorySlug: 'notas',
        title: 'Nota de Ana',
        excerpt: 'solo css',
        tags: ['css'],
        date: '2026-01-20',
        readingMinutes: 3,
        featured: false,
        views: 50,
      },
      {
        slug: 'post-ben-1',
        authorSlug: 'ben',
        categorySlug: 'guias',
        title: 'Guía de Ben',
        excerpt: 'compiler puro',
        tags: ['compiler'],
        date: '2026-02-01',
        readingMinutes: 8,
        featured: true,
        views: 200,
      },
    ],
    bodies: {
      'post-ana-1': {
        intro: 'Intro A1',
        sections: [{ heading: 'S1', paragraphs: ['p1', 'p2'] }],
        bullets: ['b1'],
        quote: 'q',
        codeTitle: 'x.ts',
        code: 'x',
      },
      'post-ana-2': { intro: 'I', sections: [], bullets: [], quote: '', codeTitle: '', code: '' },
      'post-ben-1': { intro: 'I', sections: [], bullets: [], quote: '', codeTitle: '', code: '' },
    },
    comments: { 'post-ana-1': [{ author: 'X', date: '2026-01-11', text: 'ok' }] },
    pages: { about: {}, contact: {} },
  };
}

describe('db-core: consultas básicas', () => {
  const db = createDb(fixture());

  it('resuelve posts por slug', () => {
    expect(db.findPost('post-ana-1')?.title).toBe('Guía de Ana');
    expect(db.findPost('no-existe')).toBeUndefined();
  });

  it('lista posts por autor y categoría', () => {
    expect(db.postsByAuthor('ana')).toHaveLength(2);
    expect(db.postsByCategory('guias').map((p) => p.slug)).toEqual(['post-ben-1', 'post-ana-1']);
  });

  it('busca por texto y por tag', () => {
    expect(db.search('compiler').map((p) => p.slug)).toEqual(['post-ben-1', 'post-ana-1']);
    expect(db.postsByTag('css').map((p) => p.slug)).toEqual(['post-ana-2']);
  });

  it('calcula relacionados sin incluir el propio post', () => {
    const related = db.relatedPosts('post-ana-1', 5);
    expect(related.some((p) => p.slug === 'post-ana-1')).toBe(false);
    // post-ben-1 comparte categoría guias → score mayor
    expect(related[0]?.slug).toBe('post-ben-1');
  });
});

describe('db-core: rutas dinámicas sobre dinámicas', () => {
  const db = createDb(fixture());

  it('resolveAuthorPost: resuelve autor → post válido', () => {
    const r = db.resolveAuthorPost('ana', 'post-ana-1');
    expect(r.ok).toBe(true);
    expect(r.value?.author.slug).toBe('ana');
    expect(r.value?.post.title).toBe('Guía de Ana');
  });

  it('resolveAuthorPost: post huérfano → reason "orphan"', () => {
    const r = db.resolveAuthorPost('ana', 'post-ben-1');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('orphan');
  });

  it('resolveAuthorPost: autor inexistente → reason "missing"', () => {
    const r = db.resolveAuthorPost('nadie', 'post-ana-1');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('missing');
  });

  it('resolveAuthorPost: post inexistente → reason "missing"', () => {
    const r = db.resolveAuthorPost('ana', 'post-fantasma');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('missing');
  });

  it('resolveCategoryTag: intersección de dos dimensiones dinámicas', () => {
    const r = db.resolveCategoryTag('guias', 'compiler');
    expect(r.ok).toBe(true);
    expect(r.value?.posts.map((p) => p.slug)).toEqual(['post-ben-1', 'post-ana-1']);
  });

  it('resolveCategoryTag: intersección vacía es válida pero sin posts', () => {
    const r = db.resolveCategoryTag('notas', 'router');
    expect(r.ok).toBe(true);
    expect(r.value?.posts).toHaveLength(0);
  });

  it('resolveCategoryTag: dimensiones inexistentes → "missing"', () => {
    expect(db.resolveCategoryTag('nada', 'compiler').reason).toBe('missing');
    expect(db.resolveCategoryTag('guias', 'nada').reason).toBe('missing');
  });
});

describe('db-core: stats', () => {
  it('cuenta posts, autores y palabras de los cuerpos', () => {
    const db = createDb(fixture());
    const stats = db.stats();
    expect(stats.posts).toBe(3);
    expect(stats.authors).toBe(2);
    expect(stats.categories).toBe(2);
    expect(stats.tags).toBe(3);
    // intro "Intro A1" (2) + heading "S1" (1) + p1 p2 (2) + I (1+1) = 7
    expect(stats.words).toBe(7);
    expect(stats.totalViews).toBe(350);
  });
});
