<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep LocalMart as a single TanStack index route with reusable storefront sections and browser-safe catalog data; this preserves the required framework while matching the single-page brief.
- Keep order submission frontend-only and prevent default submission; the requested form must not send or store customer data.
- Define storefront visual roles in src/styles.css and use shared Button variants; this keeps the screenshot styling consistent across desktop and mobile.
