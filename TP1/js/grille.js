import Cookie from "./cookie.js";
import { create2DArray } from "./utils.js";

/* Classe principale du jeu, c'est une grille de cookies. Le jeu se joue comme
Candy Crush Saga etc... c'est un match-3 game... */
export default class Grille {
  /**
   * Constructeur de la grille
   * @param {number} l nombre de lignes
   * @param {number} c nombre de colonnes
   */
  constructor(l, c) {
    this.c = c;
    this.l = l;
    this.nbCookiesCliquees = [];
    this.stockCookies = [];

    this.tabcookies = this.remplirTableauDeCookies(6)
  }

  /**
   * parcours la liste des divs de la grille et affiche les images des cookies
   * correspondant à chaque case. Au passage, à chaque image on va ajouter des
   * écouteurs de click et de drag'n'drop pour pouvoir interagir avec elles
   * et implémenter la logique du jeu.
   */
  showCookies() {
    let caseDivs = document.querySelectorAll("#grille div");

    caseDivs.forEach((div, index) => {
      // on calcule la ligne et la colonne de la case
      // index est le numéro de la case dans la grille
      // on sait que chaque ligne contient this.c colonnes
      // er this.l lignes
      // on peut en déduire la ligne et la colonne
      // par exemple si on a 9 cases par ligne et qu'on 
      // est à l'index 4
      // on est sur la ligne 0 (car 4/9 = 0) et 
      // la colonne 4 (car 4%9 = 4)
      let ligne = Math.floor(index / this.l);
      let colonne = index % this.c; 

      console.log("On remplit le div index=" + index + " l=" + ligne + " col=" + colonne);

      // on récupère le cookie correspondant à cette case
      let cookie = this.tabcookies[ligne][colonne];
      // on récupère l'image correspondante
      let img = cookie.htmlImage;

      img.onclick = (event) => {
        if (img.classList == "cookies-selected") {
          cookie.deselectionnee();
       } else {
         cookie.selectionnee();
       }
       
       console.log("On a cliqué sur la ligne " + ligne + " et la colonne " + colonne);
       //let cookieCliquee = this.getCookieFromLC(ligne, colonne);
       console.log("Le cookie cliqué est de type " + cookie.type);

       if(this.nbCookiesCliquees.includes(cookie)) {
         cookie.deselectionnee();
         this.nbCookiesCliquees.splice(this.nbCookiesCliquees.indexOf(cookie), 1);
       } else {
         cookie.selectionnee();
         this.nbCookiesCliquees.push(cookie);
       }

       if(this.nbCookiesCliquees.length == 2){
         this.trySwapCookies(this.nbCookiesCliquees[0], this.nbCookiesCliquees[1]);
       }
        
      }
      img.ondragstart = (evt) => {
        console.log("drag start");
       this.nbCookiesCliquees.push(cookie)
      }
      img.ondragover = (evt) => {
        evt.preventDefault();
      };

      img.ondragenter = (evt) => {
        evt.target.classList.add("grilleDragOver");
      };

      img.ondragleave = (evt) => {
        evt.target.classList.remove("grilleDragOver");
      }
      img.ondrop = (evt) => {
        evt.target.classList.remove("grilleDragOver");

        let position = JSON.parse(evt.dataTransfer.getData("pos"));
        let cookie1 = this.getCookieFromLigneColonne(
          position.ligne,
          position.colonne
        );

        let img = evt.target;
        let cookie2 = this.getCookieFromImage(img);

        this.trySwapCookies(cookie1, cookie2);
      };

      div.appendChild(img);
    });
  }

  trySwapCookies(c1, c2){
    // On vérifie si on peut swapper
    if(Cookie.isSwapDistancePossible(this.nbCookiesCliquees[0], this.nbCookiesCliquees[1])){
      // on swap
      Cookie.swapCookies(this.nbCookiesCliquees[0], this.nbCookiesCliquees[1]);
      this.nbCookiesCliquees = [];
    }
    else{
      // on ne peut pas swapper, on garde seulement le premier cookie en sélection
      this.nbCookiesCliquees[1].deselectionnee();
      this.nbCookiesCliquees.splice(1,1);
    }
  }

  // inutile ?
  getCookieFromLC(ligne, colonne) {
    return this.tabcookies[ligne][colonne];
  }
  
