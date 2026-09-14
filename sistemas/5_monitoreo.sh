#!/bin/bash
# =====================================================================
#  VYSE · 5 · Supervisión del servidor
#  Administración de Sistemas Operativos — proyecto VYSE (torneos)
#
#  QUÉ SE INSTALA
#    Netdata: un tablero web que reporta en tiempo real CPU, memoria,
#    disco, red, Apache y MySQL. Lo preferimos frente a Zabbix porque
#    Zabbix requiere DOS equipos (servidor + agente) y acá contamos con
#    uno solo.
#
#  CRITERIO CLAVE
#    Netdata no queda expuesto a internet. Atiende exclusivamente en
#    127.0.0.1 y el acceso es por https://servidor/monitoreo, con usuario
#    y contraseña, pasando por Apache. Así evitamos habilitar el puerto
#    19999 en el firewall: un tablero de supervisión abierto le revela a
#    cualquiera qué servicios tiene el servidor y en qué momentos se cae.
#
#  MODO DE USO
#    sudo bash 5_monitoreo.sh
# =====================================================================

set -euo pipefail
[ "$EUID" -ne 0 ] && { echo "Ejecutar con sudo."; exit 1; }

USUARIO_PANEL="monitoreo"


# ---------------------------------------------------------------------
#  1. INSTALACIÓN DE NETDATA
# ---------------------------------------------------------------------

if ! command -v netdata > /dev/null; then
  apt-get update -qq
  apt-get install -y netdata
fi


# ---------------------------------------------------------------------
#  2. LIMITARLO A LA RED INTERNA
# ---------------------------------------------------------------------

cat > /etc/netdata/netdata.conf <<'FIN'
[global]
    run as user = netdata
    # Retener 4 horas de histórico en memoria (suficiente para detectar un pico)
    history = 14400

[web]
    # Únicamente localhost: desde afuera no hay acceso
    bind to = 127.0.0.1
    # Nada de enviar métricas hacia internet
    allow connections from = localhost
FIN


# ---------------------------------------------------------------------
#  3. QUE SUPERVISE APACHE Y MYSQL, NO SOLAMENTE EL EQUIPO
# ---------------------------------------------------------------------

# Apache publica su estado en /server-status, accesible solo desde localhost
cat > /etc/apache2/conf-available/server-status.conf <<'FIN'
<Location /server-status>
    SetHandler server-status
    Require local
</Location>
ExtendedStatus On
FIN
a2enmod status > /dev/null
a2enconf server-status > /dev/null

# Netdata consulta MySQL con una cuenta propia, limitada a observar
# estadísticas. No accede a ningún dato: solamente a contadores.
mysql -u root <<'FIN'
CREATE USER IF NOT EXISTS 'netdata'@'localhost';
GRANT USAGE, REPLICATION CLIENT, PROCESS ON *.* TO 'netdata'@'localhost';
FLUSH PRIVILEGES;
FIN

cat > /etc/netdata/go.d/mysql.conf <<'FIN'
jobs:
  - name: local
    dsn: netdata@unix(/var/run/mysqld/mysqld.sock)/
FIN


# ---------------------------------------------------------------------
#  4. AVISOS AUTOMÁTICOS
#     Un tablero sin avisos únicamente es útil si hay alguien mirándolo
#     en el instante exacto de la falla. Con avisos, es el servidor el
#     que da el alerta.
# ---------------------------------------------------------------------

cat > /etc/netdata/health.d/vyse.conf <<'FIN'
# --- Espacio en disco agotándose ---
# Es la avería que más servidores deja fuera de servicio: MySQL pierde la
# capacidad de escribir y la aplicación empieza a arrojar errores extraños.
 alarm: disco_lleno
    on: disk_space._
  calc: $used * 100 / ($avail + $used)
 units: %
 every: 60s
  warn: $this > 80
  crit: $this > 90
    to: sysadmin

# --- Consumo de memoria ---
 alarm: memoria_alta
    on: system.ram
  calc: $used * 100 / ($used + $cached + $free)
 units: %
 every: 30s
  warn: $this > 85
  crit: $this > 95
    to: sysadmin

