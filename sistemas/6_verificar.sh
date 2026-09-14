#!/bin/bash
# =====================================================================
#  VYSE · 6 · Chequeo integral del servidor
#  Administración de Sistemas Operativos — proyecto VYSE (torneos)
#
#  PARA QUÉ ESTÁ
#    Es el script pensado para la defensa. Lanza todas las verificaciones
#    en una sola pasada y deja a la vista, en una pantalla, que lo que
#    afirmamos en la documentación está efectivamente activo en el servidor.
#
#  NO MODIFICA NADA. Se limita a consultar e informar.
#
#  DÓNDE CORRE
#    En el SERVIDOR, con sudo.
#
#  MODO DE USO
#    sudo bash 6_verificar.sh
#    sudo bash 6_verificar.sh > evidencia_$(date +%F).txt    (para el informe)
# =====================================================================

set -uo pipefail        # a propósito sin -e: si un chequeo falla, igual seguimos

ok=0; mal=0

titulo() {
  echo
  echo "==================================================================="
  echo "  $*"
  echo "==================================================================="
}

# comprobar "lo que debería pasar" "comando que sale con 0 cuando está bien"
comprobar() {
  local descripcion="$1"; shift
  if "$@" > /dev/null 2>&1; then
    printf '  [ OK ]  %s\n' "$descripcion"; ok=$((ok + 1))
  else
    printf '  [FALLA] %s\n' "$descripcion"; mal=$((mal + 1))
  fi
}

echo "VYSE — verificación del servidor"
echo "Fecha: $(date '+%F %T')     Servidor: $(hostname)"
echo "Sistema: $(. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME")"


# ---------------------------------------------------------------------
titulo "1. SERVICIOS QUE TIENEN QUE ESTAR CORRIENDO"
for s in apache2 mysql cron fail2ban netdata; do
  comprobar "servicio $s activo" systemctl is-active --quiet "$s"
done
echo
systemctl --no-pager --plain list-units --type=service --state=running 2>/dev/null \
  | grep -E 'apache2|mysql|cron|fail2ban|netdata' || true


# ---------------------------------------------------------------------
titulo "2. USUARIOS DEL SISTEMA   (1.ª entrega)"
echo "  Grupos de VYSE y sus integrantes:"
for g in vyse_infra vyse_desarrollo vyse_consulta; do
  printf '    %-22s %s\n' "$g" "$(getent group "$g" | cut -d: -f4)"
done
echo
comprobar "existe el archivo de reglas de sudo"   test -f /etc/sudoers.d/vyse
comprobar "las reglas de sudo son válidas"        visudo -c -q
comprobar "no hay cuentas sin contraseña"         bash -c '! awk -F: "\$2==\"\"" /etc/shadow | grep -q .'
comprobar "solo root tiene UID 0"                 bash -c '[ "$(awk -F: "\$3==0{print \$1}" /etc/passwd | wc -l)" -eq 1 ]'
echo
echo "  Cuentas con shell real (las que pueden abrir sesión):"
awk -F: '$7 !~ /nologin|false/ && $3 >= 1000 {printf "    %-16s uid=%s\n", $1, $3}' /etc/passwd


