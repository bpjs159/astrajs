/**
 * @astrajs/core — JSX Namespace Extension
 *
 * AstraJS components produce real DOM elements, not Virtual DOM nodes.
 * This declaration tells TypeScript that JSX expressions evaluate to
 * native `HTMLElement | DocumentFragment`.
 *
 * It also extends the standard HTML attribute set with AstraJS-specific
 * attributes for resumability and state serialization.
 *
 * IMPORTANT: This file must NOT contain any import/export statements so
 * that TypeScript treats it as an ambient script (global augmentation).
 */

declare namespace JSX {
  /**
   * AstraJS JSX elements are real, live DOM nodes — not virtual representations.
   * This is the foundation of Zero-VDOM: components return physical DOM.
   */
  type Element = HTMLElement | DocumentFragment;

  /**
   * Children can be:
   * - A single DOM node (Element)
   * - A string or number (rendered as TextNode)
   * - null/undefined/false (rendered as nothing)
   * - An array of any of the above (for loops)
   */
  type ElementChildrenAttribute = { children: {} };

  /**
   * Intrinsic elements map to standard HTML tag names.
   * Each produces its corresponding HTMLElement subtype.
   */
  interface IntrinsicElements {
    // Document structure
    html: HTMLAttributes<HTMLHtmlElement>;
    head: HTMLAttributes<HTMLHeadElement>;
    body: HTMLAttributes<HTMLBodyElement>;
    title: HTMLAttributes<HTMLTitleElement>;
    meta: HTMLAttributes<HTMLMetaElement>;
    link: HTMLAttributes<HTMLLinkElement>;
    script: HTMLAttributes<HTMLScriptElement>;
    style: HTMLAttributes<HTMLStyleElement>;
    base: HTMLAttributes<HTMLBaseElement>;

    // Content sectioning
    header: HTMLAttributes<HTMLElement>;
    footer: HTMLAttributes<HTMLElement>;
    main: HTMLAttributes<HTMLElement>;
    nav: HTMLAttributes<HTMLElement>;
    aside: HTMLAttributes<HTMLElement>;
    section: HTMLAttributes<HTMLElement>;
    article: HTMLAttributes<HTMLElement>;
    address: HTMLAttributes<HTMLElement>;

    // Text content
    h1: HTMLAttributes<HTMLHeadingElement>;
    h2: HTMLAttributes<HTMLHeadingElement>;
    h3: HTMLAttributes<HTMLHeadingElement>;
    h4: HTMLAttributes<HTMLHeadingElement>;
    h5: HTMLAttributes<HTMLHeadingElement>;
    h6: HTMLAttributes<HTMLHeadingElement>;
    hgroup: HTMLAttributes<HTMLElement>;
    p: HTMLAttributes<HTMLParagraphElement>;
    blockquote: HTMLAttributes<HTMLQuoteElement>;
    pre: HTMLAttributes<HTMLPreElement>;
    hr: HTMLAttributes<HTMLHRElement>;
    ul: HTMLAttributes<HTMLUListElement>;
    ol: HTMLAttributes<HTMLOListElement>;
    li: HTMLAttributes<HTMLLIElement>;
    dl: HTMLAttributes<HTMLDListElement>;
    dt: HTMLAttributes<HTMLElement>;
    dd: HTMLAttributes<HTMLElement>;
    figure: HTMLAttributes<HTMLElement>;
    figcaption: HTMLAttributes<HTMLElement>;
    div: HTMLAttributes<HTMLDivElement>;

    // Inline text
    a: AnchorHTMLAttributes<HTMLAnchorElement>;
    em: HTMLAttributes<HTMLElement>;
    strong: HTMLAttributes<HTMLElement>;
    small: HTMLAttributes<HTMLElement>;
    s: HTMLAttributes<HTMLElement>;
    cite: HTMLAttributes<HTMLElement>;
    q: HTMLAttributes<HTMLQuoteElement>;
    code: HTMLAttributes<HTMLElement>;
    br: HTMLAttributes<HTMLBRElement>;
    wbr: HTMLAttributes<HTMLElement>;
    span: HTMLAttributes<HTMLSpanElement>;
    b: HTMLAttributes<HTMLElement>;
    i: HTMLAttributes<HTMLElement>;
    u: HTMLAttributes<HTMLElement>;
    mark: HTMLAttributes<HTMLElement>;
    sub: HTMLAttributes<HTMLElement>;
    sup: HTMLAttributes<HTMLElement>;
    time: HTMLAttributes<HTMLTimeElement>;
    data: HTMLAttributes<HTMLDataElement>;
    abbr: HTMLAttributes<HTMLElement>;
    dfn: HTMLAttributes<HTMLElement>;
    kbd: HTMLAttributes<HTMLElement>;
    samp: HTMLAttributes<HTMLElement>;
    var: HTMLAttributes<HTMLElement>;

