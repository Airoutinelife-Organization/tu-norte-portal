// Auto-generado desde public/docs/manual-procesos-tu-norte.md
// Base de conocimiento (RAG) del asistente "Buen Servicio" de Tu Norte.

export const MANUAL_TU_NORTE = String.raw`# MANUAL DE PROCESOS TU NORTE CÚCUTA

Documento base de conocimiento (RAG) del asistente virtual "Buen Servicio" de Tu Norte Portal.

## Manejo de órdenes técnicas
Las órdenes técnicas de Cúcuta no se asignan, solo se generan en SAE Plus. Se deben generar como orden de reclamos. Las órdenes de servicio solo se usan para traslados, cortes o reconexiones.

- OS instalaciones: 8 a 9 días hábiles.
- OS servicios: traslados, cortes, suspensión.
- OS reclamos: 24 a 48 horas (conector roto, puntos adicionales, puntos de UTP).

Se pueden agregar observaciones a órdenes creadas siempre y cuando no hayan sido asignadas, desde el menú Operaciones → Movilidad → Gestión orden, buscando la OS por nombre del abonado, número de abonado o número de orden. Ejemplo: "OS servicios traslado – observación adicional: requiere punto adicional de TV". Aplica tanto en órdenes de reclamos como de servicios.

Repetidores: únicamente en oficinas, desde $150.000, se debe cancelar primero e incluye configuración y cableado.
Empaquetados: se solicitan directamente en oficina con documento de identidad.

## Traslado externo
Puede ser misma franquicia o cambio de franquicia.

- Misma franquicia: se gestiona si el usuario no tiene mora (sin saldos pendientes posteriores a la fecha de corte, día 5 de cada mes). Se genera Orden de Servicios – Traslado con la información del nuevo predio. Costo $15.000 cargados al estado de cuenta. El usuario debe llevar el router al nuevo predio. Los puntos adicionales de TV no se trasladan y deben adquirirse nuevamente.
- Cambio de franquicia: mismos requisitos y además saldo en $0. Debe gestionarse por Odoo con datos de abonado, números de contacto y dirección nueva, asignado a Floribeth.

Tiempo estimado para ambos traslados: 5 a 7 días hábiles después de inscribir el proceso.

## Traslado interno
Si es reubicación por un motivo que compromete la eficiencia del servicio, no tiene costo. De lo contrario cuesta $15.000 (igual que un traslado externo) si se debe reinstalar la fibra Drop. Mudarse a un piso distinto se considera traslado, no reubicación.

## Valor adicional cable UTP
En Cúcuta se entregan 3 metros de cable UTP gratis; a partir de ahí cada metro cuesta $1.000. Se tramita con orden de reclamos – otro, indicando la cantidad aproximada de metros.

## Nuevo servicio
Se valida cobertura y se solicitan datos para el escalamiento: nombre del titular, números de contacto y dirección con barrio. La solicitud se remite al grupo "Administrativo TvNorteCucuta - Alianet". Si el usuario desea gestionarlo por sí mismo, se le confirma la dirección de las oficinas.

## Oficinas y horarios
- Calle 9 #0-04, Motilones.
- La Libertad, calle 15A #13-28 local 1.

Horarios: lunes a viernes 8:00 a.m. – 12:00 p.m. y 2:00 p.m. – 6:00 p.m.; sábados 8:00 a.m. – 12:00 p.m. No se atiende domingos ni festivos.

## Mes facturado
La factura se genera el 23 de cada mes, la fecha de pago oportuno es el 3 del mes siguiente y la fecha de corte es a partir del 5 para todas las franquicias.

## Escalamiento de pagos
Los pagos por PSE, oficina o SuperGiros se reflejan de inmediato en el sistema y el servicio se reconecta automáticamente. Solo se reportan los pagos hechos en puntos físicos que no sean SuperGiros u oficina. Ya no se usa Daviplata, solo PSE.

## Restauración de servicios
El servicio se restaura automáticamente en SAE y en Smart apenas ingrese el pago por PSE. Solo se remiten los pagos de usuarios a quienes no les aparezca registrado en su estado de cuenta.

## Cláusula de permanencia
Tu Norte no tiene cláusula de permanencia.

## IP pública
En Cúcuta la IP pública tiene un valor de $25.000 que se cargan a la factura mensual. El caso se escala al grupo "Administrativo TvNorteCucuta - Alianet"; si hay configuración específica se anexan datos de contacto y la configuración solicitada.

## Nuevo punto de TV
El punto de TV adicional cuesta $15.000 y se puede añadir a la factura escribiendo al grupo "Administrativo TvNorteCucuta - Alianet" con la información del usuario y la observación "cargar 15.000 por punto de TV". La orden se realiza como orden de reclamos – otros – observación: punto de TV adicional.

## Empaquetamiento de servicios
Si el usuario desea añadir internet o TV a su servicio, los empaquetados se solicitan directamente en oficina con su documento.

## Medios de pago
- SuperGiros
- PSE / chat bot (consultas de estado de cuenta y pago en línea)
- Oficinas de Tu Norte
- Apuestas Cúcuta
- SAEPAY: todavía no está implementado.

## Planes y servicios
Se comparten los planes y servicios vigentes de Tu Norte, especificando costos de instalación, aplicables solo a usuarios ordinarios (no subsidiados). Con planes de 700 o 900 Mb se apoya el plus WIN+ o Disney.

- Disney: se solicita al grupo "Administrativo TvNorteCucuta - Alianet" con correo verificado, acceso del usuario y número de abonado.
- WIN+: a través de OS reclamos "cambio de equipo por aumento (WiFi 6) de plan a 700 o 900, instalar WIN".

## Suspensión temporal
La suspensión se realiza por máximo 2 meses. No se tienen en cuenta saldos pendientes, pero se confirma el estado de cuenta actual. Se genera Orden de Servicios – Suspensión indicando el plan tal cual aparece en SAE Plus (ej. "suspensión internet Gpon y TV Gpon"), validando que quede en estado suspendido. La novedad se pasa al grupo "Administrativo TvNorteCucuta - Alianet" nombrando a Floribeth.

Si supera los 3 meses y el usuario conserva el equipo, la reconexión cuesta $15.000 (se carga al estado de cuenta por el grupo administrativo y se reactiva por orden de servicios). Si no tiene el equipo, el costo es de $40.000 a partir de los 3 meses.

## Retiro
El agente valida las causas del retiro. Si es técnico, se genera una visita o se valida el caso. Si es por facturación o ajuste, se remite al grupo administrativo. Otros motivos se transfieren al perfil de TuNorte Cúcuta y se avisa a Floribeth para apoyar la retención o el apoyo en oficina.

Casos donde se entrega información de retiro sin proceso de retención:
- El usuario se va de la ciudad.
- Se traslada a una zona sin cobertura.
- El usuario se encuentra sin empleo.
- Tiene problemas económicos y ningún plan se ajusta a su economía.

## Cambio de plan
Los cambios de plan se realizan del 25 al 30 de cada mes, según la oferta vigente de Tu Norte (planes que empiezan por "plan 25 ftth"). Tras el cambio en SAE Plus se valida que la mensualidad corresponda y se aplica también en Smart. Para 700 o 900 Mb se genera una OS de cambio de equipo a WiFi 6 y se indican las condiciones para WIN o Disney. En el cambio de plan el usuario puede solicitar retirar servicios (ej. de plan Dúo a solo TV o solo internet). No olvidar aplicar la capacidad en Smart.

## Consultas de estado de cuenta
Con los datos del usuario se validan los estados de cuenta y se informa lo que aparece en SAE Plus. Si hay incoherencias, se solicitan comprobantes de pago y se remite el caso al grupo "Administrativo TvNorteCucuta - Alianet".

## Ajuste de factura por falla técnica
Se valida el registro de la OS en SAE Plus, siempre que no exista una OS prefinalizada que impida generar una nueva. Si no se puede generar, el caso técnico se remite al grupo de incidentes y se solicita el descuento una vez resuelta la falla, informando al grupo administrativo los días que corresponden al ajuste.

## Planes corporativos
Se escalan directamente a Floribeth. Se informa al cliente que será remitido al área correspondiente, se transfiere el chat al perfil de Wasapi TuNorte Cúcuta y se notifica por el grupo administrativo.

## Tiempos de respuesta
Espera inicial de 30 minutos; si no hay respuesta se consulta si el usuario sigue en línea y se finaliza la conversación pasada una hora. Puede finalizarse antes si el usuario no requiere escalamiento adicional y está satisfecho. Si el agente termina labores con chats en bandeja, otro agente activo continúa la gestión, apoyándose en el historial del chat sin volver a pedir información ya suministrada. El soporte técnico debe acompañarse de imágenes (ping, dispositivos conectados, topología de red, etc.).

## Finalización de calidad en órdenes técnicas
Cuando un servicio con visita técnica reciente vuelve a fallar antes del seguimiento de calidad, Alianet está autorizada a cerrar la calidad para generar una nueva orden de reclamo y priorizar el servicio, con la observación: "Se cierra sin validación por Orden prefinalizada, servicio en falla". El cierre se hace en SAE Plus – Control de Calidad, buscando por número de abonado y dando clic en Autorizar.

## Programa subsidiado Gobernación (Smart OLT)
Provisionalmente, Alianet apoya el formato de los datos registrados para los servicios del programa subsidiado "Gobernación" hasta que Tu Norte Cúcuta concilie los datos entre SAE Plus y Smart OLT. Debe cuidarse la correspondencia de la zona (ítem tipo "01_GOBERNACION").

## Traslados Gobernación (Régimen Subsidiado)
Los traslados pueden atenderse en oficinas o por Odoo, siempre que tengan todos los datos necesarios. Condiciones informadas al usuario:
- La vivienda a la que se muda debe ser de estrato 1 o 2.
- Debe contar con un recibo público de la vivienda cuando el técnico realice la instalación.
- El costo del traslado es de $20.000, agregados al estado de cuenta.
- Debe estar al día en sus pagos al momento de la solicitud.
- El proceso puede tardar hasta 7 días hábiles.
- También puede solicitarse en cualquiera de las oficinas.

## Suscripción (referencia SAE Plus)
Ejemplo de suscripción mensual: INTERNET GPON (paquete básico) $50.000 y TV GPON (paquete básico), total suscripción $50.000. En el formulario solo se seleccionan los ítems que dicen "plan 25 ftth" y la capacidad deseada por el usuario.
`;

export type KbChunk = { title: string; text: string };

export const KB_CHUNKS: KbChunk[] = MANUAL_TU_NORTE.split(/\n## /)
  .map((block, i) => (i === 0 ? block : `## ${block}`))
  .map((block) => {
    const lines = block.trim().split("\n");
    const title = (lines[0] ?? "").replace(/^#+\s*/, "").trim();
    return { title, text: block.trim() };
  })
  .filter((c) => c.text.length > 40);
