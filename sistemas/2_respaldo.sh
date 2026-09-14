#!/bin/bash
# =====================================================================
#  VYSE · 2 · Copias de seguridad automáticas
#  Administración de Sistemas Operativos — proyecto VYSE (torneos)
#
#  CONTENIDO DE LA COPIA
#    1. La base de datos entera (por ahora: tabla "usuario", en MySQL/vyse).
#    2. El material que suban los usuarios, siempre que esa carpeta exista
#       (previsto para cuando se incorporen fotos de perfil, escudos y
#       demás en public/subidas — como todavía no está creada, el paso
#       se omite automáticamente).
#    3. Los archivos de configuración del propio servidor.
#
#  ESTRATEGIA 3-2-1 (vale la pena nombrarla así en la defensa)
#    3 copias · 2 soportes diferentes · 1 fuera del servidor.
#
#  CUÁNTO SE CONSERVA
#    Diario   → quedan 7
#    Semanal  → quedan 4   (la del domingo)
#    Mensual  → quedan 6   (la del día 1)
#
#  MODO DE USO
#    sudo bash 2_respaldo.sh          (manualmente)
#    o de forma desatendida vía cron, ver el bloque final del archivo.
# =====================================================================

set -euo pipefail

# ---------------------------------------------------------------------
#  PARÁMETROS
# ---------------------------------------------------------------------
BASE="vyse"
USUARIO_BD="vyse_respaldo"            # la cuenta de solo lectura creada en el script 02
DESTINO="/var/respaldos/vyse"
REMOTO="respaldos@IP_DEL_SERVIDOR_DE_RESPALDOS:/respaldos/vyse"   # <- CAMBIAR: IP/dominio real del servidor donde guardás la copia externa
WEB="/var/www/vyse"
LOG="/var/log/vyse_respaldo.log"

# Acá no se escribe ninguna contraseña. Va en /root/.my.cnf, archivo que
# únicamente root está autorizado a leer:
#     [client]
#     user = vyse_respaldo
#     password = ...
#     chmod 600 /root/.my.cnf
CNF="/root/.my.cnf"

FECHA=$(date +%Y%m%d_%H%M)
DIA_SEMANA=$(date +%u)     # 7 = domingo
DIA_MES=$(date +%d)

# El tipo de copia depende de la fecha: diaria, semanal o mensual
if   [ "$DIA_MES" = "01" ];   then TIPO="mensual"
elif [ "$DIA_SEMANA" = "7" ]; then TIPO="semanal"
else                               TIPO="diario"
fi

CARPETA="$DESTINO/$TIPO"
mkdir -p "$CARPETA"

decir() { echo "$(date '+%F %T') · $*" | tee -a "$LOG"; }

# Ante cualquier problema: dejar constancia y terminar con código de error
# (así cron lo detecta y lo informa)
fallo() { decir "ERROR: $*"; exit 1; }
trap 'fallo "el respaldo se cortó en la línea $LINENO"' ERR

decir "===== Comienza respaldo $TIPO ====="


# ---------------------------------------------------------------------
#  1. VOLCADO DE LA BASE
#
#  --single-transaction : captura el estado sin bloquear la aplicación
#  --routines --triggers: arrastra disparadores y procedimientos por si
#                         más adelante se crean (VYSE hoy no tiene
#                         ninguno; que el flag esté no causa problemas)
#  --events             : incorpora los eventos programados de MySQL
# ---------------------------------------------------------------------

ARCHIVO_BD="$CARPETA/vyse_${FECHA}.sql.gz"

mysqldump --defaults-file="$CNF" \
          --single-transaction \
          --routines --triggers --events \
          --default-character-set=utf8mb4 \
          "$BASE" | gzip -9 > "$ARCHIVO_BD"

# Verificar que el resultado no quedó vacío ni truncado
[ -s "$ARCHIVO_BD" ] || fallo "el volcado quedó vacío"
gzip -t "$ARCHIVO_BD" || fallo "el .gz está dañado"

TAM=$(du -h "$ARCHIVO_BD" | cut -f1)
decir "Base de datos: $ARCHIVO_BD ($TAM)"


# ---------------------------------------------------------------------
#  2. MATERIAL SUBIDO POR LOS USUARIOS
# ---------------------------------------------------------------------

ARCHIVO_UP="$CARPETA/subidas_${FECHA}.tar.gz"
if [ -d "$WEB/public/subidas" ]; then
  tar -czf "$ARCHIVO_UP" -C "$WEB/public" subidas
  decir "Archivos subidos: $ARCHIVO_UP ($(du -h "$ARCHIVO_UP" | cut -f1))"