# ---------------------------------------------------------------------
titulo "3. RESPALDOS   (2.ª entrega)"
comprobar "existe la carpeta de respaldos"    test -d /var/respaldos/vyse
comprobar "hay al menos un respaldo diario"   bash -c 'ls /var/respaldos/vyse/diario/vyse_*.sql.gz >/dev/null 2>&1'
comprobar "el último respaldo no está dañado" bash -c 'gzip -t "$(ls -t /var/respaldos/vyse/diario/vyse_*.sql.gz 2>/dev/null | head -1)"'
comprobar "existe el archivo de huellas"      test -f /var/respaldos/vyse/diario/huellas.txt
echo
ultimo=$(ls -t /var/respaldos/vyse/*/vyse_*.sql.gz 2>/dev/null | head -1)
if [ -n "$ultimo" ]; then
  echo "  Último respaldo : $(basename "$ultimo")"
  echo "  Fecha           : $(date -r "$ultimo" '+%F %T')"
  echo "  Tamaño          : $(du -h "$ultimo" | cut -f1)"
  # Verificar si tiene menos de 48 horas de antigüedad
  if [ "$(find "$ultimo" -mtime -2 | wc -l)" -eq 1 ]; then
    echo "  Antigüedad      : menos de 48 h  [ OK ]"; ok=$((ok + 1))
  else
    echo "  Antigüedad      : MÁS DE 48 H — el cron no está corriendo  [FALLA]"; mal=$((mal + 1))
  fi
fi
echo
echo "  Copias guardadas por tipo:"
for t in diario semanal mensual; do
  printf '    %-10s %s archivos\n' "$t" "$(ls -1 /var/respaldos/vyse/$t/vyse_*.sql.gz 2>/dev/null | wc -l)"
done


# ---------------------------------------------------------------------
titulo "4. AUTOMATIZACIÓN CON CRON   (2.ª entrega)"
comprobar "hay tareas de VYSE programadas" bash -c 'crontab -l 2>/dev/null | grep -q vyse'
echo
echo "  Tareas programadas:"
crontab -l 2>/dev/null | grep -v '^#' | grep -v '^$' | sed 's/^/    /' || echo "    (ninguna)"
echo
echo "  Últimas ejecuciones registradas:"
grep CRON /var/log/syslog 2>/dev/null | tail -3 | sed 's/^/    /' || echo "    (sin registro)"


# ---------------------------------------------------------------------
titulo "5. MONITOREO   (2.ª entrega)"
comprobar "netdata está activo"              systemctl is-active --quiet netdata
comprobar "netdata escucha SOLO en localhost" bash -c 'ss -tulpn 2>/dev/null | grep -q "127.0.0.1:19999"'
comprobar "netdata NO está expuesto a la red" bash -c '! ss -tulpn 2>/dev/null | grep -q "0.0.0.0:19999"'
comprobar "existen las alarmas propias"       test -f /etc/netdata/health.d/vyse.conf
echo
echo "  Uso actual del servidor:"
printf '    Disco  : %s usado de %s (%s)\n' \
  "$(df -h / | awk 'NR==2{print $3}')" "$(df -h / | awk 'NR==2{print $2}')" "$(df -h / | awk 'NR==2{print $5}')"
printf '    Memoria: %s usada de %s\n' \
  "$(free -h | awk 'NR==2{print $3}')" "$(free -h | awk 'NR==2{print $2}')"
printf '    Carga   : %s\n' "$(uptime | sed 's/.*load average: //')"
printf '    Encendido hace: %s\n' "$(uptime -p)"


# ---------------------------------------------------------------------
titulo "6. BASE DE DATOS"
comprobar "mysql escucha solo en localhost" bash -c 'ss -tulpn 2>/dev/null | grep -q "127.0.0.1:3306"'
comprobar "el 3306 NO está abierto a la red" bash -c '! ss -tulpn 2>/dev/null | grep -q "0.0.0.0:3306"'
if command -v mysql > /dev/null && [ -f /root/.my.cnf ]; then
  echo
  echo "  Contenido de la base:"
  mysql --defaults-file=/root/.my.cnf vyse -N -B -e "
    SELECT CONCAT('    tablas: ', COUNT(*)) FROM information_schema.tables
     WHERE table_schema='vyse';
    SELECT CONCAT('    disparadores: ', COUNT(*)) FROM information_schema.triggers
     WHERE trigger_schema='vyse';
    SELECT CONCAT('    usuarios registrados: ', COUNT(*)) FROM usuario;" 2>/dev/null \
    || echo "    (no se pudo consultar)"
fi


# ---------------------------------------------------------------------
titulo "7. PUERTOS ABIERTOS"
echo "  Lo que está escuchando ahora mismo:"
ss -tulpn 2>/dev/null | awk 'NR==1 || /LISTEN/' | sed 's/^/    /'
echo
echo "  Firewall:"
ufw status 2>/dev/null | sed 's/^/    /' || echo "    (ufw no instalado)"


# ---------------------------------------------------------------------
titulo "RESULTADO"
echo "  Comprobaciones correctas : $ok"
echo "  Comprobaciones con falla : $mal"
echo
if [ "$mal" -eq 0 ]; then
  echo "  Todo en orden."
else
  echo "  Hay $mal punto(s) para revisar. Están marcados como [FALLA] más arriba."
fi
echo
exit 0
