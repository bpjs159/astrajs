export function AboutPage(): JSX.Element {
  return (
    <div class="page">
      <h1>About this project</h1>
      <p>
        Generated with <code>astra --template frontend</code>.
      </p>
      <p>
        It includes <strong>astrajsx/router</strong> for isomorphic navigation,
        <strong> astrajsx/form</strong> for reactive forms, and
        <strong> astrajsx/schema</strong> for declarative validation.
      </p>
    </div>
  );
}
