# Project dashboard

This is the static companion site for the [Peippo1 GitHub profile](../README.md). It is intentionally dependency-free: project content lives in `projects.json`, while `index.html`, `style.css`, and `app.js` provide the presentation and interactions.

## Enable GitHub Pages

1. Open the repository’s **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the `master` branch and the `/docs` folder, then save.
4. Add the resulting Pages URL to the README if the repository URL ever changes.

The dashboard uses only public static assets and does not require secrets, a build step, or a backend.
