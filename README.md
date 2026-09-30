# Creative Youth Awards Summary Block plugin

This plugin extends the native Squarespace Summary Block on `/new-page`. By default it loads more `/2026` blog entries as visitors scroll. The `/2026` blog itself is not edited.

## One-time Squarespace setup

1. Keep the existing Summary Block on `/new-page`. In the Code Block on that page, replace the long plugin code with the single script tag in [`loader.template.html`](loader.template.html).
2. Save the page, open its published URL, and scroll past the first batch. Check that more cards appear with images.
3. If anything goes wrong, restore the previous Code Block text; the blog entries and their publish dates are unaffected.

GitHub Pages publishes from `main` at `/ (root)`. The live hosting page is https://maliking.github.io/cya-summary-plugin/.

## Google Sheet order preview

Open [the Sheet preview on the test page](https://www.creativeyouthawards.org/new-page?cya-sheet-test=1). This URL reads the 25-row [public test Sheet](https://docs.google.com/spreadsheets/d/1nJKIBBEJp12m66648PUsGo0mKa_2ayKh04P1cmfd5nw/edit?gid=1857378834). Physical row order controls display order. Select an entire row by clicking its row number, then choose Edit → Move row up/down or drag the row number to a new position. Refresh the preview after moving a row. The ordinary `/new-page` URL continues to show the scrolling collection, and neither URL changes publish dates. Before using Sheet mode for a full gallery, populate and validate all intended entries and raise `minimumRows` near the expected count.

## Future changes

Edit `plugin-source.html`, run `node build.mjs`, and commit both the source and generated `cya-summary-plugin.js` to this repository. GitHub Pages publishes the new script; the Squarespace Code Block stays the same. Browser caches may briefly show the previous version.

The repository is currently owned by `maliking`. Add the people maintaining the gallery as collaborators. If ownership or the repository name changes, update the script URL in Squarespace too. The code is public, so keep private submission data and credentials out of it.
