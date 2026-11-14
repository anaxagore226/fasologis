# 🏡 FasoLogis — Plateforme de Location Immobilière au Burkina Faso

**FasoLogis** est une plateforme web moderne conçue spécialement pour le marché immobilier locatif burkinabè (Ouagadougou, Bobo-Dioulasso, Koudougou et l'ensemble des provinces), dotée d'une interface inspirée du **Design System Airbnb** (Rausch `#ff385c`, typographie Inter/Cereal, coins doux 14px, canvas blanc épuré et composants photo-first).

---

## 🎨 Nouveau Design Inspiré d'Airbnb

L'application a été entièrement réalignée sur les principes du design system d'Airbnb :

1. **Canvas Blanc & Tension Rausch (`#ff385c`) :**
   - Canvas 100% blanc pur (`#ffffff`), suppression du thème sombre.
   - Utilisation ciblée de la couleur d'accent signature **Rausch** (`#ff385c`) réservée aux moments clés : bouton de recherche orb circulaire, CTAs primaires ("Discuter sur WhatsApp"), et état actif des cœurs de favoris.
   - Encre textuelle profonde (`#222222`) avec gris doux (`#6a6a6a`) et séparateurs fins (`#ebebeb`).

2. **Barre de Recherche Pilule Signature (`search-bar-pill`) :**
   - Découpage en 3 segments clairs : **Destination (Ville)**, **Quartier**, **Type de bien**, **Budget max**.
   - Terminaison à droite par le bouton circulaire **Search Orb** Rausch avec loupe.

3. **Bandeau de Catégories Iconique (`category-strip`) :**
   - Navigation horizontale épurée avec icônes (Villas, Appartements, Cours uniques, Célibatoriums, Sur Goudron, Forage 24/7, Cash Power, Climatisé, Avec Garage).
   - Indicateur actif avec trait noir de 2px sous la catégorie sélectionnée.

4. **Cartes Logements "Photo-First" (`property-card`) :**
   - Format 4:3 avec coins doux arrondis (14px).
   - Badge flottant **"Coup de cœur voyageurs"** ou **"Certifié FasoLogis"** en haut à gauche.
   - Bouton flottant circulaire cœur en haut à droite avec animation Rausch.
   - Ligne de note (`★ 4.95`) alignée à droite du titre.
   - Bouton WhatsApp direct et bouton Détails.

5. **Fiche Logement & Carte de Réservation (`reservation-card`) :**
   - Mise en page à 2 colonnes avec galerie photo en mosaïque.
   - Carte de réservation adhésive (*sticky rail*) sur la droite affichant le loyer mensuel, le récapitulatif caution/avance et les boutons de contact directs.
   - Carte de l'hôte avec avatar, statut "Superhôte" et badges de confiance burkinabè (Forage, ONEA, Cash Power).

6. **Pied de page clair (`footer-light`) :**
   - Footer épuré sur fond blanc/gris très doux (`#f7f7f7`), fidèle à l'architecture sans contraste excessif d'Airbnb.

---

## 📁 Structure du Projet

```text
test1/
├── index.html            # Interface utilisateur complète (SPA multi-vues)
├── styles/
│   └── main.css          # Styles personnalisés, palettes Burkinabè & design responsive
├── scripts/
│   ├── data.js           # Données initiales (quartiers de Ouaga/Bobo, forfaits, annonces démo)
│   ├── store.js          # Moteur de données réactif et persistant (localStorage)
│   └── app.js            # Logique applicative, filtres, modales, paiement & admin
└── README.md             # Documentation et guide de prise en main
```

---

## 🚀 Comment Lancer et Tester le Projet

### Méthode 1 : Ouverture directe dans le navigateur
Double-cliquez simplement sur `index.html` ou ouvrez-le avec votre navigateur web préféré (Chrome, Edge, Firefox).

### Méthode 2 : Avec un serveur local (recommandé)
Dans votre terminal :
```bash
# Avec Python
python -m http.server 8000

# Ou avec Node.js (npx)
npx serve .
```
Puis accédez à l'adresse : `http://localhost:8000`

---

## 🧪 Scénarios de Test Prêts pour la Démonstration

1. **Recherche de logement :**
   - Sélectionnez la ville `Ouagadougou` puis le quartier `Saaba`.
   - Cliquez sur le badge rapide `⚡ Cash Power Indiv.` ou `💧 Forage / Réserve`.
   - Cliquez sur **Détails & Visite** pour explorer la galerie photos, les commodités et simuler une prise de contact WhatsApp.

2. **Dépôt d'annonce & Règlement Mobile Money :**
   - Cliquez sur **Déposer une annonce**.
   - Choisissez le forfait *Pack Démarcheur*.
   - Remplissez les caractéristiques du logement.
   - Choisissez *Orange Money* ou *Moov Money*, entrez une référence de transaction fictive (ex: `OM-BF-778899`) et soumettez.

3. **Validation dans le Back-Office Admin :**
   - Rendez-vous sur l'onglet **Espace Gestion / Admin**.
   - Constatez l'annonce en attente de modération et le paiement à vérifier.
   - Cliquez sur **Valider ✓** : l'annonce bascule instantanément en ligne sur la page d'accueil !