    // Forms
    form: FormHTMLAttributes<HTMLFormElement>;
    input: InputHTMLAttributes<HTMLInputElement>;
    textarea: HTMLAttributes<HTMLTextAreaElement>;
    button: ButtonHTMLAttributes<HTMLButtonElement>;
    select: SelectHTMLAttributes<HTMLSelectElement>;
    optgroup: HTMLAttributes<HTMLOptGroupElement>;
    option: OptionHTMLAttributes<HTMLOptionElement>;
    label: LabelHTMLAttributes<HTMLLabelElement>;
    fieldset: HTMLAttributes<HTMLFieldSetElement>;
    legend: HTMLAttributes<HTMLLegendElement>;
    datalist: HTMLAttributes<HTMLDataListElement>;
    output: HTMLAttributes<HTMLOutputElement>;
    progress: HTMLAttributes<HTMLProgressElement>;
    meter: HTMLAttributes<HTMLMeterElement>;

    // Media
    img: ImgHTMLAttributes<HTMLImageElement>;
    picture: HTMLAttributes<HTMLElement>;
    source: HTMLAttributes<HTMLSourceElement>;
    video: VideoHTMLAttributes<HTMLVideoElement>;
    audio: AudioHTMLAttributes<HTMLAudioElement>;
    track: HTMLAttributes<HTMLTrackElement>;
    iframe: HTMLAttributes<HTMLIFrameElement>;
    object: HTMLAttributes<HTMLObjectElement>;
    embed: HTMLAttributes<HTMLEmbedElement>;
    canvas: HTMLAttributes<HTMLCanvasElement>;
    svg: HTMLAttributes<SVGSVGElement>;
    path: HTMLAttributes<SVGPathElement>;

    // Table
    table: HTMLAttributes<HTMLTableElement>;
    caption: HTMLAttributes<HTMLTableCaptionElement>;
    colgroup: HTMLAttributes<HTMLTableColElement>;
    col: HTMLAttributes<HTMLTableColElement>;
    tbody: HTMLAttributes<HTMLTableSectionElement>;
    thead: HTMLAttributes<HTMLTableSectionElement>;
    tfoot: HTMLAttributes<HTMLTableSectionElement>;
    tr: HTMLAttributes<HTMLTableRowElement>;
    td: HTMLAttributes<HTMLTableCellElement>;
    th: HTMLAttributes<HTMLTableHeaderCellElement>;

    // Interactive
    details: HTMLAttributes<HTMLDetailsElement>;
    summary: HTMLAttributes<HTMLElement>;
    dialog: HTMLAttributes<HTMLDialogElement>;
  }

  /**
   * AstraJS extends standard HTML attributes with resumability primitives
   * and native View Transitions API support.
   */
  interface HTMLAttributes<T> {
    // --- Standard ---
    class?: string;
    id?: string;
    title?: string;
    lang?: string;
    dir?: string;
    hidden?: boolean | string;
    tabindex?: number;
    role?: string;
    'aria-label'?: string;
    'aria-hidden'?: boolean | string;
    'aria-expanded'?: boolean | string;
    'data-*'?: string;

    // --- AstraJS Resumability ---
    'astra-data'?: string | Record<string, unknown>;
    'astra-on:click'?: string;
    'astra-on:submit'?: string;
    'astra-on:input'?: string;
    'astra-on:change'?: string;
    'astra-on:focus'?: string;
    'astra-on:blur'?: string;
    'astra-on:keydown'?: string;
    'astra-on:keyup'?: string;
    'astra-on:mouseenter'?: string;
    'astra-on:mouseleave'?: string;

