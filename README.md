# DJ Sharkboy Website

Portfolio and booking website for DJ Sharkboy (Xavier Tan) — Singapore DJ, MC, and Event Host.

## Stack

- **Frontend**: Single-page HTML/CSS/JS — no build step
- **Server**: Nginx (Alpine) serving static files
- **SSL**: Traefik (mini instance on Oracle VM, port 8443) with Let's Encrypt via Cloudflare DNS challenge
- **Routing**: Main Traefik LXC → TCP SNI passthrough → Oracle VM

## Dynamic Asset System

Drop files into the right folder, re-run the manifest script, done — no code changes needed.

| Folder | Behaviour |
|---|---|
| `website/assets/hero/` | 1 random image shown as hero background fallback |
| `website/assets/about/` | 1 random image shown as the About section photo |
| `website/assets/gallery-photos/` | ALL files shown in the photo carousel |
| `website/assets/gallery-videos/` | ALL files shown in the video reel carousel |
| `website/assets/static/` | Fixed assets — reference by exact filename |

After adding or removing files from any folder:

```bash
node website/generate-manifest.js
```

Nginx serves the updated files immediately — no container restart needed.

## Local Development

```bash
# Copy env file and fill in your Cloudflare token
cp .env.example .env

# Start containers
docker compose up -d

# Watch logs
docker compose logs -f
```

## Deployment

See `DEPLOY.md` (not committed — kept locally) for the full step-by-step including Traefik LXC config and OPNsense setup.

## Updating the Site

```bash
# Update a photo/video — drop file into the right assets/ folder, then:
node website/generate-manifest.js

# Restart containers (if config changed)
docker compose restart
```

## Requirements

- Docker + Docker Compose
- Cloudflare API token (Zone > DNS > Edit) for `sharkboymusic.com`
- Git LFS (`git lfs install`) for cloning media files
