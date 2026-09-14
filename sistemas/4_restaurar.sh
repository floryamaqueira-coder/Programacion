#!/bin/bash
# =====================================================================
#  VYSE · 4 · Restauración y ensayo del respaldo
#  Administración de Sistemas Operativos — proyecto VYSE (torneos)
#
#  MOTIVO DE SU EXISTENCIA
#    Un respaldo sin probar no es un respaldo: es una carpeta llena de
#    archivos que damos por buenos sin evidencia. Este script aporta esa
#    evidencia de verdad.
#
#  TIENE DOS MODOS
#    --probar   vuelca la copia en una base descartable (vyse_prueba),
#               cuenta los registros y después elimina esa base. NUNCA
#               toca producción. Es el que cron dispara solo cada mes.
#
#    --restaurar  restaura en serio sobre vyse. Exige confirmación
#                 escrita, porque sobrescribe los datos vigentes.
#
#  MODO DE USO
#    sudo bash 4_restaurar.sh --probar
#    sudo bash 4_restaurar.sh --restaurar /var/respaldos/vyse/diario/vyse_20260908_0315.sql.gz
# =====================================================================

set -euo pipefail
[ "$EUID" -ne 0 ] && { echo "Ejecutar con sudo."; exit 1; }

DESTINO="/var/respaldos/vyse"
LOG="/var/log/vyse_respaldo.log"
CNF="/root/.my.cnf"

decir() { echo "$(date '+%F %T') · $*" | tee -a "$LOG"; }

# Devuelve la copia más reciente que haya disponible
ultimo() {
  find "$DESTINO" -name 'vyse_*.sql.gz' -type f -printf '%T@ %p\n' \
    | sort -rn | head -1 | cut -d' ' -f2-
}


# =====================================================================
#  MODO ENSAYO
# =====================================================================

