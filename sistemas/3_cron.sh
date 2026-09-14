#!/bin/bash
# =====================================================================
#  VYSE · 3 · Tareas programadas con cron
#  Administración de Sistemas Operativos — proyecto VYSE (torneos)
#  → Segunda entrega: "Script de respaldos y automatización (cron)"
#
#  FUNCIÓN
#    Deja los scripts instalados en el servidor y registra las tareas
#    programadas, de manera que el respaldo se ejecute por su cuenta sin
#    depender de que alguien lo recuerde.
#
#  QUÉ ES CRON
#    El servicio de Linux encargado de lanzar tareas en horarios fijos.
#    Se le indica "todos los días a las 3:15 ejecutá esto" y lo cumple,
#    haya o no alguien conectado al servidor.
#
#  DÓNDE CORRE
#    En el SERVIDOR, una única vez, con sudo.
#
#  MODO DE USO
#    sudo bash 3_cron.sh instalar
#    sudo bash 3_cron.sh ver
#    sudo bash 3_cron.sh quitar
# =====================================================================

set -euo pipefail
[ "$EUID" -ne 0 ] && { echo "Ejecutar con sudo."; exit 1; }

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESTINO="/usr/local/sbin"
MARCA="# --- VYSE ---"     # sirve para localizar y eliminar nuestras entradas


# ---------------------------------------------------------------------
#  ASÍ SE INTERPRETAN LOS CINCO CAMPOS DE CRON
#
#      15   3   *   *   *     comando
#      │    │   │   │   │
#      │    │   │   │   └── día de la semana (0-7, domingo = 0 o 7)
#      │    │   │   └────── mes (1-12)
#      │    │   └────────── día del mes (1-31)
#      │    └────────────── hora (0-23)
#      └─────────────────── minuto (0-59)
#
#  El asterisco equivale a "cualquiera". Por eso 15 3 * * * se lee como
#  "a los 15 minutos de las 3, cualquier día de cualquier mes".
# ---------------------------------------------------------------------

TAREAS=$(cat <<FIN
$MARCA
# Volcado completo de la base, cada noche a las 03:15.
# El motivo del horario: a esa hora nadie usa el sistema, así que la
# copia no le disputa recursos a las consultas de los usuarios.
15 3 * * * $DESTINO/vyse_respaldo >> /var/log/vyse_respaldo.log 2>&1

# Ensayo de restauración, el primer domingo del mes a las 04:30.
# Combinar "1-7" en el día del mes con "7" en el día de la semana da el
# domingo comprendido entre el 1 y el 7: el primero del mes.
30 4 1-7 * 7 $DESTINO/vyse_restaurar --probar >> /var/log/vyse_respaldo.log 2>&1

# Informe de cuentas del sistema, cada lunes a las 08:00.
# Se archiva para poder exhibir el historial durante la defensa.
0 8 * * 1 $DESTINO/vyse_usuarios auditar >> /var/log/vyse_usuarios.log 2>&1
$MARCA
FIN
)


instalar() {
  # --- 1. Llevar los scripts a una ubicación estable del sistema ----
  # Evitamos que cron apunte a la carpeta de descargas de alguien: si esa
  # carpeta desaparece, el respaldo deja de ejecutarse sin previo aviso y
  # nadie se da cuenta hasta que es tarde.
  install -m 700 "$AQUI/2_respaldo.sh"  "$DESTINO/vyse_respaldo"
  install -m 700 "$AQUI/4_restaurar.sh" "$DESTINO/vyse_restaurar"
  install -m 700 "$AQUI/1_usuarios.sh"  "$DESTINO/vyse_usuarios"
  echo "Scripts instalados en $DESTINO (solo root puede ejecutarlos)."

  # --- 2. Crear las carpetas y los archivos de registro -------------
  mkdir -p /var/respaldos/vyse/{diario,semanal,mensual}
  touch /var/log/vyse_respaldo.log /var/log/vyse_usuarios.log
  chmod 640 /var/log/vyse_*.log

  # --- 3. Actualizar el crontab de root -----------------------------
  # Se toma el crontab vigente, se le borran nuestras entradas anteriores
  # (en caso de que ya existieran) y se añaden las nuevas. De ese modo
  # ejecutar esto dos veces no genera tareas repetidas.
  local actual
  actual=$(crontab -l 2>/dev/null | sed "/^# --- VYSE ---$/,/^# --- VYSE ---$/d" || true)
  printf '%s\n%s\n' "$actual" "$TAREAS" | crontab -

  echo
  echo "Tareas programadas instaladas."
  ver
}


ver() {
  echo
  echo "==================== TAREAS PROGRAMADAS ===================="
  crontab -l 2>/dev/null | grep -v '^$' || echo "(no hay ninguna)"
  echo
  echo "==================== ÚLTIMAS EJECUCIONES ==================="
  # Sobre Ubuntu, cron va dejando sus huellas en el syslog
  grep CRON /var/log/syslog 2>/dev/null | tail -5 || echo "(sin registro todavía)"
  echo
  echo "==================== RESPALDOS EXISTENTES =================="
  ls -lh /var/respaldos/vyse/diario/ 2>/dev/null | tail -8 || echo "(ninguno todavía)"
}


quitar() {
  crontab -l 2>/dev/null \
    | sed "/^# --- VYSE ---$/,/^# --- VYSE ---$/d" \
    | crontab -
  echo "Tareas de VYSE quitadas del cron."
  echo "Los scripts y los respaldos ya hechos NO se borran."
}


case "${1:-ayuda}" in
  instalar) instalar ;;
  ver)      ver ;;
  quitar)   quitar ;;
  *)
    echo "Uso:"
    echo "  sudo bash $0 instalar   # copia los scripts y programa las tareas"
    echo "  sudo bash $0 ver        # muestra qué está programado y qué corrió"
    echo "  sudo bash $0 quitar     # desprograma todo (no borra nada)"
    ;;
esac


# =====================================================================
#  CÓMO COMPROBAR QUE CRON ANDA SIN TENER QUE ESPERAR HASTA MAÑANA
#
#  Se suma una tarea de ensayo que se dispare en un par de minutos:
#      sudo crontab -e
#      */2 * * * * date >> /tmp/prueba_cron.txt
#  Se aguardan esos dos minutos y se revisa:
#      cat /tmp/prueba_cron.txt
#  Si la fecha aparece ahí, cron está operativo. Luego se elimina la línea.
#
#  FALLA MÁS COMÚN
#    Cuando un script funciona a mano pero falla bajo cron, casi siempre
#    el culpable es el PATH: cron arranca con un entorno muy reducido. Por
#    eso nuestros scripts escriben las rutas completas y no se apoyan en
#    variables del usuario.
# =====================================================================
