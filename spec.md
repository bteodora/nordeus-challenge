# Full Stack Challenge | Nordeus
### Job Fair 2026


## 🎮 Dobrodošli u tim!
Zamisli da si se upravo pridružio gaming studiju kao **Full Stack Engineer**. Čestitamo!  Ti si jedini inženjer u malom timu, što znači da si odgovoran i za **klijentski** i za **serverski** deo aplikacije.  Tvoj Game Designer je već razradio koncept i viziju – tvoj zadatak je da to izgradiš. 

## ⚔️ Igra
Tvoj Game Designer je zamislio **turn-based RPG** u kojoj igrač kontroliše heroja koji se bori protiv niza od **5 čudovišta**.  

* **Nivoi:** Čudovišta predstavljaju nivoe - suočavaš se sa njima jedan po jedan, redom.
* **Borba:** Potezna borba - heroj bira potez, čudovište odgovara, i tako naizmenično dok nečiji HP ne padne na nulu.
* **Učenje veština:** Heroj kreće sa osnovnim setom poteza. Nakon pobede nad čudovištem, nasumično uči jedan od njegovih poteza koji može opremiti pre sledeće borbe. 
* **XP:** Igrač može ponavljati borbe kako bi sakupljao iskustvo (XP) za nivoe ili pokušao da nauči nove poteze. 

---

## 🛠️ Šta treba izgraditi?

### Klijent (Client)
*   **Glavni meni:** Start a new run, Exit the game. 
*   **Mapa / Pregled:** Prikaz svih predstojećih borbi. Igrač može da klikne na borbu, vidi trenutne poteze ili otvori ekran za upravljanje potezima. 
*   **Ekran borbe:** Vizuelni prikaz heroja i čudovišta, prikaz HP-a i selekcija poteza. 
*   **Post-borba:** Ako igrač pobedi, prikazuje se koji je potez naučio i on postaje dostupan za buduće bitke. 
*   **Progresija:** Heroj kreće od Levela 1. Level up povećava statistike: *Attack, Defense, Health, Magic*. 

### Server
Logika igre treba da ostane na serveru radi brzih izmena. Potrebna su dva endpoint-a: 
1.  **GET (Run Config):** Poziva se na početku run-a. Vraća konfiguraciju o 5 čudovišta, njihovim statistikama i potezima. 
2.  **GET (Monster Move):** Poziva se nakon svakog poteza igrača. Server prima stanje borbe i odgovara potezom koji čudovište povlači. 

---

## 📊 Sistemi igre

### Statistike (Stats)
Svi likovi imaju četiri osnovne statistike: 
*   **Health:** Hit poeni. Nula znači kraj borbe. 
*   **Attack:** Skalira fizičku štetu. 
*   **Defense:** Smanjuje dolaznu fizičku štetu. 
*   **Magic:** Skalira magičnu štetu i lečenje. 

### Potezi (Moves)
*   **Physical:** Skaliraju se prema Attack-u, smanjuje ih Defense mete. 
*   **Magic:** Skaliraju se prema Magic-u, potpuno zaobilaze Defense. 

---

## 📝 Spisak likova i poteza (Primeri)

| Lik | Potezi |
| :--- | :--- |
| **Knight** | Slash, Shield Up, Battle Cry, Second Wind  |
| **Witch** | Shadow Bolt, Drain Life, Curse, Dark Pact  |
| **Giant Spider** | Bite, Web Throw, Pounce, Skitter  |
| **Dragon** | Flame Breath, Claw Swipe, Intimidate, Dragon Scales  |
| **Goblin Warrior**| Rusty Blade, Dirty Kick, Frenzy, Headbutt  |
| **Goblin Mage** | Firebolt, Arcane Surge, Mana Drain, Hex Shield  |

---

## 💡 Bonus ideje (Game Designer's Notes)
Ako završiš srž, razmotri: 
1. Opis poteza na hover. 
2. Biranje statistike na level up-u. 
3. Status efekti (Bleed, Poison). 
4. Resursi (Mana/HP trošak). 
5. Save & Exit sistem. 
6. Pametniji botovi (AI koji se leči kad je low HP). 
7. Branching paths (kao Slay the Spire). 

---

## 📨 Slanje rada
*   **Email:** jobfair@nordeus.com 
*   **Subject:** `FullStack Challenge` 
*   **Sadržaj:** Puno ime, LinkedIn link, link ka Github-u ili zip fajlu. 
*   **Bonus:** Pošalji screen recording igranja. 
*   **Rok:** 3. maj 2026. 

