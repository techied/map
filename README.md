<p align="center">
  <img src="public/favicon.svg" alt="SAM Map logo" width="48" height="48" />
</p>

<h1 align="center">SAM Map</h1>

<p align="center">
  Explore satellite imagery and highlight objects like buildings, trees, cars, and pools with a text query.
</p>

- **Cloudflare Workers** hosts the app and handles tile and segmentation requests.
- **[Meta SAM 3.1](https://github.com/facebookresearch/sam3)** (Segment Anything Model) identifies and segments objects from text prompts.
- **React + TypeScript** powers the interface and highlight overlays.
- **Google Maps** provides the interactive map and satellite imagery.
