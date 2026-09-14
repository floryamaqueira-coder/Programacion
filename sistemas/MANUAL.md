# VYSE — Scripts de Administración de Sistemas Operativos


**La totalidad de los scripts corre EN EL SERVIDOR, mediante `sudo`.**
Ninguno se lanza desde la notebook. Desde la notebook se llega por SSH:

```bash
ssh admin_vyse@IP_O_DOMINIO_DE_TU_SERVIDOR     # desde tu máquina
cd /opt/vyse/sistemas            # ya en el servidor
```

---

## Qué punto de la letra resuelve cada script

| Script | Función | Entrega |
|---|---|---|
| `1_usuarios.sh` | Da de alta, da de baja, lista y audita las cuentas Linux del servidor | **1.ª** — "Script de gestión de usuarios del sistema" |
| `2_respaldo.sh` | Copia la base, el material subido y los archivos de configuración | **2.ª** — "Script de respaldos" |
| `3_cron.sh` | Deja el respaldo agendado para que se ejecute solo cada noche | **2.ª** — "automatización (cron)" |
| `4_restaurar.sh` | Comprueba que la copia funciona y restaura cuando sea necesario | **2.ª** — "Política de respaldos" |
| `5_monitoreo.sh` | Despliega Netdata con avisos de disco, memoria, Apache y MySQL | **2.ª** — "Sistema de monitoreo" |
| `6_verificar.sh` | Revisa todo en una sola corrida. Es el script de la defensa | evidencia |

---

## 1_usuarios.sh — cuentas del sistema

**Atención:** se trata de las cuentas de **Linux** (las personas que se
conectan al servidor), y no de los usuarios de VYSE (que residen en la
tabla `usuario` de MySQL).

```bash
sudo bash 1_usuarios.sh crear   juan infra        # o desarrollo, o consulta
sudo bash 1_usuarios.sh baja    juan
sudo bash 1_usuarios.sh listar
sudo bash 1_usuarios.sh auditar                   # evidencia para el informe
```

**El criterio:** root no se usa para entrar. Cada integrante cuenta con su
propia cuenta y con los permisos que su rol estrictamente necesita.

| Grupo | Alcance de su sudo |
|---|---|
| `vyse_infra` | sin restricciones |
| `vyse_desarrollo` | reiniciar Apache y ejecutar `git pull`, nada más |
| `vyse_consulta` | consultar registros |

En el alta: clave provisoria generada al azar, cambio obligatorio en el
primer inicio de sesión y vencimiento a los 90 días.

La baja **no elimina** la cuenta: la inhabilita. Si se eliminara, los
registros perderían la trazabilidad de lo que esa persona hizo.

---

## 2_respaldo.sh — la copia de seguridad

```bash
sudo bash 2_respaldo.sh      # manualmente, para verificar que anda
```

Por lo general **no se lanza a mano**: cron lo ejecuta cada noche.

Guarda tres conjuntos:
1. La base completa (`mysqldump`; por ahora es únicamente la tabla
   `usuario`, aunque el script ya contempla futuras tablas)
2. El material subido por los usuarios
3. Los archivos de configuración del servidor

Requiere que la contraseña esté en `/root/.my.cnf` (nunca dentro del script):

```bash
sudo nano /root/.my.cnf
```
```ini
[client]
user = vyse_respaldo
password = LA_CONTRASEÑA
```
```bash
sudo chmod 600 /root/.my.cnf
```

---

## 3_cron.sh — la programación automática

```bash
sudo bash 3_cron.sh instalar    # una única vez
sudo bash 3_cron.sh ver         # qué hay agendado y qué se ejecutó
sudo bash 3_cron.sh quitar      # sacar la programación
```

Lo que queda agendado:

| Momento | Tarea |
|---|---|
| Cada día a las 03:15 | copia completa |
| Primer domingo del mes a las 04:30 | ensayo de restauración |
| Lunes a las 08:00 | auditoría de cuentas |

Interpretación de los cinco campos de cron:

