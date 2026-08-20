# AstraTraffic — Dashboard de tráfico Nginx

Sitio AstraJS (SSR + RPC) que lee el **access log de nginx** y muestra un
dashboard con KPIs, gráfico por hora, top IPs, top rutas y códigos de estado.
Protegido con **HTTP Basic Auth**.

## Credenciales
- **Usuario**: `astra`
- **Contraseña**: `20141020053`

## Cómo funciona
- `src/server/traffic.server.ts` — `server()` que lee **todos** los access logs
  del directorio (env `NGINX_LOG_DIR`, default `/var/log/nginx`), los agrega y
  calcula las métricas con desglose por sitio (`bySite`). Usa `autoSync`
  (ETag + 304) para que el cliente solo reciba datos cuando cambió.
- `src/app.tsx` — dashboard reactivo que sondea cada 5s y pinta KPIs, tabla de
  sitios expuestos, gráfico de barras por hora y tablas (top IPs/rutas/códigos).

## Desarrollo
```bash
npm install
npm run dev          # Vite dev (puerto 5173)
```

## Build + prerender
```bash
npm run build        # build cliente (vite build)
npm run build:all    # astra build (adapter node) + prerender SSR
```

## Despliegue (EC2 + PM2 + nginx)
```bash
# 1. Subir el build al servidor (rsync de dist/ + package.json)
# 2. Instalar deps y arrancar con PM2 (puerto 5304)
pm2 start dist/server/server.mjs --name traffic --env PORT=5304

# 3. Configurar nginx con Basic Auth (ver nginx.conf)
sudo cp nginx.conf /etc/nginx/sites-available/traffic-astrajs
sudo ln -s /etc/nginx/sites-available/traffic-astrajs /etc/nginx/sites-enabled/
printf "astra:%s\n" "$(openssl passwd -apr1 20141020053)" | sudo tee /etc/nginx/.traffic_htpasswd
sudo chmod 640 /etc/nginx/.traffic_htpasswd
sudo chown root:www-data /etc/nginx/.traffic_htpasswd
sudo nginx -t && sudo systemctl reload nginx

# 4. DNS: registro A traffic.astrajs.dev → IP del servidor
```

## Notas
- El proceso Node debe poder **leer** los access logs. Si nginx corre como
  `www-data`, asegúrate de que el usuario de PM2 tenga permiso de lectura
  (o apunta `NGINX_LOG_DIR` a una copia legible).
- Para que cada sitio aparezca por separado en la tabla "Sitios expuestos",
  configura un `access_log` por vhost en nginx (p. ej.
  `/var/log/nginx/astrajs.dev.log`, `store.astrajs.dev.log`, etc.). El nombre
  del archivo (sin `.log`) es el nombre del sitio.
