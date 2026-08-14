// backend/utils/redis-config.js
// docker-compose solo define REDIS_URL=redis://redis:6379 para el backend
// (no REDIS_HOST/REDIS_PORT) — usar solo esos dos últimos como hacían las
// colas de Bull existentes las dejaba apuntando a 127.0.0.1 dentro del
// contenedor, donde no hay ningún Redis escuchando. Esta utilidad centraliza
// la resolución para que toda cola Bull del proyecto use la misma lógica.
export function getRedisConnectionOptions() {
  if (process.env.REDIS_URL) {
    const parsed = new URL(process.env.REDIS_URL);
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
      password: parsed.password || undefined,
    };
  }
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  };
}
