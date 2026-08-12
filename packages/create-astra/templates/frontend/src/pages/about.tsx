export function AboutPage(): JSX.Element {
  return (
    <div class="page">
      <h1>About this project</h1>
      <p>
        Generated with <code>create-astra --template frontend</code>.
      </p>
      <p>
        It includes <strong>@astrajs/router</strong> for isomorphic navigation,
        <strong> @astrajs/form</strong> for reactive forms, and
        <strong> @astrajs/schema</strong> for declarative validation.
      </p>
    </div>
  );
}
