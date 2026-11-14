// Store réactif et persistant avec localStorage pour FasoLogis
class FasoLogisStore {
  constructor() {
    this.STORAGE_KEY = "fasologis_properties_v1";
    this.VISITS_KEY = "fasologis_visits_v1";
    this.FAVORITES_KEY = "fasologis_favorites_v1";
    this.PAYMENTS_KEY = "fasologis_payments_v1";
    this.init();
  }

  init() {
    // Si aucun logement n'est stocké, on charge les données initiales
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const initial = window.INITIAL_PROPERTIES || [];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initial));
    }
    if (!localStorage.getItem(this.VISITS_KEY)) {
      const initialVisits = [
        {
          id: "VIS-101",
          propertyId: "BF-101",
          propertyTitle: "Magnifique Villa F4 avec grand jardin et garage",
          fullName: "Moussa Sanogo",
          phone: "+22670112233",
          preferredDate: "2026-11-18",
          timeSlot: "Matin (09h - 12h)",
          status: "pending",
          createdAt: "2026-11-13T10:15:00Z"
        }
      ];
      localStorage.setItem(this.VISITS_KEY, JSON.stringify(initialVisits));
    }
    if (!localStorage.getItem(this.FAVORITES_KEY)) {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.PAYMENTS_KEY)) {
      const initialPayments = [
        {
          id: "PAY-901",
          propertyId: "BF-107",
          propertyTitle: "Appartement standing 3 pièces (2 chambres salon)",
          contactName: "Démarcheur Karim Ouédraogo",
          phone: "+22678009988",
          planId: "plan-single",
          planName: "Annonce Unitaire",
          amount: 2500,
          method: "Orange Money",
          transactionRef: "OM-BF-89342918",
          status: "pending", // pending, approved, rejected
          createdAt: "2026-11-13T16:20:00Z"
        }
      ];
      localStorage.setItem(this.PAYMENTS_KEY, JSON.stringify(initialPayments));
    }
  }

  // --- LOGEMENTS ---
  getAllProperties(includeUnapproved = false) {
    try {
      const items = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
      if (includeUnapproved) return items;
      return items.filter(p => p.status === "approved");
    } catch (e) {
      console.error("Erreur de lecture des logements", e);
      return [];
    }
  }

  getPropertyById(id) {
    const all = this.getAllProperties(true);
    return all.find(p => p.id === id);
  }

  incrementViews(id) {
    const all = this.getAllProperties(true);
    const item = all.find(p => p.id === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    }
  }

  addProperty(propertyData) {
    const all = this.getAllProperties(true);
    const newId = "BF-" + (100 + all.length + 1);
    const newProperty = {
      id: newId,
      ...propertyData,
      status: "pending", // Toute annonce soumise passe par modération
      postedDate: new Date().toISOString().split("T")[0],
      views: 0
    };
    all.unshift(newProperty);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    return newProperty;
  }

  updatePropertyStatus(id, newStatus) {
    const all = this.getAllProperties(true);
    const property = all.find(p => p.id === id);
    if (property) {
      property.status = newStatus;
      if (newStatus === "approved") {
        property.verified = true;
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      return true;
    }
    return false;
  }

  deleteProperty(id) {
    let all = this.getAllProperties(true);
    all = all.filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    return true;
  }

  // --- FILTRES & RECHERCHE ---
  filterProperties(criteria = {}) {
    let list = this.getAllProperties(false);

    if (criteria.city && criteria.city !== "Toutes") {
      list = list.filter(p => p.city.toLowerCase() === criteria.city.toLowerCase());
    }

    if (criteria.neighborhood && criteria.neighborhood !== "Tous les quartiers") {
      list = list.filter(p => p.neighborhood.toLowerCase() === criteria.neighborhood.toLowerCase());
    }

    if (criteria.type && criteria.type !== "all") {
      list = list.filter(p => p.type === criteria.type);
    }

    if (criteria.maxPrice && Number(criteria.maxPrice) > 0) {
      list = list.filter(p => p.price <= Number(criteria.maxPrice));
    }

    if (criteria.minPrice && Number(criteria.minPrice) > 0) {
      list = list.filter(p => p.price >= Number(criteria.minPrice));
    }

    if (criteria.water && criteria.water !== "all") {
      list = list.filter(p => p.water === criteria.water);
    }

    if (criteria.electricity && criteria.electricity !== "all") {
      list = list.filter(p => p.electricity === criteria.electricity);
    }

    if (criteria.goudronOnly) {
      list = list.filter(p => p.goudronDistance.toLowerCase().includes("sur") || p.goudronDistance.toLowerCase().includes("bitumée"));
    }

    if (criteria.garageOnly) {
      list = list.filter(p => p.amenities.some(a => a.toLowerCase().includes("garage") || a.toLowerCase().includes("parking")));
    }

    if (criteria.climOnly) {
      list = list.filter(p => p.amenities.some(a => a.toLowerCase().includes("climatisation") || a.toLowerCase().includes("split")));
    }

    if (criteria.keyword && criteria.keyword.trim() !== "") {
      const q = criteria.keyword.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q)
      );
    }

    // Tri
    if (criteria.sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (criteria.sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else {
      // Plus récents d'abord
      list.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    }

    return list;
  }

  // --- VISITES ---
  getVisits() {
    try {
      return JSON.parse(localStorage.getItem(this.VISITS_KEY)) || [];
    } catch {
      return [];
    }
  }

  addVisit(visitData) {
    const visits = this.getVisits();
    const newVisit = {
      id: "VIS-" + Math.floor(100 + Math.random() * 900),
      ...visitData,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    visits.unshift(newVisit);
    localStorage.setItem(this.VISITS_KEY, JSON.stringify(visits));
    return newVisit;
  }

  updateVisitStatus(id, newStatus) {
    const visits = this.getVisits();
    const visit = visits.find(v => v.id === id);
    if (visit) {
      visit.status = newStatus;
      localStorage.setItem(this.VISITS_KEY, JSON.stringify(visits));
      return true;
    }
    return false;
  }

  // --- PAIEMENTS MOBILE MONEY ---
  getPayments() {
    try {
      return JSON.parse(localStorage.getItem(this.PAYMENTS_KEY)) || [];
    } catch {
      return [];
    }
  }

  addPayment(paymentData) {
    const payments = this.getPayments();
    const newPayment = {
      id: "PAY-" + Math.floor(100 + Math.random() * 900),
      ...paymentData,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    payments.unshift(newPayment);
    localStorage.setItem(this.PAYMENTS_KEY, JSON.stringify(payments));
    return newPayment;
  }

  updatePaymentStatus(id, newStatus) {
    const payments = this.getPayments();
    const payment = payments.find(p => p.id === id);
    if (payment) {
      payment.status = newStatus;
      localStorage.setItem(this.PAYMENTS_KEY, JSON.stringify(payments));
      return true;
    }
    return false;
  }

  // --- FAVORIS ---
  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(this.FAVORITES_KEY)) || [];
    } catch {
      return [];
    }
  }

  toggleFavorite(propertyId) {
    let favs = this.getFavorites();
    const index = favs.indexOf(propertyId);
    if (index > -1) {
      favs.splice(index, 1);
    } else {
      favs.push(propertyId);
    }
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favs));
    return favs.includes(propertyId);
  }

  isFavorite(propertyId) {
    return this.getFavorites().includes(propertyId);
  }

  // Réinitialiser les données aux paramètres d'usine
  resetToDefault() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(window.INITIAL_PROPERTIES || []));
    this.init();
  }
}

// Instance globale exportée
window.appStore = new FasoLogisStore();
