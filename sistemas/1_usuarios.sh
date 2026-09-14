#!/bin/bash
# =====================================================================
#  VYSE · 1 · Administración de cuentas del sistema operativo
#  Administración de Sistemas Operativos — proyecto VYSE (torneos)
#
#  ATENCIÓN: acá no hablamos de los usuarios de la aplicación VYSE
#  (esos viven en la tabla usuario de MySQL). Hablamos de las cuentas
#  de LINUX: las de las personas que se conectan al servidor a trabajar.
#
#  EL CRITERIO
#    Root no se usa para entrar. Cada persona del equipo tiene su propia
#    cuenta, su clave pública y únicamente los permisos que su rol pide.
#    Cuando algo falla, en el registro queda escrito quién fue.
#
#  MODO DE USO
#    sudo bash 1_usuarios.sh crear   nombre  rol
#    sudo bash 1_usuarios.sh baja    nombre
#    sudo bash 1_usuarios.sh listar
#    sudo bash 1_usuarios.sh auditar
#
#  Roles previstos:  infra | desarrollo | consulta
# =====================================================================

set -euo pipefail
[ "$EUID" -ne 0 ] && { echo "Ejecutar con sudo."; exit 1; }

LOG="/var/log/vyse_usuarios.log"
registrar() { echo "$(date '+%F %T') · $(logname 2>/dev/null || echo root) · $*" >> "$LOG"; }


# ---------------------------------------------------------------------
#  CADA ROL ES UN GRUPO
#
#  Linux otorga permisos a GRUPOS, nunca a individuos sueltos. Cuando se
#  suma alguien al equipo, basta con meterlo en el grupo y ya hereda todo.
#  Cuando se va, se lo saca del grupo y pierde el acceso completo de golpe.
# ---------------------------------------------------------------------