```
15   3   *   *   *
│    │   │   │   └── día de la semana (0-7, domingo = 0 o 7)
│    │   │   └────── mes
│    │   └────────── día del mes
│    └────────────── hora
└─────────────────── minuto
```

---

## 4_restaurar.sh — ensayar y restaurar

```bash
sudo bash 4_restaurar.sh --probar       # NO toca producción
sudo bash 4_restaurar.sh --restaurar    # SÍ pisa producción, pide confirmar
```

`--probar` vuelca la copia en una base independiente (`vyse_prueba`),
cuenta los registros de la tabla `usuario` (y de las que agregues más
adelante), informa cuántas tablas y disparadores quedaron, y por último
descarta la base de ensayo. El cierre esperado es:

```
===== PRUEBA SUPERADA: el respaldo sirve =====
```

> Es el punto de mayor peso en la defensa: **una copia que jamás se probó
> no es una copia de seguridad.**

---

## 5_monitoreo.sh — la supervisión

```bash
sudo bash 5_monitoreo.sh        # una única vez; solicita la clave del panel
```

Luego se accede desde el navegador de la notebook:

```
https://<servidor>/monitoreo     usuario: monitoreo
```

Netdata atiende **únicamente en localhost** y se accede a través de
Apache con contraseña. De esa forma no hace falta habilitar el puerto
19999: un tablero de supervisión abierto le revela a cualquiera qué
servicios tiene el servidor y en qué momentos se cae.

**Avisos definidos:** disco por encima del 80 % advierte y por encima del
90 % es crítico; memoria sobre el 85 %; Apache sin responder durante 120 s;
MySQL superando las 120 conexiones.

---

## 6_verificar.sh — el chequeo final

```bash
sudo bash 6_verificar.sh

# para guardar la evidencia del informe:
sudo bash 6_verificar.sh > evidencia_$(date +%F).txt
```

No altera nada, solo consulta. Repasa servicios, cuentas, copias de
seguridad, cron, supervisión, base de datos y puertos, y cierra con el
recuento de `[ OK ]` y `[FALLA]`.

---

## Puesta en marcha desde cero

```bash
# 1. Copiar los scripts al servidor (desde tu notebook)
scp -r sistemas/ admin_vyse@IP_O_DOMINIO_DE_TU_SERVIDOR:/tmp/

# 2. Entrar al servidor
ssh admin_vyse@IP_O_DOMINIO_DE_TU_SERVIDOR
sudo mkdir -p /opt/vyse && sudo mv /tmp/sistemas /opt/vyse/
cd /opt/vyse/sistemas

# 3. Usuarios (uno por cada integrante del equipo, con su rol real)
sudo bash 1_usuarios.sh crear nombre1 infra
sudo bash 1_usuarios.sh crear nombre2 desarrollo
sudo bash 1_usuarios.sh crear nombre3 consulta

# 4. Contraseña del respaldo
sudo nano /root/.my.cnf   &&  sudo chmod 600 /root/.my.cnf

# 5. Respaldo y automatización (2.ª entrega)
sudo bash 2_respaldo.sh          # probar que funciona
sudo bash 3_cron.sh instalar     # programarlo
sudo bash 4_restaurar.sh --probar

# 6. Monitoreo (2.ª entrega)
sudo bash 5_monitoreo.sh

# 7. Comprobar todo
sudo bash 6_verificar.sh
```

---

## Precauciones

1. **Ninguna contraseña se escribe dentro del script.** Se guarda en
   `/root/.my.cnf` con permisos `600`, que nadie salvo root puede leer.
2. **`4_restaurar.sh --restaurar` sobrescribe la base de producción.**
   Aunque antes conserva por su cuenta una copia del estado vigente,
   conviene estar completamente seguro.
3. **Todos los scripts respaldan la configuración previa** incluyendo la
   fecha en el nombre, y cierran documentando cómo dar marcha atrás.
4. **Ensayar primero en una máquina virtual**, nunca directamente sobre el
   servidor real.
