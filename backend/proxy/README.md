# Proxy

Nginx reverse proxy — the internal entry point between Caddy and the application services. Routing rules are defined in [`nginx.conf`](nginx.conf).

| Path | Target |
|---|---|
| `/` | Angular frontend |
| `/api/` | FastAPI |
| `/martin/` | Martin tile server |

## Running

```bash
docker compose up proxy
```