crear_grupos() {
  # Se encarga del servidor: sudo sin restricciones.
  getent group vyse_infra      > /dev/null || groupadd vyse_infra
  # Escribe código: despliega y reinicia Apache, y hasta ahí llega.
  getent group vyse_desarrollo > /dev/null || groupadd vyse_desarrollo
  # Consulta registros y métricas. No modifica nada.
  getent group vyse_consulta   > /dev/null || groupadd vyse_consulta

  # Los permisos de sudo se definen por grupo, en un archivo propio dentro
  # de /etc/sudoers.d/ en lugar de /etc/sudoers: si se corrompe el archivo
  # principal, el servidor se queda sin sudo y no hay vuelta atrás fácil.
  cat > /etc/sudoers.d/vyse <<'FIN'
# Infraestructura: sin límites
%vyse_infra      ALL=(ALL:ALL) ALL

# Desarrollo: apenas lo indispensable para publicar cambios
%vyse_desarrollo ALL=(root) /bin/systemctl reload apache2, \
                               /bin/systemctl restart apache2, \
                               /bin/systemctl status apache2, \
                               /usr/bin/git -C /var/www/vyse pull

# Consulta: leer registros y nada más
%vyse_consulta   ALL=(root) /usr/bin/journalctl, /usr/bin/tail /var/log/*
FIN
  chmod 440 /etc/sudoers.d/vyse
  visudo -c > /dev/null && echo "Reglas de sudo válidas."
}


# ---------------------------------------------------------------------
#  ALTA DE UNA CUENTA
# ---------------------------------------------------------------------

crear() {
  local usuario="$1" rol="${2:-consulta}"
  local grupo="vyse_${rol}"

  getent group "$grupo" > /dev/null || { echo "Rol inválido: $rol"; exit 1; }
  id "$usuario" &> /dev/null && { echo "El usuario $usuario ya existe."; exit 1; }

  # Con -m se arma el directorio personal y con -s se asigna bash como shell
  useradd -m -s /bin/bash -G "$grupo" -c "VYSE - $rol" "$usuario"

  # La clave inicial la genera el servidor al azar, no la inventamos
  # nosotros. Se le entrega a la persona por una vía distinta.
  local clave
  clave=$(openssl rand -base64 12)
  echo "$usuario:$clave" | chpasswd

  # Forzar el cambio apenas inicie sesión por primera vez
  chage -d 0 "$usuario"

  # Caducidad: la clave dura 90 días, se avisa con 7 de anticipación y no
  # se permite cambiarla dos veces en la misma jornada (truco típico para
  # cambiarla y volver a dejar la anterior al instante).
  chage -M 90 -m 1 -W 7 "$usuario"

  # Directorio donde irá la clave pública SSH. Recordatorio:
  # PasswordAuthentication está en 'no', de modo que sin esta clave
  # no hay forma de entrar por SSH.
  mkdir -p "/home/$usuario/.ssh"
  touch "/home/$usuario/.ssh/authorized_keys"
  chmod 700 "/home/$usuario/.ssh"
  chmod 600 "/home/$usuario/.ssh/authorized_keys"
  chown -R "$usuario:$usuario" "/home/$usuario/.ssh"

  registrar "ALTA usuario=$usuario rol=$rol"

  echo "-----------------------------------------------------"
  echo " Usuario creado : $usuario"
  echo " Rol / grupo    : $grupo"
  echo " Clave temporal : $clave"
  echo " Debe cambiarla en el primer ingreso."
  echo " Falta pegar su clave pública en:"
  echo "   /home/$usuario/.ssh/authorized_keys"
  echo "-----------------------------------------------------"
}


# ---------------------------------------------------------------------
#  BAJA DE UNA CUENTA
#
#  La cuenta se inhabilita, nunca se elimina. Al eliminarla, sus archivos
#  se quedan sin dueño y además se corta la trazabilidad: ya no se sabe
#  quién hizo qué en los registros anteriores.
# ---------------------------------------------------------------------

baja() {
  local usuario="$1"
  id "$usuario" &> /dev/null || { echo "No existe $usuario."; exit 1; }

  usermod -L "$usuario"                    # inhabilita la contraseña
  usermod -s /usr/sbin/nologin "$usuario"  # le impide iniciar sesión
  chage -E 0 "$usuario"                    # marca la cuenta como vencida hoy

  # También hay que retirar la clave pública, o seguiría entrando por SSH
  if [ -f "/home/$usuario/.ssh/authorized_keys" ]; then
    mv "/home/$usuario/.ssh/authorized_keys" \
       "/home/$usuario/.ssh/authorized_keys.baja_$(date +%Y%m%d)"
  fi

  # Y se lo quita de cada grupo de VYSE
  for g in vyse_infra vyse_desarrollo vyse_consulta; do
    gpasswd -d "$usuario" "$g" 2> /dev/null || true
  done

  registrar "BAJA usuario=$usuario"
  echo "Usuario $usuario bloqueado. Sus archivos quedan en /home/$usuario."
}


# ---------------------------------------------------------------------
#  LISTADO
# ---------------------------------------------------------------------

listar() {
  printf "%-18s %-22s %-12s %s\n" "USUARIO" "GRUPOS" "ESTADO" "CLAVE VENCE"
  printf "%-18s %-22s %-12s %s\n" "------------------" "----------------------" "------------" "-----------"
  for g in vyse_infra vyse_desarrollo vyse_consulta; do
    for u in $(getent group "$g" | cut -d: -f4 | tr ',' ' '); do
      [ -z "$u" ] && continue
      local estado vence
      if passwd -S "$u" | awk '{print $2}' | grep -q '^L'; then estado="BLOQUEADO"; else estado="activo"; fi
      vence=$(chage -l "$u" | grep -i 'contraseña caduca\|Password expires' | cut -d: -f2- | xargs)
      printf "%-18s %-22s %-12s %s\n" "$u" "$g" "$estado" "$vence"
    done
  done
}


# ---------------------------------------------------------------------
#  AUDITORÍA  —  de acá sale la evidencia que va al informe
# ---------------------------------------------------------------------

auditar() {
  echo "=== 1. Usuarios que pueden abrir sesión (shell real) ==="
  awk -F: '$7 !~ /nologin|false/ && $3 >= 1000 {print $1"  uid="$3"  shell="$7}' /etc/passwd

  echo
  echo "=== 2. Quiénes tienen sudo ==="
  getent group sudo vyse_infra vyse_desarrollo vyse_consulta

  echo
  echo "=== 3. Cuentas SIN contraseña (no debería haber ninguna) ==="
  awk -F: '$2 == "" {print "PELIGRO: "$1}' /etc/shadow || echo "ninguna — correcto"

  echo
  echo "=== 4. Cuentas con UID 0 (solo debe estar root) ==="
  awk -F: '$3 == 0 {print $1}' /etc/passwd

  echo
  echo "=== 5. Últimos ingresos ==="
  last -n 15

  echo
  echo "=== 6. Ingresos fallidos ==="
  lastb -n 15 2> /dev/null || echo "(sin registro de fallidos)"

  echo
  echo "=== 7. Movimientos hechos por este script ==="
  tail -n 20 "$LOG" 2> /dev/null || echo "(sin movimientos)"
}


# ---------------------------------------------------------------------
#  OPCIONES
# ---------------------------------------------------------------------

crear_grupos

case "${1:-ayuda}" in
  crear)   crear "$2" "${3:-consulta}" ;;
  baja)    baja "$2" ;;
  listar)  listar ;;
  auditar) auditar ;;
  *)
    echo "Uso:"
    echo "  sudo bash $0 crear   <usuario> <infra|desarrollo|consulta>"
    echo "  sudo bash $0 baja    <usuario>"
    echo "  sudo bash $0 listar"
    echo "  sudo bash $0 auditar"
    ;;
esac


# =====================================================================
#  DEMOSTRACIÓN PARA LA DEFENSA
#
#  1. sudo bash 1_usuarios.sh crear juan desarrollo
#     -> muestra en pantalla la clave temporal
#  2. su - juan            -> exige cambiar la contraseña de inmediato
#  3. sudo systemctl reload apache2   -> se lo permite (figura en su lista)
#  4. sudo reboot                     -> "no está autorizado"  ← ACÁ ESTÁ LA PRUEBA
#  5. sudo bash 1_usuarios.sh baja juan
#  6. su - juan            -> "This account is currently not available"
# =====================================================================
