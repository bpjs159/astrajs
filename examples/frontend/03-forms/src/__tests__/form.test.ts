import { describe, it, expect } from 'vitest';
import { Form } from '../main.js';

describe('Form', () => {
  it('renders form fields', () => {
    const el = Form({}) as HTMLElement;
    expect(el.querySelector('input#name')).toBeTruthy();
    expect(el.querySelector('input#email')).toBeTruthy();
    expect(el.querySelector('textarea#bio')).toBeTruthy();
    expect(el.querySelector('select#role')).toBeTruthy();
  });
});