    // --- View Transitions ---
    style?: Partial<CSSStyleDeclaration> & { 'view-transition-name'?: string };

    // --- Event Handlers ---
    onclick?: (event: MouseEvent) => void;
    onsubmit?: (event: SubmitEvent) => void;
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
    onfocus?: (event: FocusEvent) => void;
    onblur?: (event: FocusEvent) => void;
    onkeydown?: (event: KeyboardEvent) => void;
    onkeyup?: (event: KeyboardEvent) => void;

    // --- Children ---
    children?: JSX.Element | string | number | boolean | null | undefined | readonly JSX.Element[];
  }

  interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string;
    target?: string;
    rel?: string;
  }

  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    src?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    loading?: 'lazy' | 'eager';
  }

  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string;
    name?: string;
    value?: string | number;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    checked?: boolean;
  }

  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }

  interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string;
    value?: string;
    disabled?: boolean;
  }

  interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string;
    selected?: boolean;
    disabled?: boolean;
  }

  interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
    for?: string;
  }

  interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    action?: string;
    method?: 'get' | 'post';
  }

  interface VideoHTMLAttributes<T> extends HTMLAttributes<T> {
    src?: string;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
  }

  interface AudioHTMLAttributes<T> extends HTMLAttributes<T> {
    src?: string;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
  }
}
    /**
     * AstraJS JSX elements are real, live DOM nodes — not virtual representations.
     * This is the foundation of Zero-VDOM: components return physical DOM.
     */
    type Element = HTMLElement | DocumentFragment;

    /**
     * The type of elements that can appear as children in JSX.
     * Accepts DOM nodes, strings, numbers, booleans, null, undefined,
     * and arrays of the above (for loops/maps).
     */
    type ElementChildrenAttribute = {
      children: {};
    };

    /**
     * Intrinsic elements map to standard HTML tag names.
     * Each produces its corresponding HTMLElement subtype.
     */
    interface IntrinsicElements {
      // Document structure
      html: HTMLAttributes<HTMLHtmlElement>;
      head: HTMLAttributes<HTMLHeadElement>;
      body: HTMLAttributes<HTMLBodyElement>;
      title: HTMLAttributes<HTMLTitleElement>;
      meta: HTMLAttributes<HTMLMetaElement>;
      link: HTMLAttributes<HTMLLinkElement>;
      script: HTMLAttributes<HTMLScriptElement>;
      style: HTMLAttributes<HTMLStyleElement>;
      base: HTMLAttributes<HTMLBaseElement>;

      // Content sectioning
      header: HTMLAttributes<HTMLElement>;
      footer: HTMLAttributes<HTMLElement>;
      main: HTMLAttributes<HTMLElement>;
      nav: HTMLAttributes<HTMLElement>;
      aside: HTMLAttributes<HTMLElement>;
      section: HTMLAttributes<HTMLElement>;
      article: HTMLAttributes<HTMLElement>;
      address: HTMLAttributes<HTMLElement>;

      // Text content
      h1: HTMLAttributes<HTMLHeadingElement>;
      h2: HTMLAttributes<HTMLHeadingElement>;
      h3: HTMLAttributes<HTMLHeadingElement>;
      h4: HTMLAttributes<HTMLHeadingElement>;
      h5: HTMLAttributes<HTMLHeadingElement>;
      h6: HTMLAttributes<HTMLHeadingElement>;
      hgroup: HTMLAttributes<HTMLElement>;
      p: HTMLAttributes<HTMLParagraphElement>;
      blockquote: HTMLAttributes<HTMLQuoteElement>;
      pre: HTMLAttributes<HTMLPreElement>;
      hr: HTMLAttributes<HTMLHRElement>;
      ul: HTMLAttributes<HTMLUListElement>;
      ol: HTMLAttributes<HTMLOListElement>;
      li: HTMLAttributes<HTMLLIElement>;
      dl: HTMLAttributes<HTMLDListElement>;
      dt: HTMLAttributes<HTMLElement>;
      dd: HTMLAttributes<HTMLElement>;
      figure: HTMLAttributes<HTMLElement>;
      figcaption: HTMLAttributes<HTMLElement>;
      div: HTMLAttributes<HTMLDivElement>;

      // Inline text
      a: AnchorHTMLAttributes<HTMLAnchorElement>;
      em: HTMLAttributes<HTMLElement>;
      strong: HTMLAttributes<HTMLElement>;
      small: HTMLAttributes<HTMLElement>;
      s: HTMLAttributes<HTMLElement>;
      cite: HTMLAttributes<HTMLElement>;
      q: HTMLAttributes<HTMLQuoteElement>;
      code: HTMLAttributes<HTMLElement>;
      br: HTMLAttributes<HTMLBRElement>;
      wbr: HTMLAttributes<HTMLElement>;
      span: HTMLAttributes<HTMLSpanElement>;
      b: HTMLAttributes<HTMLElement>;
      i: HTMLAttributes<HTMLElement>;
      u: HTMLAttributes<HTMLElement>;
      mark: HTMLAttributes<HTMLElement>;
      sub: HTMLAttributes<HTMLElement>;
      sup: HTMLAttributes<HTMLElement>;
      time: HTMLAttributes<HTMLTimeElement>;
      data: HTMLAttributes<HTMLDataElement>;
      abbr: HTMLAttributes<HTMLElement>;
      dfn: HTMLAttributes<HTMLElement>;
      kbd: HTMLAttributes<HTMLElement>;
      samp: HTMLAttributes<HTMLElement>;
      var: HTMLAttributes<HTMLElement>;

      // Forms
      form: FormHTMLAttributes<HTMLFormElement>;
      input: InputHTMLAttributes<HTMLInputElement>;
      textarea: HTMLAttributes<HTMLTextAreaElement>;
      button: ButtonHTMLAttributes<HTMLButtonElement>;
      select: SelectHTMLAttributes<HTMLSelectElement>;
      optgroup: HTMLAttributes<HTMLOptGroupElement>;
      option: OptionHTMLAttributes<HTMLOptionElement>;
      label: LabelHTMLAttributes<HTMLLabelElement>;
      fieldset: HTMLAttributes<HTMLFieldSetElement>;
      legend: HTMLAttributes<HTMLLegendElement>;
      datalist: HTMLAttributes<HTMLDataListElement>;
      output: HTMLAttributes<HTMLOutputElement>;
      progress: HTMLAttributes<HTMLProgressElement>;
      meter: HTMLAttributes<HTMLMeterElement>;

      // Media
      img: ImgHTMLAttributes<HTMLImageElement>;
      picture: HTMLAttributes<HTMLElement>;
      source: HTMLAttributes<HTMLSourceElement>;
      video: VideoHTMLAttributes<HTMLVideoElement>;
      audio: AudioHTMLAttributes<HTMLAudioElement>;
      track: HTMLAttributes<HTMLTrackElement>;
      iframe: HTMLAttributes<HTMLIFrameElement>;
      object: HTMLAttributes<HTMLObjectElement>;
      embed: HTMLAttributes<HTMLEmbedElement>;
      canvas: HTMLAttributes<HTMLCanvasElement>;
      svg: HTMLAttributes<SVGSVGElement>;
      path: HTMLAttributes<SVGPathElement>;

      // Table
      table: HTMLAttributes<HTMLTableElement>;
      caption: HTMLAttributes<HTMLTableCaptionElement>;
      colgroup: HTMLAttributes<HTMLTableColElement>;
      col: HTMLAttributes<HTMLTableColElement>;
      tbody: HTMLAttributes<HTMLTableSectionElement>;
      thead: HTMLAttributes<HTMLTableSectionElement>;
      tfoot: HTMLAttributes<HTMLTableSectionElement>;
      tr: HTMLAttributes<HTMLTableRowElement>;
      td: HTMLAttributes<HTMLTableCellElement>;
      th: HTMLAttributes<HTMLTableHeaderCellElement>;

      // Interactive
      details: HTMLAttributes<HTMLDetailsElement>;
      summary: HTMLAttributes<HTMLElement>;
      dialog: HTMLAttributes<HTMLDialogElement>;
    }

    /**
     * AstraJS extends standard HTML attributes with resumability primitives
     * and native View Transitions API support.
     */
    interface HTMLAttributes<T> {
      // --- Standard HTML Attributes ---
      class?: string;
      id?: string;
      title?: string;
      lang?: string;
      dir?: string;
      hidden?: boolean | string;
      tabindex?: number;
      accesskey?: string;
      contenteditable?: boolean | string;
      draggable?: boolean | string;
      spellcheck?: boolean | string;
      role?: string;
      'aria-label'?: string;
      'aria-labelledby'?: string;
      'aria-describedby'?: string;
      'aria-hidden'?: boolean | string;
      'aria-expanded'?: boolean | string;
      'aria-current'?: string;
      'aria-selected'?: boolean | string;
      'aria-disabled'?: boolean | string;
      'data-*'?: string;

      // --- AstraJS Resumability Attributes ---

      /**
       * Serializes reactive state directly into the HTML.
       * On the client, this data is deserialized to rehydrate the store
       * without eager JavaScript execution.
       */
      'astra-data'?: string | Record<string, unknown>;

      /**
       * JIT event handlers compiled from the AST.
       * The handler code is downloaded only when the user interacts with
       * the element, not at page load time.
       */
      'astra-on:click'?: string;
      'astra-on:submit'?: string;
      'astra-on:input'?: string;
      'astra-on:change'?: string;
      'astra-on:focus'?: string;
      'astra-on:blur'?: string;
      'astra-on:keydown'?: string;
      'astra-on:keyup'?: string;
      'astra-on:mouseenter'?: string;
      'astra-on:mouseleave'?: string;

      // --- View Transitions API ---

      /** CSSStyleDeclaration subset with View Transitions support. */
      style?: Partial<CSSStyleDeclaration> & {
        'view-transition-name'?: string;
      };

      // --- Event Handlers (for non-resumable use) ---
      onclick?: (event: MouseEvent) => void;
      onsubmit?: (event: SubmitEvent) => void;
      oninput?: (event: Event) => void;
      onchange?: (event: Event) => void;
      onfocus?: (event: FocusEvent) => void;
      onblur?: (event: FocusEvent) => void;
      onkeydown?: (event: KeyboardEvent) => void;
      onkeyup?: (event: KeyboardEvent) => void;
      onmouseenter?: (event: MouseEvent) => void;
      onmouseleave?: (event: MouseEvent) => void;

      // --- Children ---
      children?: Children;
    }

    // ---- Specialized HTML attribute interfaces (extend base) ----

    interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
      href?: string;
      target?: string;
      rel?: string;
      download?: string;
    }

    interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
      src?: string;
      alt?: string;
      width?: number | string;
      height?: number | string;
      loading?: 'lazy' | 'eager';
      crossorigin?: 'anonymous' | 'use-credentials';
    }

    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
      type?: string;
      name?: string;
      value?: string | number;
      placeholder?: string;
      disabled?: boolean;
      required?: boolean;
      readonly?: boolean;
      checked?: boolean;
      min?: number | string;
      max?: number | string;
      step?: number | string;
      pattern?: string;
      autocomplete?: string;
      autofocus?: boolean;
    }

    interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
      type?: 'button' | 'submit' | 'reset';
      name?: string;
      value?: string;
      disabled?: boolean;
    }

    interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
      name?: string;
      value?: string;
      disabled?: boolean;
      required?: boolean;
      multiple?: boolean;
    }

    interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
      value?: string;
      selected?: boolean;
      disabled?: boolean;
      label?: string;
    }

    interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
      for?: string;
    }

    interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
      action?: string;
      method?: 'get' | 'post';
      enctype?: string;
      novalidate?: boolean;
    }

    interface VideoHTMLAttributes<T> extends HTMLAttributes<T> {
      src?: string;
      controls?: boolean;
      autoplay?: boolean;
      loop?: boolean;
      muted?: boolean;
      poster?: string;
      width?: number | string;
      height?: number | string;
    }

    interface AudioHTMLAttributes<T> extends HTMLAttributes<T> {
      src?: string;
      controls?: boolean;
      autoplay?: boolean;
      loop?: boolean;
      muted?: boolean;
    }

    /**
     * Children can be:
     * - A single DOM node (Element)
     * - A string or number (rendered as TextNode)
     * - null/undefined/false (rendered as nothing)
     * - An array of any of the above (for loops)
     */
    type Child = JSX.Element | string | number | boolean | null | undefined | readonly JSX.Element[];
    type Children = Child;
  }
}
