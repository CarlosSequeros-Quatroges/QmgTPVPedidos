import { Injectable, computed, signal } from '@angular/core';

import { Idioma, IDIOMAS_SOPORTADOS } from '../models/carta.models';

/** Idioma disponible en el selector, con su etiqueta y bandera. */
export interface OpcionIdioma {
  codigo: Idioma;
  nombre: string;
  /** Ruta relativa al SVG de la bandera. */
  bandera: string;
}

/** Textos de interfaz (no de contenido) traducidos. */
interface TextosUI {
  // Marca / cabecera
  subtitulo: string;
  cambiarLocal: string;
  abierto: string;
  cerrado: string;
  miCodigo: string;
  enLinea: string;
  sinConexion: string;
  pie: string;
  // Selección de local
  eligeLocal: string;
  cargandoLocales: string;
  sinLocales: string;
  verCarta: string;
  // Selección de carta
  eligeCarta: string;
  cambiarCarta: string;
  verCartas: string;
  // Aviso al cambiar de carta con cesta con productos
  cambiarPierdeCesta: string;
  cambiarIgual: string;
  seguirAqui: string;
  // Carta
  nuestraCarta: string;
  eligeCategoria: string;
  platos: string;
  volverCarta: string;
  alergenos: string;
  sinAlergenos: string;
  cargando: string;
  errorCarga: string;
  familiaNoEncontrada: string;
  platoNoEncontrado: string;
  // Horario
  fueraDeHorario: string;
  puedesConsultar: string;
  abrePedidos: string;
  // Detalle / extras
  extras: string;
  anadir: string;
  quitar: string;
  con: string;
  sin: string;
  notaCocina: string;
  notaPlaceholder: string;
  cantidad: string;
  anadirCesta: string;
  anadido: string;
  // Cesta
  tuPedido: string;
  cestaVacia: string;
  seguirComprando: string;
  total: string;
  tramitar: string;
  eliminar: string;
  nota: string;
  // Checkout
  // Punto de pedido (zona/punto)
  puntoPedido: string;
  zona: string;
  punto: string;
  eligeZona: string;
  eligePunto: string;
  cambiarPunto: string;
  // Pago
  formaPago: string;
  efectivo: string;
  tarjeta: string;
  cargoHabitacion: string;
  registraCodigo: string;
  comprobarSaldo: string;
  saldoDisponible: string;
  saldoInsuficiente: string;
  codigoInvalido: string;
  cargoOk: string;
  confirmarPedido: string;
  avisoPago: string;
  // Confirmación
  pedidoRecibido: string;
  numeroPedido: string;
  pagaras: string;
  graciasPedido: string;
  // Registro de código
  codigoTitulo: string;
  codigoTexto: string;
  codigoPlaceholder: string;
  guardar: string;
  borrar: string;
  codigoActivo: string;
  sinCodigo: string;
  clienteNoRegistrado: string;
  habitacion: string;
  validando: string;
}

/** Nombre nativo de cada idioma soportado (para el selector). */
const NOMBRES: Record<Idioma, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
};

