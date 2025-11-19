# Electron App Access

## Development Environment

- **Electron App:** Launched via `npm run dev`
- **DevTools:** Available in Electron renderer window (View → Toggle Developer Tools)
- **Main Process Logs:** Appear in terminal where `npm run dev` was run
- **Renderer Logs:** Available in DevTools console

## File System Access

- **Vault Location:** User-selected directory (default: `~/Documents/OliteVault`)
- **App Config:** `~/.olite/` or platform-specific config directory
- **Logs:** (TBD - decide on log location)

## External Services

### GitHub API
- Used for blog publishing
- Requires GitHub personal access token
- Store token securely in app config

### Vercel API (Optional)
- For triggering deployments
- May require Vercel API token

## Security Notes

- All credentials stored in OS-level secure storage (keychain on macOS)
- Never commit tokens or secrets to repository
- Use environment variables for development testing
