import { Link } from '@astrajs/router';

export function HomePage(): JSX.Element {
  return (
    <div class="page">
      <h1>Full-stack, zero configuration</h1>
      <p>
        This project includes <code>server()</code> — typed RPC between client
        and server. The compiler splits a single function into a client fetch
        stub and a server handler. Types flow end-to-end automatically.
      </p>
      <p>
        Check the <Link href="/posts">Posts page</Link> to see server data
        fetching with cache tags and revalidation.
      </p>
    </div>
  );
}