const UI: Record<Idioma, TextosUI> = {
  es: {
    subtitulo: 'Pedidos',
    cambiarLocal: 'Cambiar',
    abierto: 'Abierto',
    cerrado: 'Cerrado',
    miCodigo: 'Mi código',
    enLinea: 'En línea',
    sinConexion: 'Sin conexión',
    pie: 'Sistema de pedidos · datos ficticios · QUATROGES 2026',
    eligeLocal: '¿Dónde quieres pedir?',
    cargandoLocales: 'Cargando locales…',
    sinLocales: 'No hay locales disponibles.',
    verCarta: 'Ver carta',
    eligeCarta: 'Elige una carta',
    cambiarCarta: 'Cambiar carta',
    verCartas: 'Ver todas las cartas',
    cambiarPierdeCesta:
      'Tienes productos en la cesta. Si cambias de carta los perderás.',
    cambiarIgual: 'Cambiar de todas formas',
    seguirAqui: 'Seguir aquí',
    nuestraCarta: 'Nuestra carta',
    eligeCategoria: 'Elige una categoría',
    platos: 'platos',
    volverCarta: 'Volver a la carta',
    alergenos: 'Alérgenos',
    sinAlergenos: 'Sin alérgenos declarados.',
    cargando: 'Cargando…',
    errorCarga: 'No se pudo cargar la carta.',
    familiaNoEncontrada: 'Familia no encontrada.',
    platoNoEncontrado: 'Plato no encontrado.',
    fueraDeHorario: 'Fuera de horario de pedidos',
    puedesConsultar: 'Puedes consultar la carta; ahora no se pueden hacer pedidos.',
    abrePedidos: 'Los pedidos abren a las',
    extras: 'Extras',
    anadir: 'Añadir',
    quitar: 'Quitar',
    con: 'Con',
    sin: 'Sin',
    notaCocina: 'Nota para cocina',
    notaPlaceholder: 'Ej: poco hecho, sin sal…',
    cantidad: 'Cantidad',
    anadirCesta: 'Añadir a la cesta',
    anadido: 'Añadido a la cesta',
    tuPedido: 'Tu pedido',
    cestaVacia: 'Tu cesta está vacía.',
    seguirComprando: 'Seguir mirando la carta',
    total: 'Total',
    tramitar: 'Tramitar pedido',
    eliminar: 'Eliminar',
    nota: 'Nota',
    puntoPedido: '¿Dónde lo servimos?',
    zona: 'Zona',
    punto: 'Punto',
    eligeZona: 'Elige una zona',
    eligePunto: 'Elige un punto',
    cambiarPunto: 'Cambiar',
    formaPago: 'Forma de pago',
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    cargoHabitacion: 'Cargo a la habitación',
    registraCodigo:
      'Registra tu código de cliente para pagar con cargo a la habitación.',
    comprobarSaldo: 'Comprobar saldo',
    saldoDisponible: 'Saldo disponible',
    saldoInsuficiente: 'Saldo insuficiente',
    codigoInvalido: 'Código no válido',
    cargoOk: 'Cargo disponible',
    confirmarPedido: 'Confirmar pedido',
    avisoPago: 'El camarero verá cómo vas a pagar al entregar el pedido.',
    pedidoRecibido: '¡Pedido recibido!',
    numeroPedido: 'Nº de pedido',
    pagaras: 'Pagarás con',
    graciasPedido: 'Gracias, tu pedido está en camino.',
    codigoTitulo: 'Código de cliente',
    codigoTexto:
      'Introduce el código que te dieron en recepción para cargar pedidos a tu habitación.',
    codigoPlaceholder: 'Ej: HAB101',
    guardar: 'Guardar',
    borrar: 'Borrar código',
    codigoActivo: 'Código registrado',
    sinCodigo: 'Sin código',
    clienteNoRegistrado: 'Cliente no registrado',
    habitacion: 'Habitación',
    validando: 'Validando…',
  },
  en: {
    subtitulo: 'Orders',
    cambiarLocal: 'Change',
    abierto: 'Open',
    cerrado: 'Closed',
    miCodigo: 'My code',
    enLinea: 'Online',
    sinConexion: 'Offline',
    pie: 'Ordering system · sample data · QUATROGES 2026',
    eligeLocal: 'Where would you like to order?',
    cargandoLocales: 'Loading venues…',
    sinLocales: 'No venues available.',
    verCarta: 'View menu',
    eligeCarta: 'Choose a menu',
    cambiarCarta: 'Change menu',
    verCartas: 'See all menus',
    cambiarPierdeCesta:
      'You have items in your cart. If you switch menu you will lose them.',
    cambiarIgual: 'Switch anyway',
    seguirAqui: 'Stay here',
    nuestraCarta: 'Our menu',
    eligeCategoria: 'Choose a category',
    platos: 'dishes',
    volverCarta: 'Back to the menu',
    alergenos: 'Allergens',
    sinAlergenos: 'No declared allergens.',
    cargando: 'Loading…',
    errorCarga: 'The menu could not be loaded.',
    familiaNoEncontrada: 'Category not found.',
    platoNoEncontrado: 'Dish not found.',
    fueraDeHorario: 'Outside ordering hours',
    puedesConsultar: 'You can browse the menu; ordering is closed right now.',
    abrePedidos: 'Ordering opens at',
    extras: 'Extras',
    anadir: 'Add',
    quitar: 'Remove',
    con: 'With',
    sin: 'Without',
    notaCocina: 'Note for the kitchen',
    notaPlaceholder: 'e.g. well done, no salt…',
    cantidad: 'Quantity',
    anadirCesta: 'Add to cart',
    anadido: 'Added to cart',
    tuPedido: 'Your order',
    cestaVacia: 'Your cart is empty.',
    seguirComprando: 'Keep browsing the menu',
    total: 'Total',
    tramitar: 'Check out',
    eliminar: 'Remove',
    nota: 'Note',
    puntoPedido: 'Where shall we serve it?',
    zona: 'Zone',
    punto: 'Spot',
    eligeZona: 'Choose a zone',
    eligePunto: 'Choose a spot',
    cambiarPunto: 'Change',
    formaPago: 'Payment method',
    efectivo: 'Cash',
    tarjeta: 'Card',
    cargoHabitacion: 'Charge to room',
    registraCodigo: 'Register your guest code to charge orders to your room.',
    comprobarSaldo: 'Check balance',
    saldoDisponible: 'Available balance',
    saldoInsuficiente: 'Insufficient balance',
    codigoInvalido: 'Invalid code',
    cargoOk: 'Charge available',
    confirmarPedido: 'Confirm order',
    avisoPago: 'The waiter will see how you plan to pay when they bring the order.',
    pedidoRecibido: 'Order received!',
    numeroPedido: 'Order no.',
    pagaras: 'You will pay with',
    graciasPedido: 'Thank you, your order is on its way.',
    codigoTitulo: 'Guest code',
    codigoTexto:
      'Enter the code you were given at reception to charge orders to your room.',
    codigoPlaceholder: 'e.g. HAB101',
    guardar: 'Save',
    borrar: 'Remove code',
    codigoActivo: 'Code registered',
    sinCodigo: 'No code',
    clienteNoRegistrado: 'Guest not registered',
    habitacion: 'Room',
    validando: 'Checking…',
  },
  fr: {
    subtitulo: 'Commandes',
    cambiarLocal: 'Changer',
    abierto: 'Ouvert',
    cerrado: 'Fermé',
    miCodigo: 'Mon code',
    enLinea: 'En ligne',
    sinConexion: 'Hors ligne',
    pie: 'Système de commandes · données fictives · QUATROGES 2026',
    eligeLocal: 'Où souhaitez-vous commander ?',
    cargandoLocales: 'Chargement des points de vente…',
    sinLocales: 'Aucun point de vente disponible.',
    verCarta: 'Voir la carte',
    eligeCarta: 'Choisissez une carte',
    cambiarCarta: 'Changer de carte',
    verCartas: 'Voir toutes les cartes',
    cambiarPierdeCesta:
      'Vous avez des articles dans le panier. Si vous changez de carte, vous les perdrez.',
    cambiarIgual: 'Changer quand même',
    seguirAqui: 'Rester ici',
    nuestraCarta: 'Notre carte',
    eligeCategoria: 'Choisissez une catégorie',
    platos: 'plats',
    volverCarta: 'Retour à la carte',
    alergenos: 'Allergènes',
    sinAlergenos: 'Aucun allergène déclaré.',
    cargando: 'Chargement…',
    errorCarga: 'Impossible de charger la carte.',
    familiaNoEncontrada: 'Catégorie introuvable.',
    platoNoEncontrado: 'Plat introuvable.',
    fueraDeHorario: 'Hors des horaires de commande',
    puedesConsultar:
      'Vous pouvez consulter la carte ; les commandes sont fermées.',
    abrePedidos: 'Les commandes ouvrent à',
    extras: 'Suppléments',
    anadir: 'Ajouter',
    quitar: 'Retirer',
    con: 'Avec',
    sin: 'Sans',
    notaCocina: 'Note pour la cuisine',
    notaPlaceholder: 'Ex : bien cuit, sans sel…',
    cantidad: 'Quantité',
    anadirCesta: 'Ajouter au panier',
    anadido: 'Ajouté au panier',
    tuPedido: 'Votre commande',
    cestaVacia: 'Votre panier est vide.',
    seguirComprando: 'Continuer à parcourir la carte',
    total: 'Total',
    tramitar: 'Valider la commande',
    eliminar: 'Supprimer',
    nota: 'Note',
    puntoPedido: 'Où le servons-nous ?',
    zona: 'Zone',
    punto: 'Emplacement',
    eligeZona: 'Choisissez une zone',
    eligePunto: 'Choisissez un emplacement',
    cambiarPunto: 'Changer',
    formaPago: 'Mode de paiement',
    efectivo: 'Espèces',
    tarjeta: 'Carte',
    cargoHabitacion: 'Sur la note de chambre',
    registraCodigo:
      'Enregistrez votre code client pour imputer les commandes à votre chambre.',
    comprobarSaldo: 'Vérifier le solde',
    saldoDisponible: 'Solde disponible',
    saldoInsuficiente: 'Solde insuffisant',
    codigoInvalido: 'Code non valide',
    cargoOk: 'Imputation possible',
    confirmarPedido: 'Confirmer la commande',
    avisoPago: 'Le serveur verra votre mode de paiement à la livraison.',
    pedidoRecibido: 'Commande reçue !',
    numeroPedido: 'Commande n°',
    pagaras: 'Vous paierez par',
    graciasPedido: 'Merci, votre commande arrive.',
    codigoTitulo: 'Code client',
    codigoTexto:
      'Saisissez le code remis à la réception pour imputer vos commandes à la chambre.',
    codigoPlaceholder: 'Ex : HAB101',
    guardar: 'Enregistrer',
    borrar: 'Effacer le code',
    codigoActivo: 'Code enregistré',
    sinCodigo: 'Sans code',
    clienteNoRegistrado: 'Client non enregistré',
    habitacion: 'Chambre',
    validando: 'Vérification…',
  },
  de: {
    subtitulo: 'Bestellungen',
    cambiarLocal: 'Wechseln',
    abierto: 'Geöffnet',
    cerrado: 'Geschlossen',
    miCodigo: 'Mein Code',
    enLinea: 'Online',
    sinConexion: 'Offline',
    pie: 'Bestellsystem · Beispieldaten · QUATROGES 2026',
    eligeLocal: 'Wo möchten Sie bestellen?',
    cargandoLocales: 'Lokale werden geladen…',
    sinLocales: 'Keine Lokale verfügbar.',
    verCarta: 'Karte ansehen',
    eligeCarta: 'Karte wählen',
    cambiarCarta: 'Karte wechseln',
    verCartas: 'Alle Karten ansehen',
    cambiarPierdeCesta:
      'Sie haben Artikel im Warenkorb. Wenn Sie die Karte wechseln, gehen sie verloren.',
    cambiarIgual: 'Trotzdem wechseln',
    seguirAqui: 'Hier bleiben',
    nuestraCarta: 'Unsere Karte',
    eligeCategoria: 'Wählen Sie eine Kategorie',
    platos: 'Gerichte',
    volverCarta: 'Zurück zur Karte',
    alergenos: 'Allergene',
    sinAlergenos: 'Keine deklarierten Allergene.',
    cargando: 'Wird geladen…',
    errorCarga: 'Die Karte konnte nicht geladen werden.',
    familiaNoEncontrada: 'Kategorie nicht gefunden.',
    platoNoEncontrado: 'Gericht nicht gefunden.',
    fueraDeHorario: 'Außerhalb der Bestellzeiten',
    puedesConsultar:
      'Sie können die Karte ansehen; Bestellungen sind gerade geschlossen.',
    abrePedidos: 'Bestellungen öffnen um',
    extras: 'Extras',
    anadir: 'Hinzufügen',
    quitar: 'Entfernen',
    con: 'Mit',
    sin: 'Ohne',
    notaCocina: 'Notiz für die Küche',
    notaPlaceholder: 'z. B. durchgebraten, ohne Salz…',
    cantidad: 'Menge',
    anadirCesta: 'In den Warenkorb',
    anadido: 'Zum Warenkorb hinzugefügt',
    tuPedido: 'Ihre Bestellung',
    cestaVacia: 'Ihr Warenkorb ist leer.',
    seguirComprando: 'Weiter in der Karte stöbern',
    total: 'Gesamt',
    tramitar: 'Zur Kasse',
    eliminar: 'Entfernen',
    nota: 'Notiz',
    puntoPedido: 'Wohin sollen wir servieren?',
    zona: 'Zone',
    punto: 'Platz',
    eligeZona: 'Zone wählen',
    eligePunto: 'Platz wählen',
    cambiarPunto: 'Ändern',
    formaPago: 'Zahlungsart',
    efectivo: 'Bar',
    tarjeta: 'Karte',
    cargoHabitacion: 'Auf die Zimmerrechnung',
    registraCodigo:
      'Registrieren Sie Ihren Gästecode, um Bestellungen aufs Zimmer zu buchen.',
    comprobarSaldo: 'Guthaben prüfen',
    saldoDisponible: 'Verfügbares Guthaben',
    saldoInsuficiente: 'Nicht genügend Guthaben',
    codigoInvalido: 'Ungültiger Code',
    cargoOk: 'Buchung möglich',
    confirmarPedido: 'Bestellung bestätigen',
    avisoPago: 'Der Kellner sieht bei der Lieferung, wie Sie zahlen möchten.',
    pedidoRecibido: 'Bestellung erhalten!',
    numeroPedido: 'Bestell-Nr.',
    pagaras: 'Sie zahlen mit',
    graciasPedido: 'Danke, Ihre Bestellung ist unterwegs.',
    codigoTitulo: 'Gästecode',
    codigoTexto:
      'Geben Sie den Code von der Rezeption ein, um Bestellungen aufs Zimmer zu buchen.',
    codigoPlaceholder: 'z. B. HAB101',
    guardar: 'Speichern',
    borrar: 'Code löschen',
    codigoActivo: 'Code registriert',
    sinCodigo: 'Kein Code',
    clienteNoRegistrado: 'Gast nicht registriert',
    habitacion: 'Zimmer',
    validando: 'Wird geprüft…',
  },
};

