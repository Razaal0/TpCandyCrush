import Grille from "./grille.js";

// 1 On définit une sorte de "programme principal"
// le point d'entrée du code qui sera appelée dès que la
// page ET SES RESSOURCES est chargée

window.onload = init;

let grille;
let boutonValider;

function init() {
  console.log("Page et ressources prêtes à l'emploi");
  // appelée quand la page et ses ressources sont prêtes.
  // On dit aussi que le DOM est ready (en fait un peu plus...)

  grille = new Grille(9, 9);
  grille.showCookies();
  boutonValider = document.getElementById("valider");
  boutonValider.onclick = () => {
    grille.detecterMatch3Colonnes();
    grille.detecterMatch3Lignes();
    grille.supprimerCookiesMarques();
    grille.tasserColonnes();
    grille.compterScore();
  }

}
