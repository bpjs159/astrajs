export function AboutPage(): JSX.Element {
  return (
    <div class="page">
      <h1>About this project</h1>
      <p>
        Generated with <code>astra --template frontend</code>.
      </p>
      <p>
        It includes <strong>astrajs.dev/router</strong> for isomorphic navigation,
        <strong> astrajs.dev/form</strong> for reactive forms, and
        <strong> astrajs.dev/schema</strong> for declarative validation.
      </p>
    </div>
  );
}