const STORAGE_KEY = 'pedidos.idioma';

/**
 * Gestiona el idioma activo y los idiomas disponibles.
 *
 * Los idiomas disponibles los declara la empresa (`getLocales.idiomas`) y se
 * filtran a los que la app tiene traducidos, respetando el orden recibido. El
 * idioma activo se persiste; al cambiarlo, interfaz y contenido reaccionan en
 * caliente. La bandera de cada idioma es `img/banderas/{codigo}.svg`.
 */
@Injectable({ providedIn: 'root' })
export class IdiomaService {
  /** Idiomas de la empresa (subconjunto soportado), en el orden de la API. */
  private readonly _idiomas = signal<Idioma[]>([...IDIOMAS_SOPORTADOS]);
  /** Orden COMPLETO de idiomas de la empresa (para mapear los slots de texto). */
  private readonly _idiomasEmpresa = signal<string[]>([...IDIOMAS_SOPORTADOS]);
  private readonly _idioma = signal<Idioma>(this.leerInicial());

  /**
   * Índice (0-based) del idioma activo dentro de los idiomas de la empresa.
   * Determina qué slot de texto (`nombre1..4`) mostrar.
   */
  readonly slot = computed(() => {
    const i = this._idiomasEmpresa().indexOf(this._idioma());
    return i >= 0 ? i : 0;
  });

