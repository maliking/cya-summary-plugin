# Creative Youth Awards Summary Block plugin

This plugin extends the native Squarespace Summary Block on `/new-page`. It loads more `/2026` blog entries as visitors scroll. Google Sheet ordering is built in but **off** during the collection test. The `/2026` blog itself is not edited.

## One-time Squarespace setup

1. Keep the existing Summary Block on `/new-page`. In the Code Block on that page, replace the long plugin code with the single script tag in [`loader.template.html`](loader.template.html).
2. Save the page, open its published URL, and scroll past the first batch. Check that more cards appear with images.
3. If anything goes wrong, restore the previous Code Block text; the blog entries and their publish dates are unaffected.

GitHub Pages is configured to publish from `main` at `/ (root)`. The live site is https://maliking.github.io/cya-summary-plugin/.

## Future changes

Edit `plugin-source.html`, run `node build.mjs`, and commit both the source and generated `cya-summary-plugin.js` to this repository. GitHub Pages publishes the new script; the Squarespace Code Block stays the same. Browser caches may briefly show the previous version.

The repository is currently owned by `maliking`. Add the people maintaining the gallery as collaborators. If ownership or the repository name changes, update the script URL in Squarespace too. The code is public, so keep private submission data and credentials out of it.