probar() {
  local archivo="${1:-$(ultimo)}"
  [ -f "$archivo" ] || { decir "PRUEBA FALLIDA: no hay ningún respaldo"; exit 1; }

  decir "===== Prueba de restauración: $(basename "$archivo") ====="

  # --- 1. ¿El comprimido está en buen estado? ---
  gzip -t "$archivo" || { decir "PRUEBA FALLIDA: archivo dañado"; exit 1; }
  decir "1/4 El .gz está íntegro."

  # --- 2. ¿La suma de verificación es la del día en que se generó? ---
  local carpeta huella_guardada huella_ahora
  carpeta=$(dirname "$archivo")
  if [ -f "$carpeta/huellas.txt" ]; then
    huella_guardada=$(grep "$(basename "$archivo")" "$carpeta/huellas.txt" | cut -d' ' -f1 | head -1)
    huella_ahora=$(sha256sum "$archivo" | cut -d' ' -f1)
    if [ "$huella_guardada" = "$huella_ahora" ]; then
      decir "2/4 La huella SHA-256 coincide: el archivo no se alteró."
    else
      decir "PRUEBA FALLIDA: la huella NO coincide. El archivo cambió."
      exit 1
    fi
  fi

  # --- 3. Volcar el contenido en una base separada ---
  mysql --defaults-file="$CNF" -e "DROP DATABASE IF EXISTS vyse_prueba; CREATE DATABASE vyse_prueba;"
  # con sed se reemplaza el USE vyse que viene en el volcado por USE vyse_prueba
  zcat "$archivo" | sed 's/`vyse`/`vyse_prueba`/g' \
    | mysql --defaults-file="$CNF" vyse_prueba
  decir "3/4 Restaurado en la base vyse_prueba."

  # --- 4. ¿Los datos llegaron completos? ---
  #
  # ACLARACIÓN: por ahora la base de VYSE contiene una única tabla,
  # "usuario" (apps/database/usuario.sql). Cuando incorpores tablas
  # nuevas (torneo, equipo, partido, etc.) agregalas acá con UNION ALL,
  # siguiendo el ejemplo que quedó comentado.
  echo
  echo "-------- CONTEO DE FILAS EN LA COPIA RESTAURADA --------"
  mysql --defaults-file="$CNF" vyse_prueba -t -e "
    SELECT 'usuario' AS tabla, COUNT(*) AS filas FROM usuario;"
    # UNION ALL SELECT 'torneo', COUNT(*) FROM torneo   -- descomentar cuando exista

  echo
  echo "-------- TABLAS Y DISPARADORES EN LA COPIA RESTAURADA --------"
  local n_trig n_tab
  n_trig=$(mysql --defaults-file="$CNF" -N -B -e \
    "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema='vyse_prueba';")
  n_tab=$(mysql --defaults-file="$CNF" -N -B -e \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='vyse_prueba';")
  echo "Tablas encontradas: $n_tab (hoy debería ser 1: usuario)"
  echo "Disparadores encontrados: $n_trig (hoy debería ser 0; VYSE todavía no usa disparadores)"
  [ "$n_tab" -ge 1 ] || decir "AVISO: no se encontró ni una tabla en el respaldo"

  # --- Dejar todo ordenado ---
  mysql --defaults-file="$CNF" -e "DROP DATABASE vyse_prueba;"
  decir "4/4 Base de prueba eliminada."
  decir "===== PRUEBA SUPERADA: el respaldo sirve ====="
}


# =====================================================================
#  MODO RESTAURACIÓN EFECTIVA
# =====================================================================

restaurar() {
  local archivo="${1:-$(ultimo)}"
  [ -f "$archivo" ] || { echo "No existe: $archivo"; exit 1; }

  echo "======================================================"
  echo " VAS A PISAR LA BASE DE PRODUCCIÓN"
  echo " Archivo : $(basename "$archivo")"
  echo " Fecha   : $(date -r "$archivo" '+%F %T')"
  echo " Tamaño  : $(du -h "$archivo" | cut -f1)"
  echo "======================================================"
  read -r -p "Escribí RESTAURAR para continuar: " confirmacion
  [ "$confirmacion" = "RESTAURAR" ] || { echo "Cancelado."; exit 0; }

  # Previo a sobrescribir, se conserva el estado presente. Si la
  # restauración termina mal, esta copia es el único recurso que queda.
  local red
  red="$DESTINO/antes_de_restaurar_$(date +%Y%m%d_%H%M).sql.gz"
  decir "Guardando el estado actual en $red"
  mysqldump --defaults-file="$CNF" --single-transaction --routines --triggers \
            vyse | gzip > "$red"

  # Se apaga la aplicación durante la restauración para que nadie escriba
  systemctl stop apache2
  decir "Apache detenido."

  mysql --defaults-file="$CNF" -e "DROP DATABASE IF EXISTS vyse; CREATE DATABASE vyse CHARACTER SET utf8mb4;"
  zcat "$archivo" | mysql --defaults-file="$CNF" vyse

  systemctl start apache2
  decir "Apache encendido. Restauración terminada desde $(basename "$archivo")."

  mysql --defaults-file="$CNF" vyse -t -e "
    SELECT COUNT(*) AS usuarios FROM usuario;"
    # SELECT COUNT(*) AS torneos FROM torneo;   -- descomentar cuando exista esa tabla
}


# =====================================================================
case "${1:-ayuda}" in
  --probar)    probar "${2:-}" ;;
  --restaurar) restaurar "${2:-}" ;;
  *)
    echo "Uso:"
    echo "  sudo bash $0 --probar    [archivo.sql.gz]   (no toca producción)"
    echo "  sudo bash $0 --restaurar [archivo.sql.gz]   (pisa producción)"
    echo
    echo "Último respaldo disponible: $(ultimo 2>/dev/null || echo 'ninguno')"
    ;;
esac


# =====================================================================
#  NOTAS PARA LA DEFENSA
#
#  Metas de recuperación que fijamos:
#    RPO (volumen de datos que toleramos perder) → 24 horas (copia diaria)
#    RTO (tiempo que tardamos en volver al aire) → 1 hora
#
#  Lo que debe imprimir el ensayo mensual:
#    ===== PRUEBA SUPERADA: el respaldo sirve =====
#  Si en algún momento arroja FALLIDA, significa que esa copia no servía
#  y nos habríamos enterado recién en pleno desastre. Justamente por eso
#  se ensaya.
# =====================================================================