  /**
   * Índice del slot de un idioma concreto (p. ej. `'es'` para la descripción de
   * cocina en la comanda). Si no está en los idiomas de la empresa, devuelve 0.
   */
  slotDe(idioma: string): number {
    const i = this._idiomasEmpresa().indexOf(idioma);
    return i >= 0 ? i : 0;
  }

  /** Opciones del selector: código, nombre nativo y bandera. */
  readonly opciones = computed<OpcionIdioma[]>(() =>
    this._idiomas().map((c) => ({
      codigo: c,
      nombre: NOMBRES[c],
      bandera: `img/banderas/${c}.svg`,
    })),
  );

  /** Idioma activo. */
  readonly idioma = this._idioma.asReadonly();

  /** Textos de interfaz para el idioma activo. */
  readonly txt = computed(() => UI[this._idioma()]);

  /**
   * Configura los idiomas disponibles a partir de los que declara la empresa.
   * Se quedan los que la app tiene traducidos, en el orden recibido. Si el
   * idioma activo deja de estar disponible, se pasa al primero.
   */
  configurar(idiomas: string[]): void {
    const disponibles = idiomas.filter((c): c is Idioma =>
      (IDIOMAS_SOPORTADOS as readonly string[]).includes(c),
    );
    if (!disponibles.length) return;
    // El orden completo mapea los slots de texto; la lista filtrada, el selector.
    this._idiomasEmpresa.set(idiomas);
    this._idiomas.set(disponibles);
    if (!disponibles.includes(this._idioma())) {
      this.cambiar(disponibles[0]);
    }
  }

  cambiar(idioma: Idioma): void {
    this._idioma.set(idioma);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = idioma;
    }
    try {
      localStorage.setItem(STORAGE_KEY, idioma);
    } catch {
      /* localStorage puede no estar disponible */
    }
  }

  private leerInicial(): Idioma {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado && (IDIOMAS_SOPORTADOS as readonly string[]).includes(guardado)) {
        return guardado as Idioma;
      }
    } catch {
      /* ignore */
    }
    return 'es';
  }
}
