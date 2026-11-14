// Logique principale de l'application FasoLogis — Inspiré du Design System Airbnb
document.addEventListener("DOMContentLoaded", () => {
  // Références DOM
  const citySelect = document.getElementById("search-city");
  const neighborhoodSelect = document.getElementById("search-neighborhood");
  const typeSelect = document.getElementById("search-type");
  const maxPriceInput = document.getElementById("search-max-price");
  const keywordInput = document.getElementById("search-keyword");
  const sortSelect = document.getElementById("sort-select");
  const propertiesGrid = document.getElementById("properties-grid");
  const resultsCount = document.getElementById("results-count");

  // Filtres actifs
  let currentFilters = {
    city: "Toutes",
    neighborhood: "Tous les quartiers",
    type: "all",
    maxPrice: null,
    keyword: "",
    sortBy: "newest",
    goudronOnly: false,
    forageOnly: false,
    cashpowerIndivOnly: false,
    climOnly: false,
    garageOnly: false,
    categoryTag: "all"
  };

  // --- INITIALISATION DES VILLES & QUARTIERS ---
  function initLocationSelectors() {
    const locations = window.BURKINA_LOCATIONS || {};
    if (citySelect) {
      citySelect.innerHTML = `<option value="Toutes">Toutes les villes</option>` +
        Object.keys(locations).map(city => `<option value="${city}">${city}</option>`).join("");
      
      citySelect.addEventListener("change", (e) => {
        updateNeighborhoodOptions(e.target.value, neighborhoodSelect);
        currentFilters.city = e.target.value;
        currentFilters.neighborhood = "Tous les quartiers";
        renderProperties();
      });
    }

    const publishCitySelect = document.getElementById("pub-city");
    const publishNeighborhoodSelect = document.getElementById("pub-neighborhood");
    if (publishCitySelect && publishNeighborhoodSelect) {
      publishCitySelect.innerHTML = `<option value="">Sélectionner la ville</option>` +
        Object.keys(locations).map(city => `<option value="${city}">${city}</option>`).join("");
      
      publishCitySelect.addEventListener("change", (e) => {
        updateNeighborhoodOptions(e.target.value, publishNeighborhoodSelect, false);
      });
    }
  }

  function updateNeighborhoodOptions(selectedCity, targetSelect, includeAll = true) {
    if (!targetSelect) return;
    const locations = window.BURKINA_LOCATIONS || {};
    if (!selectedCity || selectedCity === "Toutes") {
      targetSelect.innerHTML = includeAll 
        ? `<option value="Tous les quartiers">Tous les quartiers</option>`
        : `<option value="">Sélectionner d'abord la ville</option>`;
      targetSelect.disabled = true;
      return;
    }

    const neighborhoods = locations[selectedCity] || [];
    targetSelect.disabled = false;
    targetSelect.innerHTML = neighborhoods.map(n => `<option value="${n}">${n}</option>`).join("");
  }

  // --- FORMATTAGE MONNAIE FCFA ---
  window.formatFCFA = function(amount) {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  // --- AFFICHAGE DES ANNONCES (AIRBNB STYLE CARDS) ---
  function renderProperties() {
    if (!propertiesGrid) return;

    let list = window.appStore.filterProperties(currentFilters);

    // Filtre additionnel par catégorie Airbnb
    if (currentFilters.categoryTag && currentFilters.categoryTag !== "all") {
      const tag = currentFilters.categoryTag;
      if (tag === "villa") list = list.filter(p => p.type === "villa");
      else if (tag === "appartement") list = list.filter(p => p.type === "appartement");
      else if (tag === "maison_basse") list = list.filter(p => p.type === "maison_basse");
      else if (tag === "celibatorium") list = list.filter(p => p.type === "celibatorium");
      else if (tag === "goudron") list = list.filter(p => p.goudronDistance.toLowerCase().includes("sur") || p.goudronDistance.toLowerCase().includes("bitumée"));
      else if (tag === "forage") list = list.filter(p => p.water === "forage" || p.waterDetail?.toLowerCase().includes("forage"));
      else if (tag === "cashpower") list = list.filter(p => p.electricity === "cashpower_indiv");
      else if (tag === "clim") list = list.filter(p => p.amenities.some(a => a.toLowerCase().includes("climatisation") || a.toLowerCase().includes("split")));
      else if (tag === "garage") list = list.filter(p => p.amenities.some(a => a.toLowerCase().includes("garage") || a.toLowerCase().includes("parking")));
    }

    if (resultsCount) {
      resultsCount.textContent = `${list.length} logement${list.length > 1 ? 's' : ''} au Burkina Faso`;
    }

    if (list.length === 0) {
      propertiesGrid.innerHTML = `
        <div class="col-span-full py-20 text-center bg-white rounded-3xl border border-[#ebebeb] p-8 max-w-xl mx-auto my-8">
          <div class="w-14 h-14 mx-auto mb-4 bg-[#f7f7f7] text-[#ff385c] rounded-full flex items-center justify-center text-2xl">
            🔍
          </div>
          <h3 class="text-xl font-bold text-[#222222] mb-2">Aucun logement ne correspond exactement</h3>
          <p class="text-sm text-[#6a6a6a] mb-6">
            Essayez de modifier votre quartier, votre type de bien ou d'augmenter votre budget max.
          </p>
          <button id="btn-reset-filters" class="px-6 py-3 btn-rausch text-white rounded-xl text-sm font-semibold transition">
            Effacer tous les filtres
          </button>
        </div>
      `;
      const resetBtn = document.getElementById("btn-reset-filters");
      if (resetBtn) resetBtn.addEventListener("click", resetAllFilters);
      return;
    }

    propertiesGrid.innerHTML = list.map(item => {
      const isFav = window.appStore.isFavorite(item.id);
      const mainImage = item.images && item.images.length > 0 
        ? item.images[0] 
        : "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80";

      // Préparation du message WhatsApp pré-rempli
      const whatsappText = encodeURIComponent(
        `Bonjour, je vous contacte depuis FasoLogis concernant le logement "${item.title}" (Réf: ${item.id}) à ${window.formatFCFA(item.price)}/mois situé à ${item.neighborhood}, ${item.city}. Est-il toujours disponible pour une visite ?`
      );
      const whatsappUrl = `https://wa.me/${item.contactWhatsapp}?text=${whatsappText}`;

      return `
        <div class="airbnb-card group cursor-pointer flex flex-col" onclick="window.openPropertyModal('${item.id}')">
          <!-- Photo Container avec coin doux (14px) -->
          <div class="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#f2f2f2] mb-3">
            <img 
              src="${mainImage}" 
              alt="${item.title}" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />

            <!-- Badge Coup de cœur voyageurs (Airbnb Guest Favorite Badge) -->
            ${item.guestFavorite ? `
              <div class="absolute top-3 left-3 guest-favorite-badge px-3 py-1 flex items-center gap-1.5">
                <span class="text-xs">🏆</span>
                <span>Coup de cœur</span>
              </div>
            ` : item.verified ? `
              <div class="absolute top-3 left-3 guest-favorite-badge px-3 py-1 flex items-center gap-1.5">
                <span class="text-xs text-[#ff385c]">✓</span>
                <span>Certifié FasoLogis</span>
              </div>
            ` : ''}

            <!-- Bouton Wishlist Cœur (Rausch au clic) -->
            <button 
              type="button"
              onclick="event.stopPropagation(); window.toggleFavorite('${item.id}')"
              class="heart-btn absolute top-3 right-3 ${isFav ? 'is-active' : ''}"
              title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 16px; width: 16px; stroke: ${isFav ? '#ff385c' : '#222222'}; stroke-width: 2.2; fill: ${isFav ? '#ff385c' : 'rgba(0, 0, 0, 0.45)'};">
                <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
              </svg>
            </button>
          </div>

          <!-- Metas du logement (Airbnb Style Typography) -->
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <!-- Ligne 1 : Localisation & Note -->
              <div class="flex items-baseline justify-between gap-2 mb-1">
                <h3 class="font-semibold text-[#222222] text-[15px] truncate">
                  ${item.neighborhood}, ${item.city}
                </h3>
                <div class="flex items-center gap-1 text-xs font-semibold text-[#222222] shrink-0">
                  <span>★</span>
                  <span>${item.rating ? item.rating.toFixed(2) : '4.90'}</span>
                </div>
              </div>

              <!-- Ligne 2 : Type & Distance goudron -->
              <div class="text-[13px] text-[#6a6a6a] line-clamp-1 mb-1">
                ${item.category} • ${item.goudronDistance}
              </div>

              <!-- Ligne 3 : Badges Eau / Électricité -->
              <div class="flex flex-wrap gap-1.5 mb-2.5">
                <span class="badge-soft-local px-2 py-0.5">
                  💧 ${item.water === 'onea_indiv' ? 'ONEA Indiv.' : item.water === 'forage' ? 'Forage' : 'ONEA partagé'}
                </span>
                <span class="badge-soft-local px-2 py-0.5">
                  ⚡ ${item.electricity === 'cashpower_indiv' ? 'Cash Power' : 'SONABEL'}
                </span>
                <span class="badge-soft-local px-2 py-0.5">
                  🛏️ ${item.bedrooms} ch. • 🚿 ${item.bathrooms} d.
                </span>
              </div>
            </div>

            <!-- Ligne 4 : Prix & Boutons d'action -->
            <div class="pt-1 flex items-center justify-between border-t border-[#f2f2f2] mt-1">
              <div>
                <span class="font-bold text-[#222222] text-base">${window.formatFCFA(item.price)}</span>
                <span class="text-[#6a6a6a] text-xs font-normal">/ mois</span>
              </div>

              <!-- Actions directes légères -->
              <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
                <a 
                  href="${whatsappUrl}" 
                  target="_blank" 
                  rel="noopener" 
                  class="btn-whatsapp-airbnb px-2.5 py-1.5 text-xs flex items-center gap-1 shadow-sm"
                  title="Échanger directement par WhatsApp"
                >
                  <span>💬</span> WhatsApp
                </a>
                <button 
                  onclick="window.openPropertyModal('${item.id}')" 
                  class="bg-[#f2f2f2] hover:bg-[#ebebeb] text-[#222222] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  Détails
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // --- MODAL DÉTAILS DU BIEN (AIRBNB LISTING DETAIL LAYOUT) ---
  window.openPropertyModal = function(id) {
    const item = window.appStore.getPropertyById(id);
    if (!item) return;

    window.appStore.incrementViews(id);

    const modal = document.getElementById("property-modal");
    const modalContent = document.getElementById("property-modal-content");
    if (!modal || !modalContent) return;

    const whatsappText = encodeURIComponent(
      `Bonjour ${item.contactName}, je vous contacte depuis FasoLogis concernant l'annonce "${item.title}" (Réf: ${item.id}) à ${window.formatFCFA(item.price)}/mois situé à ${item.neighborhood}, ${item.city}. Je souhaite organiser une visite guidée.`
    );
    const whatsappUrl = `https://wa.me/${item.contactWhatsapp}?text=${whatsappText}`;

    modalContent.innerHTML = `
      <div class="relative bg-white rounded-3xl overflow-hidden p-6 md:p-8">
        <!-- Close button (Airbnb circular icon button) -->
        <button 
          onclick="window.closePropertyModal()" 
          class="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] flex items-center justify-center font-bold text-sm shadow-sm transition"
        >
          ✕
        </button>

        <!-- Titre & Entête de la fiche -->
        <div class="mb-5 pr-10">
          <div class="flex items-center gap-2 mb-2">
            ${item.guestFavorite ? `
              <span class="guest-favorite-badge px-3 py-1 text-xs">
                🏆 Coup de cœur voyageurs
              </span>
            ` : ''}
            <span class="text-xs font-semibold text-[#6a6a6a]">Réf. ${item.id}</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-[#222222] leading-snug">${item.title}</h1>
          <div class="flex items-center gap-3 text-xs sm:text-sm text-[#222222] font-semibold mt-2">
            <span class="flex items-center gap-1">★ ${item.rating ? item.rating.toFixed(2) : '4.95'}</span>
            <span class="text-[#6a6a6a] font-normal underline">(${item.reviewsCount || 12} avis)</span>
            <span class="text-[#dddddd]">•</span>
            <span class="text-[#6a6a6a] font-medium underline">${item.neighborhood}, ${item.city} (Burkina Faso)</span>
          </div>
        </div>

        <!-- Galerie Photos (Style Grille Airbnb) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 rounded-2xl overflow-hidden mb-8 h-72 md:h-96">
          <!-- Grande Photo Principale -->
          <div class="md:col-span-2 h-full bg-[#f2f2f2]">
            <img 
              id="modal-main-image"
              src="${item.images[0]}" 
              alt="${item.title}" 
              class="w-full h-full object-cover"
            />
          </div>
          <!-- Photos Secondaires -->
          <div class="hidden md:flex flex-col gap-2.5 h-full">
            <div class="flex-1 bg-[#f2f2f2] overflow-hidden">
              <img 
                src="${item.images[1] || item.images[0]}" 
                onclick="document.getElementById('modal-main-image').src = this.src"
                alt="Vue 2" 
                class="w-full h-full object-cover hover:opacity-90 cursor-pointer transition"
              />
            </div>
            <div class="flex-1 bg-[#f2f2f2] overflow-hidden">
              <img 
                src="${item.images[2] || item.images[0]}" 
                onclick="document.getElementById('modal-main-image').src = this.src"
                alt="Vue 3" 
                class="w-full h-full object-cover hover:opacity-90 cursor-pointer transition"
              />
            </div>
          </div>
        </div>

        <!-- Grille 2 Colonnes (Contenu Gauche + Carte Réservation Droite) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Colonne Gauche : Détails & Hôte (~64%) -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- Hôte Card (Airbnb host-card) -->
            <div class="flex items-center justify-between pb-6 border-b border-[#ebebeb]">
              <div>
                <h3 class="text-base sm:text-lg font-bold text-[#222222]">
                  Logement entier : proposé par ${item.contactName}
                </h3>
                <p class="text-xs text-[#6a6a6a] mt-0.5">
                  ${item.contactRole || 'Bailleur certifié'} • ${item.bedrooms} chambres • ${item.bathrooms} salle(s) d'eau • ${item.surface || 100} m²
                </p>
              </div>
              <img 
                src="${item.hostAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" 
                alt="${item.contactName}" 
                class="w-14 h-14 rounded-full object-cover border border-[#dddddd]"
              />
            </div>

            <!-- Points Forts (Points de Confiance Clés Airbnb) -->
            <div class="space-y-4 pb-6 border-b border-[#ebebeb]">
              <div class="flex items-start gap-3">
                <span class="text-lg">💧</span>
                <div>
                  <h4 class="text-xs font-bold text-[#222222]">Alimentation en Eau Sécurisée</h4>
                  <p class="text-xs text-[#6a6a6a]">${item.waterDetail || item.water}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <span class="text-lg">⚡</span>
                <div>
                  <h4 class="text-xs font-bold text-[#222222]">Électricité SONABEL Dédiée</h4>
                  <p class="text-xs text-[#6a6a6a]">${item.electricityDetail || item.electricity}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <span class="text-lg">🛣️</span>
                <div>
                  <h4 class="text-xs font-bold text-[#222222]">Accessibilité & Voie Bitumée</h4>
                  <p class="text-xs text-[#6a6a6a]">${item.goudronDistance}</p>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="pb-6 border-b border-[#ebebeb]">
              <h4 class="text-sm font-bold text-[#222222] mb-2">À propos de ce logement</h4>
              <p class="text-xs sm:text-sm text-[#3f3f3f] leading-relaxed">
                ${item.description}
              </p>
            </div>

            <!-- Ce que propose ce logement (Amenities List) -->
            <div class="pb-6">
              <h4 class="text-sm font-bold text-[#222222] mb-3">Ce que propose ce logement</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                ${item.amenities.map(am => `
                  <div class="flex items-center gap-2.5 py-1 text-[#222222]">
                    <span class="text-sm text-[#222222]">✓</span>
                    <span>${am}</span>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <!-- Colonne Droite : Sticky Reservation Card Airbnb (~36%) -->
          <div class="lg:col-span-5">
            <div class="sticky top-24 bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow">
              
              <!-- Prix & Note -->
              <div class="flex items-baseline justify-between mb-4 pb-4 border-b border-[#ebebeb]">
                <div>
                  <span class="text-2xl font-bold text-[#222222]">${window.formatFCFA(item.price)}</span>
                  <span class="text-xs text-[#6a6a6a]">/ mois</span>
                </div>
                <div class="flex items-center gap-1 text-xs font-bold text-[#222222]">
                  <span>★</span>
                  <span>${item.rating ? item.rating.toFixed(2) : '4.95'}</span>
                </div>
              </div>

              <!-- Conditions Caution & Avance Box -->
              <div class="border border-[#dddddd] rounded-xl overflow-hidden mb-4 text-xs">
                <div class="grid grid-cols-2 border-b border-[#dddddd]">
                  <div class="p-2.5 border-r border-[#dddddd] bg-[#f7f7f7]">
                    <span class="text-[10px] uppercase font-bold text-[#6a6a6a] block">Caution</span>
                    <span class="font-bold text-[#222222]">${item.deposit} mois</span>
                  </div>
                  <div class="p-2.5 bg-[#f7f7f7]">
                    <span class="text-[10px] uppercase font-bold text-[#6a6a6a] block">Avance</span>
                    <span class="font-bold text-[#222222]">${item.advance} mois</span>
                  </div>
                </div>
                <div class="p-2.5 bg-white">
                  <span class="text-[10px] uppercase font-bold text-[#6a6a6a] block">Contact direct</span>
                  <span class="font-semibold text-[#222222]">${item.contactName} (${item.contactPhone})</span>
                </div>
              </div>

              <!-- CTAs Principaux -->
              <div class="space-y-2.5 mb-6">
                <!-- Bouton Principal Rausch (Airbnb Primary) -->
                <a 
                  href="${whatsappUrl}" 
                  target="_blank" 
                  rel="noopener" 
                  class="btn-rausch w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-center"
                >
                  <span>💬</span> Discuter sur WhatsApp
                </a>

                <a 
                  href="tel:${item.contactPhone}" 
                  class="w-full bg-[#f2f2f2] hover:bg-[#ebebeb] text-[#222222] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition text-center"
                >
                  <span>📞</span> Appeler le ${item.contactPhone}
                </a>
              </div>

              <!-- Formulaire Demande de Visite Intégré -->
              <div class="pt-4 border-t border-[#ebebeb]">
                <h5 class="text-xs font-bold text-[#222222] mb-1">Programmer une visite</h5>
                <p class="text-[11px] text-[#6a6a6a] mb-3">Fixez un créneau pour visiter le logement avec le démarcheur.</p>

                <form onsubmit="window.submitVisitRequest(event, '${item.id}', '${item.title.replace(/'/g, "\\'")}')" class="space-y-2">
                  <input type="text" id="visit-fullname" required placeholder="Votre nom complet" class="w-full text-xs p-2.5 rounded-lg border border-[#dddddd] focus:border-[#222222] focus:outline-none" />
                  <input type="tel" id="visit-phone" required placeholder="Téléphone WhatsApp" class="w-full text-xs p-2.5 rounded-lg border border-[#dddddd] focus:border-[#222222] focus:outline-none" />
                  <input type="date" id="visit-date" required class="w-full text-xs p-2.5 rounded-lg border border-[#dddddd] focus:border-[#222222] focus:outline-none" />
                  <button type="submit" class="w-full bg-[#222222] hover:bg-black text-white text-xs font-bold py-2.5 rounded-lg transition mt-1">
                    Confirmer la demande de visite
                  </button>
                </form>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  };

  window.closePropertyModal = function() {
    const modal = document.getElementById("property-modal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  };

  // --- DEMANDE DE VISITE ---
  window.submitVisitRequest = function(event, propertyId, propertyTitle) {
    event.preventDefault();
    const fullName = document.getElementById("visit-fullname").value;
    const phone = document.getElementById("visit-phone").value;
    const preferredDate = document.getElementById("visit-date").value;

    window.appStore.addVisit({
      propertyId,
      propertyTitle,
      fullName,
      phone,
      preferredDate,
      timeSlot: "Après-midi (15h - 18h)"
    });

    alert(`✅ Demande envoyée avec succès !\n\nMerci ${fullName}, le gestionnaire de l'annonce va vous recontacter par WhatsApp au ${phone} pour confirmer le rendez-vous.`);
    window.closePropertyModal();
  };

  // --- GESTION DES FAVORIS ---
  window.toggleFavorite = function(propertyId) {
    const isNowFav = window.appStore.toggleFavorite(propertyId);
    renderProperties();
    updateFavoritesBadge();
    if (currentView === "favorites") {
      renderFavoritesView();
    }
  };

  function updateFavoritesBadge() {
    const favCountEl = document.getElementById("fav-count-badge");
    const favCountMobile = document.getElementById("fav-count-badge-mobile");
    const count = window.appStore.getFavorites().length;

    if (favCountEl) {
      favCountEl.textContent = count;
      favCountEl.classList.toggle("hidden", count === 0);
    }
    if (favCountMobile) {
      favCountMobile.textContent = count;
      favCountMobile.classList.toggle("hidden", count === 0);
    }
  }

  // --- FILTRES RAPIDES & CATEGORIES AIRBNB ---
  window.filterByCategory = function(categoryTag) {
    currentFilters.categoryTag = categoryTag;
    document.querySelectorAll(".category-tab").forEach(tab => {
      tab.classList.toggle("active", tab.getAttribute("data-cat") === categoryTag);
    });
    renderProperties();
  };

  function initFilterListeners() {
    if (neighborhoodSelect) {
      neighborhoodSelect.addEventListener("change", (e) => {
        currentFilters.neighborhood = e.target.value;
        renderProperties();
      });
    }

    if (typeSelect) {
      typeSelect.addEventListener("change", (e) => {
        currentFilters.type = e.target.value;
        renderProperties();
      });
    }

    if (maxPriceInput) {
      maxPriceInput.addEventListener("input", (e) => {
        currentFilters.maxPrice = e.target.value ? Number(e.target.value) : null;
        renderProperties();
      });
    }

    if (keywordInput) {
      keywordInput.addEventListener("input", (e) => {
        currentFilters.keyword = e.target.value;
        renderProperties();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        currentFilters.sortBy = e.target.value;
        renderProperties();
      });
    }
  }

  function resetAllFilters() {
    currentFilters = {
      city: "Toutes",
      neighborhood: "Tous les quartiers",
      type: "all",
      maxPrice: null,
      keyword: "",
      sortBy: "newest",
      goudronOnly: false,
      forageOnly: false,
      cashpowerIndivOnly: false,
      climOnly: false,
      garageOnly: false,
      categoryTag: "all"
    };

    if (citySelect) citySelect.value = "Toutes";
    if (neighborhoodSelect) {
      neighborhoodSelect.innerHTML = `<option value="Tous les quartiers">Tous les quartiers</option>`;
      neighborhoodSelect.disabled = true;
    }
    if (typeSelect) typeSelect.value = "all";
    if (maxPriceInput) maxPriceInput.value = "";
    if (keywordInput) keywordInput.value = "";

    document.querySelectorAll(".category-tab").forEach(tab => {
      tab.classList.toggle("active", tab.getAttribute("data-cat") === "all");
    });

    renderProperties();
  }

  // --- VUES (SPA) ---
  let currentView = "browse";
  window.switchView = function(viewName) {
    currentView = viewName;
    const views = ["browse", "publish", "admin", "favorites"];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.classList.toggle("hidden", v !== viewName);
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      const target = link.getAttribute("data-target");
      if (target === viewName) {
        link.classList.add("text-[#222222]", "font-bold");
        link.classList.remove("text-[#6a6a6a]");
      } else {
        link.classList.remove("text-[#222222]", "font-bold");
        link.classList.add("text-[#6a6a6a]");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (viewName === "admin") {
      renderAdminDashboard();
    } else if (viewName === "favorites") {
      renderFavoritesView();
    } else if (viewName === "browse") {
      renderProperties();
    }
  };

  // --- VUE FAVORIS ---
  function renderFavoritesView() {
    const favGrid = document.getElementById("favorites-grid");
    if (!favGrid) return;
    const favIds = window.appStore.getFavorites();
    const all = window.appStore.getAllProperties(false);
    const favProperties = all.filter(p => favIds.includes(p.id));

    if (favProperties.length === 0) {
      favGrid.innerHTML = `
        <div class="col-span-full py-20 text-center bg-white rounded-3xl border border-[#ebebeb] p-8 max-w-md mx-auto my-8">
          <div class="text-4xl mb-3">🤍</div>
          <h3 class="text-lg font-bold text-[#222222] mb-1">Aucun coup de cœur sauvegardé</h3>
          <p class="text-xs text-[#6a6a6a] mb-6">Cliquez sur le cœur d'un logement pour l'ajouter à vos favoris.</p>
          <button onclick="window.switchView('browse')" class="px-6 py-2.5 btn-rausch text-white rounded-xl text-xs font-bold">
            Explorer les logements
          </button>
        </div>
      `;
      return;
    }

    favGrid.innerHTML = favProperties.map(item => `
      <div class="bg-white rounded-2xl border border-[#ebebeb] airbnb-shadow p-4 flex gap-4 items-center">
        <img src="${item.images[0]}" class="w-24 h-24 rounded-xl object-cover" />
        <div class="flex-1">
          <div class="text-xs text-[#ff385c] font-bold">${item.category} • ${item.neighborhood}</div>
          <h4 class="font-bold text-[#222222] text-sm line-clamp-1">${item.title}</h4>
          <div class="text-sm font-bold text-[#222222] mt-1">${window.formatFCFA(item.price)} <span class="text-xs text-[#6a6a6a] font-normal">/ mois</span></div>
        </div>
        <div class="flex flex-col gap-2">
          <button onclick="window.openPropertyModal('${item.id}')" class="px-3 py-1.5 bg-[#222222] text-white text-xs font-bold rounded-lg hover:bg-black transition">
            Voir
          </button>
          <button onclick="window.toggleFavorite('${item.id}')" class="px-3 py-1.5 bg-[#f7f7f7] text-[#ff385c] text-xs font-bold rounded-lg hover:bg-red-50 transition">
            Retirer
          </button>
        </div>
      </div>
    `).join("");
  }

  // --- PUBLICATION & PAIEMENT MOBILE MONEY ---
  const plans = window.PRICING_PLANS || [];
  let selectedPlan = plans[0] || { id: "plan-single", name: "Annonce Unitaire", price: 2500 };
  let selectedPaymentMethod = "Orange Money";

  window.selectPlan = function(planId) {
    const plansList = window.PRICING_PLANS || [];
    selectedPlan = plansList.find(p => p.id === planId) || plansList[0];
    document.querySelectorAll(".plan-card").forEach(c => {
      c.classList.remove("border-[#222222]", "ring-2", "ring-[#222222]");
      c.classList.add("border-[#dddddd]");
    });
    const chosen = document.getElementById(`card-${planId}`);
    if (chosen) {
      chosen.classList.add("border-[#222222]", "ring-2", "ring-[#222222]");
      chosen.classList.remove("border-[#dddddd]");
    }
    const amountEl = document.getElementById("pay-amount-display");
    if (amountEl) amountEl.textContent = window.formatFCFA(selectedPlan.price);
  };

  window.selectPaymentMethod = function(method) {
    selectedPaymentMethod = method;
    document.querySelectorAll(".pay-method-btn").forEach(btn => {
      btn.classList.remove("ring-2", "ring-[#ff385c]", "border-[#ff385c]", "font-bold");
      btn.classList.add("border-[#dddddd]");
    });
    const active = document.getElementById(`pay-method-${method.toLowerCase().replace(" ", "")}`);
    if (active) {
      active.classList.add("ring-2", "ring-[#ff385c]", "border-[#ff385c]", "font-bold");
      active.classList.remove("border-[#dddddd]");
    }

    const merchantInfo = document.getElementById("merchant-number-info");
    if (merchantInfo) {
      if (method === "Orange Money") {
        merchantInfo.innerHTML = `Numéro marchand / Transfert : <strong class="text-[#ff385c]">+226 70 00 11 22</strong> (Code Marchand OM : <strong>459012</strong>)`;
      } else if (method === "Moov Money") {
        merchantInfo.innerHTML = `Numéro marchand / Transfert : <strong class="text-blue-600">+226 60 11 22 33</strong> (Moov Money BF)`;
      } else {
        merchantInfo.innerHTML = `Compte Wave Burkina : <strong class="text-sky-500">+226 70 00 11 22</strong>`;
      }
    }
  };

  const publishForm = document.getElementById("form-publish-property");
  if (publishForm) {
    publishForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("pub-title").value;
      const type = document.getElementById("pub-type").value;
      const city = document.getElementById("pub-city").value;
      const neighborhood = document.getElementById("pub-neighborhood").value;
      const price = Number(document.getElementById("pub-price").value);
      const deposit = Number(document.getElementById("pub-deposit").value || 2);
      const advance = Number(document.getElementById("pub-advance").value || 1);
      const bedrooms = Number(document.getElementById("pub-bedrooms").value || 1);
      const bathrooms = Number(document.getElementById("pub-bathrooms").value || 1);
      const surface = Number(document.getElementById("pub-surface").value || 50);
      const goudron = document.getElementById("pub-goudron").value;
      const water = document.getElementById("pub-water").value;
      const electricity = document.getElementById("pub-electricity").value;
      const description = document.getElementById("pub-description").value;
      const contactName = document.getElementById("pub-contact-name").value;
      const contactPhone = document.getElementById("pub-contact-phone").value;
      const contactWhatsapp = document.getElementById("pub-contact-whatsapp").value.replace(/\+/g, '').replace(/\s/g, '');
      const transactionRef = document.getElementById("pub-transaction-ref").value;
      const photoUrl = document.getElementById("pub-photo-url").value || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80";

      const amenities = [];
      document.querySelectorAll(".pub-amenity-checkbox:checked").forEach(cb => {
        amenities.push(cb.value);
      });

      const typeLabels = {
        villa: "Villa individuelle",
        appartement: "Appartement moderne",
        maison_basse: "Maison basse cour unique",
        celibatorium: "Célibatorium (Entrée-couché)",
        studio: "Studio meublé"
      };

      const createdProp = window.appStore.addProperty({
        title,
        type,
        category: typeLabels[type] || "Logement",
        city,
        neighborhood,
        price,
        deposit,
        advance,
        bedrooms,
        bathrooms,
        surface,
        rating: 5.0,
        reviewsCount: 1,
        guestFavorite: false,
        goudronDistance: goudron,
        water,
        waterDetail: water === "onea_indiv" ? "Compteur ONEA individuel" : water === "forage" ? "Forage avec réserve" : "ONEA partagé",
        electricity,
        electricityDetail: electricity === "cashpower_indiv" ? "Compteur Cash Power individuel" : "Compteur partagé",
        amenities: amenities.length > 0 ? amenities : ["Cour fermée", "Compteur individuel"],
        description,
        images: [photoUrl],
        contactName,
        contactRole: "Bailleur vérifié",
        contactPhone,
        contactWhatsapp,
        paymentReference: transactionRef,
        paymentMethod: selectedPaymentMethod,
        paymentAmount: selectedPlan.price
      });

      window.appStore.addPayment({
        propertyId: createdProp.id,
        propertyTitle: title,
        contactName,
        phone: contactPhone,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        method: selectedPaymentMethod,
        transactionRef: transactionRef
      });

      alert(`🎉 Annonce enregistrée !\n\nVotre annonce [${createdProp.id}] a été soumise avec succès.\n\nVotre paiement Mobile Money (${selectedPaymentMethod} : ${transactionRef}) est en cours de contrôle par l'équipe FasoLogis. Elle sera activée dès validation.`);

      publishForm.reset();
      window.switchView("browse");
    });
  }

  // --- TABLEAU DE BORD D'ADMINISTRATION ---
  function renderAdminDashboard() {
    const allProperties = window.appStore.getAllProperties(true);
    const pendingProperties = allProperties.filter(p => p.status === "pending");
    const approvedProperties = allProperties.filter(p => p.status === "approved");
    const payments = window.appStore.getPayments();
    const pendingPayments = payments.filter(p => p.status === "pending");
    const visits = window.appStore.getVisits();

    const kpiPendingProp = document.getElementById("admin-kpi-pending-prop");
    const kpiApprovedProp = document.getElementById("admin-kpi-approved-prop");
    const kpiPendingPay = document.getElementById("admin-kpi-pending-pay");
    const kpiVisits = document.getElementById("admin-kpi-visits");

    if (kpiPendingProp) kpiPendingProp.textContent = pendingProperties.length;
    if (kpiApprovedProp) kpiApprovedProp.textContent = approvedProperties.length;
    if (kpiPendingPay) kpiPendingPay.textContent = pendingPayments.length;
    if (kpiVisits) kpiVisits.textContent = visits.length;

    const propTableBody = document.getElementById("admin-properties-table-body");
    if (propTableBody) {
      if (allProperties.length === 0) {
        propTableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-[#6a6a6a]">Aucune annonce trouvée.</td></tr>`;
      } else {
        propTableBody.innerHTML = allProperties.map(p => `
          <tr class="border-b border-[#ebebeb] hover:bg-[#f7f7f7]">
            <td class="p-3 font-mono text-xs font-bold text-[#222222]">${p.id}</td>
            <td class="p-3">
              <div class="font-bold text-[#222222] text-xs line-clamp-1">${p.title}</div>
              <div class="text-xs text-[#6a6a6a]">${p.neighborhood}, ${p.city} • <span class="font-semibold text-[#ff385c]">${window.formatFCFA(p.price)}</span></div>
            </td>
            <td class="p-3 text-xs text-[#3f3f3f]">
              <div>${p.contactName}</div>
              <div class="text-[#6a6a6a]">${p.contactPhone}</div>
            </td>
            <td class="p-3 text-xs">
              <span class="font-mono font-bold text-[#222222]">${p.paymentReference || 'N/A'}</span>
              <div class="text-[#6a6a6a]">${p.paymentMethod || 'Inclus'}</div>
            </td>
            <td class="p-3 text-xs">
              ${p.status === 'approved' ? `
                <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">En ligne</span>
              ` : p.status === 'pending' ? `
                <span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px]">En attente</span>
              ` : `
                <span class="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[11px]">Rejeté</span>
              `}
            </td>
            <td class="p-3 text-xs">
              <div class="flex items-center gap-1.5">
                ${p.status === 'pending' ? `
                  <button onclick="window.adminApproveProperty('${p.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold" title="Valider et publier">
                    Valider ✓
                  </button>
                  <button onclick="window.adminRejectProperty('${p.id}')" class="px-2 py-1 bg-[#ebebeb] hover:bg-[#dddddd] text-[#222222] rounded-lg" title="Rejeter">
                    ✕
                  </button>
                ` : `
                  <button onclick="window.openPropertyModal('${p.id}')" class="px-2.5 py-1 bg-[#f2f2f2] hover:bg-[#ebebeb] text-[#222222] rounded-lg font-semibold">
                    Voir
                  </button>
                `}
                <button onclick="window.adminDeleteProperty('${p.id}')" class="px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg" title="Supprimer">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        `).join("");
      }
    }

    const payTableBody = document.getElementById("admin-payments-table-body");
    if (payTableBody) {
      if (payments.length === 0) {
        payTableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-[#6a6a6a]">Aucun paiement enregistré.</td></tr>`;
      } else {
        payTableBody.innerHTML = payments.map(pay => `
          <tr class="border-b border-[#ebebeb] hover:bg-[#f7f7f7]">
            <td class="p-3 font-mono text-xs font-bold">${pay.id}</td>
            <td class="p-3 text-xs">
              <div class="font-bold text-[#222222]">${pay.contactName}</div>
              <div class="text-[#6a6a6a]">${pay.phone}</div>
            </td>
            <td class="p-3 text-xs">
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${pay.method.includes('Orange') ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}">
                ${pay.method}
              </span>
              <div class="font-mono font-bold mt-0.5 text-[#222222]">${pay.transactionRef}</div>
            </td>
            <td class="p-3 text-xs font-bold text-[#222222]">${window.formatFCFA(pay.amount)}</td>
            <td class="p-3 text-xs">
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${pay.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}">
                ${pay.status === 'approved' ? 'Validé' : 'À vérifier'}
              </span>
            </td>
            <td class="p-3 text-xs">
              ${pay.status === 'pending' ? `
                <button onclick="window.adminApprovePayment('${pay.id}', '${pay.propertyId}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">
                  Confirmer reçu ✓
                </button>
              ` : `
                <span class="text-[#929292]">Archivé</span>
              `}
            </td>
          </tr>
        `).join("");
      }
    }

    const visitsTableBody = document.getElementById("admin-visits-table-body");
    if (visitsTableBody) {
      if (visits.length === 0) {
        visitsTableBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-[#6a6a6a]">Aucune demande de visite.</td></tr>`;
      } else {
        visitsTableBody.innerHTML = visits.map(v => `
          <tr class="border-b border-[#ebebeb] hover:bg-[#f7f7f7]">
            <td class="p-3 text-xs font-mono font-bold">${v.id}</td>
            <td class="p-3 text-xs">
              <div class="font-bold text-[#222222]">${v.fullName}</div>
              <div class="text-[#6a6a6a]">${v.phone}</div>
            </td>
            <td class="p-3 text-xs text-[#3f3f3f]">${v.propertyTitle}</td>
            <td class="p-3 text-xs font-semibold text-[#ff385c]">${v.preferredDate}</td>
            <td class="p-3 text-xs">
              <a href="https://wa.me/${v.phone.replace(/\+/g, '').replace(/\s/g, '')}" target="_blank" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100">
                WhatsApp
              </a>
            </td>
          </tr>
        `).join("");
      }
    }
  }

  window.adminApproveProperty = function(id) {
    if (confirm(`Voulez-vous valider et mettre en ligne l'annonce ${id} ?`)) {
      window.appStore.updatePropertyStatus(id, "approved");
      renderAdminDashboard();
      renderProperties();
    }
  };

  window.adminRejectProperty = function(id) {
    const reason = prompt("Motif du rejet :");
    if (reason !== null) {
      window.appStore.updatePropertyStatus(id, "rejected");
      renderAdminDashboard();
      renderProperties();
    }
  };

  window.adminDeleteProperty = function(id) {
    if (confirm(`Supprimer définitivement l'annonce ${id} ?`)) {
      window.appStore.deleteProperty(id);
      renderAdminDashboard();
      renderProperties();
    }
  };

  window.adminApprovePayment = function(paymentId, propertyId) {
    window.appStore.updatePaymentStatus(paymentId, "approved");
    if (propertyId) {
      window.appStore.updatePropertyStatus(propertyId, "approved");
    }
    alert("Paiement validé avec succès ! L'annonce est maintenant active.");
    renderAdminDashboard();
    renderProperties();
  };

  window.resetDemoData = function() {
    if (confirm("Réinitialiser tous les logements et paiements aux données d'origine ?")) {
      window.appStore.resetToDefault();
      location.reload();
    }
  };

  // --- INITIALISATION ---
  initLocationSelectors();
  initFilterListeners();
  renderProperties();
  updateFavoritesBadge();
});
