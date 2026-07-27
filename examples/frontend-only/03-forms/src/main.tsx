/**
 * 03 — Per-Input validate()
 *
 * Cada input define su propia validación inline:
 * - Async: chequea el servidor (debounce automático)
 * - Cross-field: compara contra otro campo del store
 * - Sync: reglas simples como min length o email
 *
 * El form intercepta el submit: si algún validate() falla, se bloquea.
 * Si todos pasan, tu onSubmit se ejecuta normalmente.
 */
import { component, store } from '@astrajs/core';
import { isEmail, isRequired, minLength, all } from '@astrajs/core/validation';

// Simulación de "base de datos" de usuarios existentes
const takenUsernames = new Set(['admin', 'root', 'test']);

export const Form = component(() => {
  const ui = store({ username: '', email: '', password: '', confirm: '', success: false });

  return (
    <div class="form-card">
      <h1>Per-Input Validation</h1>
      <p class="subtitle">Async · Cross-Field · Sync — usando @astrajs/validation</p>

      <form onSubmit={(e: SubmitEvent) => {
        e.preventDefault();
        ui.success = true;
        setTimeout(() => { ui.success = false; }, 3000);
      }}>
        <div class="field">
          <label>
            Username
            <span class="badge badge-async">async</span>
            <span class="badge badge-compose">composed</span>
          </label>
          <input
            name="username"
            type="text"
            placeholder="Pick a username"
            value={ui.username}
            onInput={(e) => ui.username = (e.target as HTMLInputElement).value}
            validate={all([
              isRequired,
              minLength(3),
              async (val: string) => {
                await new Promise(r => setTimeout(r, 500));
                return takenUsernames.has(val.toLowerCase())
                  ? 'Username already taken'
                  : true;
              },
            ])}
          />
          <p class="error-msg" data-error-for="username" />
        </div>

        <div class="field">
          <label>
            Email
            <span class="badge badge-module">validator</span>
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={ui.email}
            onInput={(e) => ui.email = (e.target as HTMLInputElement).value}
            validate={all([isRequired, isEmail])}
          />
          <p class="error-msg" data-error-for="email" />
        </div>

        <div class="field">
          <label>
            Password
            <span class="badge badge-module">validator</span>
          </label>
          <input
            name="password"
            type="password"
            placeholder="Min 6 characters"
            value={ui.password}
            onInput={(e) => ui.password = (e.target as HTMLInputElement).value}
            validate={all([isRequired, minLength(6)])}
          />
          <p class="error-msg" data-error-for="password" />
        </div>

        <div class="field">
          <label>
            Confirm Password
            <span class="badge badge-cross">cross-field</span>
          </label>
          <input
            name="confirm"
            type="password"
            placeholder="Repeat password"
            value={ui.confirm}
            onInput={(e) => ui.confirm = (e.target as HTMLInputElement).value}
            validate={(val: string) =>
              val === ui.password ? true : 'Passwords do not match'
            }
          />
          <p class="error-msg" data-error-for="confirm" />
        </div>

        <button class="btn-submit" type="submit">Create Account</button>

        {ui.success ? <div class="success">Account created!</div> : <></>}
      </form>

      <div class="live-preview">
        <h3>How it works</h3>
        <div class="preview-item"><span><code>all([isRequired, minLength(3), async…])</code></span><span class="badge badge-compose">Composed · Async</span></div>
        <div class="preview-item"><span><code>all([isRequired, isEmail])</code></span><span class="badge badge-module">Validation module</span></div>
        <div class="preview-item"><span><code>all([isRequired, minLength(6)])</code></span><span>Factory validator</span></div>
        <div class="preview-item"><span>Cross-field</span><span>Inline compare</span></div>
        <div class="preview-item"><span>Form submit</span><span>Blocked until all pass</span></div>
      </div>
    </div>
  );
});