  /**
   * Initialisation du niveau de départ. Le paramètre est le nombre de cookies différents
   * dans la grille. 4 types (4 couleurs) = facile de trouver des possibilités de faire
   * des groupes de 3. 5 = niveau moyen, 6 = niveau difficile
   *
   * Améliorations : 1) s'assurer que dans la grille générée il n'y a pas déjà de groupes
   * de trois. 2) S'assurer qu'il y a au moins 1 possibilité de faire un groupe de 3 sinon
   * on a perdu d'entrée. 3) réfléchir à des stratégies pour générer des niveaux plus ou moins
   * difficiles.
   *
   * On verra plus tard pour les améliorations...
   */
  remplirTableauDeCookies(nbDeCookiesDifferents) {
    // créer un tableau vide de 9 cases pour une ligne
    // en JavaScript on ne sait pas créer de matrices
    // d'un coup. Pas de new tab[3][4] par exemple.
    // Il faut créer un tableau vide et ensuite remplir
    // chaque case avec un autre tableau vide
    // Faites ctrl-click sur la fonction create2DArray
    // pour voir comment elle fonctionne
    let tab = create2DArray(9);

    // remplir
    for(let l = 0; l < this.l; l++) {
      for(let c =0; c < this.c; c++) {

        // on génère un nombre aléatoire entre 0 et nbDeCookiesDifferents-1
        const type = Math.floor(Math.random()*nbDeCookiesDifferents);
        //console.log(type)
        tab[l][c] = new Cookie(type, l, c);
      }
    }

    return tab;
  }

  detecterMatch3Lignes() {
    for (let l = 0; l < this.l; l++) {
      for (let c = 0; c < this.c - 2; c++) {
        const cookie1 = this.tabcookies[l][c];
        const cookie2 = this.tabcookies[l][c + 1];
        const cookie3 = this.tabcookies[l][c + 2];
  
        if (cookie1.type === cookie2.type && cookie2.type === cookie3.type) {
          cookie1.selectionnee();
          cookie2.selectionnee();
          cookie3.selectionnee();
          console.log("alignement réussi");
          this.stockCookies.push(cookie1);
          this.stockCookies.push(cookie2);
          this.stockCookies.push(cookie3);
        }
      }
    }
  }
  
  detecterMatch3Colonnes() {
    for (let c = 0; c < this.c; c++) {
      for (let l = 0; l < this.l - 2; l++) {
        const cookie1 = this.tabcookies[l][c];
        const cookie2 = this.tabcookies[l + 1][c];
        const cookie3 = this.tabcookies[l + 2][c];
  
        if (cookie1.type === cookie2.type && cookie1.type === cookie3.type) {
          cookie1.selectionnee();
          cookie2.selectionnee();
          cookie3.selectionnee();
          console.log("alignement réussi");
          this.stockCookies.push(cookie1);
          this.stockCookies.push(cookie2);
          this.stockCookies.push(cookie3);
        }
      }
    }
  }

/**
 * Vérifie s'il y a des groupes de 3 cookies alignés horizontalement ou verticalement
 * et les marque comme candidats à la disparition.
 */
  detecterGroupesDeCookies() {
    this.detecterMatch3Lignes();
    this.detecterMatch3Colonnes();
  }

  supprimerCookiesMarques() {
    this.stockCookies.forEach((cookie) => {
      cookie.disparaitreCookie();
    });
    this.stockCookies = [];   
    this.tasserLesCookies();
  }


  /**
   * Tasse les cookies vers le bas en faisant tomber les cookies invisibles.
   */
  tasserLesCookies(colonne) {
    const lignes = this.tabcookies.length;
    let indexStart = -1;
    let indexEnd = -1;

    for (let l = lignes - 1; l >= 0; l--) {
      let cookie = this.tabcookies[l][colonne];
      if (cookie && cookie.type === -1) {
        if (indexStart === -1) {
          indexStart = l;
          console.log("indexStart = " + indexStart);
        }
      } else {
        if (indexStart !== -1) {
          indexEnd = l;
          break;
        }
      }
    }

    if (indexStart !== -1) {
      this.compacteColonne(colonne, indexStart, indexEnd);
      this.tasserLesCookies(colonne);
    }
}

compacteColonne(colonne, indexStart, indexEnd) {
  const lignes = this.tabcookies.length;
  if (indexEnd === -1) {
    for (let l = indexStart; l >= 0; l--) {
      let cookieACreer = this.tabcookies[l][colonne]
      cookieACreer.creationCookie();
    }
  } else {
    let cookie = this.tabcookies[indexEnd][colonne];
    let cookieVide = this.tabcookies[indexStart][colonne];

    Cookie.swapCookies(cookieVide, cookie);
    console.log("Swap de " + indexStart + " et " + indexEnd);
  }
}

  tasserColonnes() {
    for (let i = 0; i < this.tabcookies[0].length; i++) {
      this.tasserLesCookies(i);
    }
  }

/**
 * Compte le score. Lorsque 3 cookies sont alignés, on gagne 1 point,
 * 4 cookies alignés donnent 2 points et 5 cookies ou plus donnent 3 points.
 */
  compterScore() {
  }
}