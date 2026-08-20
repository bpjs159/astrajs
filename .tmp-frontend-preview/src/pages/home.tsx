import { Counter } from '../components/counter.js';

export function HomePage(): JSX.Element {
  return (
    <div class="page">
      <h1>Welcome to AstraJS</h1>
      <p>
        This page renders a reactive component. Click the buttons — only the
        count TextNode updates. The component never re-runs, there is no
        Virtual DOM, no diffing, no reconciliation.
      </p>
      <Counter />
    </div>
  );
}
