# Creative Youth Awards Summary Block plugin

This is the original CYA plugin for the native Squarespace Summary Block on `/new-page`. It loads more `/2026` entries as visitors scroll. The separate Google Sheet ordering mode remains off during the collection test.

## One-time setup

1. Put these files in a **public repository controlled by Creative Youth Awards**, such as `cya-summary-plugin`. Give the people who maintain the gallery repository write access.
2. In the repository's **Settings → Pages**, select **Deploy from a branch**, the `main` branch, and `/ (root)`. Wait for the Pages URL to publish.
3. Confirm that the published URL ending in `/cya-summary-plugin.js` displays JavaScript rather than a 404 page.
4. In the `/new-page` Squarespace editor, replace the current long plugin Code Block **once** with the single `<script>` tag in `loader.template.html`, using the actual Pages URL. Keep the existing Summary Block.
5. Save. On the published `/new-page`, scroll past the first 30 entries. The status should advance to 50 and the new images should appear.

Do not paste the template's `YOUR-ORG` placeholder. The precise loader URL must be verified after publishing.

## Future changes

Edit `plugin-source.html`, run `node build.mjs`, and publish both the source and generated `cya-summary-plugin.js` to the same repository. The Squarespace Code Block remains the same. Browser caches may briefly show an older version after a deployment; refresh the published page before troubleshooting.

The code is public in a public repository. Do not put private submission data or Google Sheet credentials in it. The plugin reads public gallery pages from the same Squarespace host. Keep repository write access limited to the people who maintain the site.