# --- Apache sin responder ---
 alarm: apache_caido
    on: apache.requests
  calc: $now - $last_collected_t
 units: segundos
 every: 20s
  crit: $this > 120
    to: sysadmin

# --- Exceso de conexiones en MySQL ---
 alarm: mysql_conexiones
    on: mysql.connections
  calc: $connections
 every: 30s
  warn: $this > 120
    to: sysadmin
FIN

# Destinatario de los avisos
cat > /etc/netdata/health_alarm_notify.conf <<'FIN'
SEND_EMAIL="YES"
DEFAULT_RECIPIENT_EMAIL="vyse.alertas@ejemplo.com"   # <- CAMBIAR por el mail real que recibe las alertas
FIN


# ---------------------------------------------------------------------
#  5. EXPONERLO A TRAVÉS DE APACHE, PROTEGIDO POR CLAVE
# ---------------------------------------------------------------------

apt-get install -y apache2-utils > /dev/null
a2enmod proxy proxy_http auth_basic > /dev/null

if [ ! -f /etc/apache2/.htpasswd_monitoreo ]; then
  echo "Definí la contraseña del panel de monitoreo:"
  htpasswd -c /etc/apache2/.htpasswd_monitoreo "$USUARIO_PANEL"
  chmod 640 /etc/apache2/.htpasswd_monitoreo
  chown root:www-data /etc/apache2/.htpasswd_monitoreo
fi

cat > /etc/apache2/conf-available/vyse-monitoreo.conf <<'FIN'
<Location /monitoreo>
    AuthType Basic
    AuthName "Monitoreo VYSE"
    AuthUserFile /etc/apache2/.htpasswd_monitoreo
    Require valid-user

    ProxyPass        http://127.0.0.1:19999
    ProxyPassReverse http://127.0.0.1:19999
</Location>
FIN
a2enconf vyse-monitoreo > /dev/null


# ---------------------------------------------------------------------
#  6. PUESTA EN MARCHA
# ---------------------------------------------------------------------

systemctl enable netdata
systemctl restart netdata
apache2ctl configtest && systemctl reload apache2
sleep 3


# ---------------------------------------------------------------------
#  7. COMPROBANTES
# ---------------------------------------------------------------------

echo
echo "==================== ESTADO DEL MONITOREO ===================="
systemctl --no-pager status netdata | head -5
echo
echo "Netdata escucha en (tiene que decir 127.0.0.1, NO 0.0.0.0):"
ss -tulpn | grep 19999 || echo "  (aún levantando)"
echo
echo "Panel:  https://<servidor>/monitoreo   usuario: $USUARIO_PANEL"
echo
echo "Alertas configuradas:"
curl -s http://127.0.0.1:19999/api/v1/alarms?all | head -c 300 || true


# =====================================================================
#  VARIANTE CON ZABBIX  (por si el docente la exige puntualmente)
#
#    apt-get install zabbix-agent
#    /etc/zabbix/zabbix_agentd.conf:
#        Server=192.168.1.10          # el servidor de monitoreo
#        ServerActive=192.168.1.10
#        Hostname=vyse-web
#    systemctl enable --now zabbix-agent
#
#  Y en ../scripts/30_firewall.sh dejar MONITOREO_APARTE="si" para habilitar
#  el 10050 exclusivamente hacia esa IP.
#
#  DEMOSTRACIÓN PARA LA DEFENSA
#    1. Ingresar a https://servidor/monitoreo  -> solicita usuario y contraseña
#    2. Desde fuera: curl http://servidor:19999 -> no contesta (es lo esperado)
#    3. Ocupar el disco a propósito en un entorno de ensayo:
#         fallocate -l 5G /tmp/relleno
#       -> pasados 60 segundos se dispara en rojo la alarma "disco_lleno".
#         rm /tmp/relleno   -> regresa a verde.
#       Esa captura, en ambos estados, es el comprobante.
#
#  CÓMO DESHACERLO
#    systemctl stop netdata && systemctl disable netdata
#    a2disconf vyse-monitoreo && systemctl reload apache2
# =====================================================================