fi


# ---------------------------------------------------------------------
#  3. CONFIGURACIÓN DEL SERVIDOR
#     Es lo que permite reconstruir el servidor desde cero si se pierde
#     por completo. Un par de estos archivos (fail2ban,
#     "vyse-seguridad.conf") corresponden a un hardening que no forma
#     parte de este conjunto de 6 scripts; cuando no existen, tar los
#     ignora y el respaldo sigue su curso.
# ---------------------------------------------------------------------

ARCHIVO_CFG="$CARPETA/config_${FECHA}.tar.gz"
tar -czf "$ARCHIVO_CFG" \
    /etc/apache2/sites-available \
    /etc/apache2/conf-available/vyse-seguridad.conf \
    /etc/mysql/mysql.conf.d \
    /etc/fail2ban/jail.local \
    /etc/fail2ban/filter.d/vyse-login.conf \
    /etc/ssh/sshd_config.d \
    /etc/sudoers.d/vyse \
    2> /dev/null || true
decir "Configuración: $ARCHIVO_CFG"


# ---------------------------------------------------------------------
#  4. SUMA DE VERIFICACIÓN
#     Es un valor que se modifica ante el mínimo cambio en el archivo,
#     aunque sea de un solo byte. Permite demostrar que lo que se
#     restaura es exactamente lo que se respaldó.
# ---------------------------------------------------------------------

cd "$CARPETA"
sha256sum "$(basename "$ARCHIVO_BD")" >> "$CARPETA/huellas.txt"
decir "Huella SHA-256 guardada."


# ---------------------------------------------------------------------
#  5. RÉPLICA EN OTRA MÁQUINA  (el "1" del esquema 3-2-1)
#     Ante un incendio del servidor, una copia alojada dentro de él arde
#     junto con el original.
# ---------------------------------------------------------------------

if rsync -az --timeout=60 "$ARCHIVO_BD" "$REMOTO/" 2> /dev/null; then
  decir "Copia remota enviada a $REMOTO"
else
  decir "AVISO: no se pudo enviar la copia remota (¿servidor apagado?)"
fi


# ---------------------------------------------------------------------
#  6. PURGA DE COPIAS ANTIGUAS
# ---------------------------------------------------------------------

case "$TIPO" in
  diario)  CONSERVAR=7  ;;
  semanal) CONSERVAR=4  ;;
  mensual) CONSERVAR=6  ;;
esac

# Se listan por nombre (que incluye la fecha), se descartan de la lista
# las que hay que mantener y se elimina todo lo que sobra.
ls -1t "$CARPETA"/vyse_*.sql.gz 2> /dev/null | tail -n +$((CONSERVAR + 1)) | while read -r v; do
  rm -f "$v"; decir "Borrado por antigüedad: $(basename "$v")"
done


# ---------------------------------------------------------------------
#  7. CIERRE
# ---------------------------------------------------------------------

decir "===== Respaldo $TIPO terminado ====="
decir "Copias guardadas: $(ls -1 "$CARPETA"/vyse_*.sql.gz 2>/dev/null | wc -l) · Espacio usado: $(du -sh "$DESTINO" | cut -f1)"
trap - ERR
exit 0


# =====================================================================
#  PROGRAMACIÓN MEDIANTE CRON
#
#  Puesta en marcha:
#    sudo cp 2_respaldo.sh /usr/local/sbin/vyse_respaldo
#    sudo chmod 700 /usr/local/sbin/vyse_respaldo
#    sudo crontab -e
#
#  Después agregar estas dos entradas:
#
#    # Respaldo de VYSE, todos los días a las 03:15
#    15 3 * * * /usr/local/sbin/vyse_respaldo >> /var/log/vyse_respaldo.log 2>&1
#
#    # Prueba de restauración, el primer domingo de cada mes a las 04:30
#    30 4 1-7 * 7 /usr/local/sbin/vyse_restaurar --probar >> /var/log/vyse_respaldo.log 2>&1
#
#  Interpretación de los cinco campos:
#      15   3   *   *   *
#      min hora día mes díaSemana
#      -> a las 3 y 15, cada día.
#
#  ¿Por qué de madrugada? Porque a esa hora el sistema está sin uso y el
#  volcado no le pelea recursos a las consultas de los usuarios.
#
#  Para confirmar que cron lo ejecutó:
#    sudo grep CRON /var/log/syslog | tail
#    ls -lh /var/respaldos/vyse/diario/
# =====================================================================
