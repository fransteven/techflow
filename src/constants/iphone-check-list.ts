export type ValidationPhase = {
  id: string;
  title: string;
  description: string;
  items: ValidationItem[];
};

export type ValidationItem = {
  id: string;
  label: string;
  shortDesc: string;
  fullProtocol: string;
  isCritical: boolean; // Si falla, se rechaza el equipo inmediatamente
  type: 'toggle' | 'input' | 'link';
  link?: string;
  inputPlaceholder?: string;
};

export const IPHONE_VALIDATION_PHASES: ValidationPhase[] = [
  {
    id: 'phase-1-legal',
    title: 'Fase 1: Filtro Legal y Restricciones',
    description: 'Validación de procedencia, bloqueos y propiedad.',
    items: [
      {
        id: 'model-check',
        label: 'Modelo (iPhone 13 en adelante)',
        shortDesc: 'Validar en Configuración > General > Información.',
        fullProtocol: 'Ir a Configuración > General > Información. Validar el modelo exacto. Equipos serie 12 o inferiores se rechazan automáticamente por política de inventario.',
        isCritical: true,
        type: 'toggle',
      },
      {
        id: 'invoice-check',
        label: 'Factura y Equipos a Cuotas (15+)',
        shortDesc: 'Obligatorio para Serie 15 en adelante.',
        fullProtocol: 'Para iPhone 15 en adelante, exigir factura original. Buscar términos: "Pago de Contado", "Total Pagado" o saldo $0. Rechazar si dice "Plan de Pagos", "Financiado" o "24 cuotas".',
        isCritical: true,
        type: 'toggle',
      },
      {
        id: 'imei-match',
        label: 'Cruce de Datos (Factura vs Pantalla)',
        shortDesc: 'Digitar *#06# y comparar.',
        fullProtocol: 'Digitar *#06# en el teclado numérico. El IMEI en pantalla debe coincidir exactamente con el impreso en la factura física.',
        isCritical: true,
        type: 'toggle',
      },
      {
        id: 'srtm-check',
        label: 'Verificación SRTM (Lista Negra)',
        shortDesc: 'Consultar estado en base de datos oficial.',
        fullProtocol: 'Ingresar el IMEI en la página oficial de la Policía Nacional / SRTM de Colombia. El estado debe ser "LIMPIO".',
        isCritical: true,
        type: 'link',
        link: 'https://www.imeicolombia.com.co/',
      },
      {
        id: 'imei-input',
        label: 'Registro de IMEI',
        shortDesc: 'Digitar IMEI para el reporte.',
        fullProtocol: 'Ingrese los 15 dígitos del IMEI principal del equipo.',
        isCritical: false,
        type: 'input',
        inputPlaceholder: 'Ej: 3587XXXXXXXXXXX',
      },
      {
        id: 'icloud-lock',
        label: 'Ausencia de Cuentas iCloud',
        shortDesc: 'Restablecer frente al empleado.',
        fullProtocol: 'El cliente debe borrar el equipo (General > Transferir o Restablecer). El iPhone debe llegar a la pantalla "Hola" y permitir configurar sin pedir ID previo.',
        isCritical: true,
        type: 'toggle',
      },
    ],
  },
  {
    id: 'phase-2-hardware',
    title: 'Fase 2: Diagnóstico de Hardware',
    description: 'Pruebas físicas de componentes integrados.',
    items: [
      {
        id: 'screen-check',
        label: 'Pantalla y True Tone',
        shortDesc: 'Validar autenticidad del display.',
        fullProtocol: '1. True Tone: Centro de Control > Brillo (presión fuerte). Debe aparecer el ícono True Tone. 2. Táctil: Arrastrar un ícono por toda la pantalla sin que se suelte.',
        isCritical: true,
        type: 'toggle',
      },
      {
        id: 'camera-check',
        label: 'Módulo de Cámaras (Lentes Reales)',
        shortDesc: 'Aislar 0.5x, 1x y Zoom.',
        fullProtocol: 'Seleccionar lente (3x/5x) y tapar físicamente con el dedo. Si hay imagen, es zoom digital falso (lente real dañado). Grabar video alternando lentes.',
        isCritical: false,
        type: 'toggle',
      },
      {
        id: 'mic-check',
        label: 'Aislamiento de Micrófonos (3)',
        shortDesc: 'Inferior, Frontal y Trasero.',
        fullProtocol: '1. Notas de voz (Inferior). 2. Video Selfie (Frontal). 3. Video cámara principal (Trasero). Reproducir y confirmar audio nítido.',
        isCritical: false,
        type: 'toggle',
      },
      {
        id: 'speakers-check',
        label: 'Bocinas Estéreo Duales',
        shortDesc: 'Tapar bocina inferior para probar auricular.',
        fullProtocol: 'Reproducir música fuerte. Tapar bocina derecha inferior. El sonido debe seguir claro por el auricular superior.',
        isCritical: false,
        type: 'toggle',
      },
      {
        id: 'faceid-check',
        label: 'Face ID / Biometría',
        shortDesc: 'Intentar registro de nuevo rostro.',
        fullProtocol: 'Configuración > Face ID. Si hay error inmediato o "Face ID no disponible", el sensor está dañado por golpe o humedad.',
        isCritical: true,
        type: 'toggle',
      },
    ],
  },
  {
    id: 'phase-3-connectivity',
    title: 'Fase 3: Conectividad y Desgaste',
    description: 'Estado final de radiofrecuencia y batería.',
    items: [
      {
        id: 'baseband-check',
        label: 'Prueba de Señal (Baseband)',
        shortDesc: 'Llamada real sin Wi-Fi.',
        fullProtocol: 'Insertar SIM de la tienda. Apagar Wi-Fi. Hacer llamada de 30 segundos y navegar en Safari para validar el módem.',
        isCritical: true,
        type: 'toggle',
      },
      {
        id: 'lci-check',
        label: 'Detector de Humedad (LCI)',
        shortDesc: 'Inspeccionar ranura SIM con linterna.',
        fullProtocol: 'Retirar bandeja SIM. Alumbrar ranura. Blanco/Plata = OK. Rojo = Equipo mojado (Rechazo Inmediato).',
        isCritical: true,
        type: 'toggle',
      },
      {
        id: 'battery-check',
        label: 'Salud de Batería (%)',
        shortDesc: 'Registrar capacidad máxima.',
        fullProtocol: 'Configuración > Batería > Condición y recarga. Anotar el porcentaje exacto.',
        isCritical: false,
        type: 'input',
        inputPlaceholder: 'Ej: 87',
      },
    ],
  },
];
