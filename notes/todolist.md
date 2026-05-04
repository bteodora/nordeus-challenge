OSNOVNI KLIJENT (UI)
[x] Main Menu: Dugme za početak novog run-a 
[~] Main Menu: Dugme za izlaz iz igre - dugme postoji, ali nije povezano sa nikakvom akcijom 
[x] Run Map: Vizuelni prikaz svih 5 predstojećih protivnika 
[x] Run Map: Opcija za ulazak u selektovanu borbu 
[X] Move Management: Ekran za pregled svih naučenih poteza - naučeni potezi postoje u state-u i prikazuju se nakon borbe, ali nema posebnog move management ekrana 
[X] Move Management: Sistem za opremanje/izmenu (swap) poteza pre borbe - swap radi iz post-battle ekrana, ali nema posebnog pre-battle ekrana 
[x] Battle Screen: Vizuelni prikaz heroja i čudovišta 
[x] Battle Screen: Prikaz HP bara za oba karaktera 
[x] Battle Screen: Interfejs za biranje poteza (hero turn) 
[x] Post-Battle: Ekran koji prikazuje koji je novi potez naučen nakon pobede 

SERVER & LOGIKA
[x] Endpoint GET /run-config: Vraća listu od 5 čudovišta, njihove stats i moves 
[x] Endpoint GET /monster-move: Prima stanje borbe i vraća potez bota 
[x] Server-side logika: Većina monstruozne AI logike i resolucije poteza je na serveru, ali hero potezi i deo borbenih proračuna su i dalje na klijentu 

SISTEM BORBE I STATISTIKE
[x] Kalkulacija: Fizički napadi (Attack vs Defense) 
[x] Kalkulacija: Magični napadi (Magic - zaobilazi Defense) 
[x] Buff/Debuff sistem: Implementirano trajanje efekata (npr. +Defense na 2 turn-a) 
[x] Healing sistem: Potezi koji vraćaju HP 
[x] Progresivna težina: Čudovišta na kasnijim nivoima imaju jače stats 

PROGRESIJA (LEVELING)
[x] XP sistem: Dodela iskustva nakon svake borbe 
[x] Level Up: Automatsko povećanje stats (Health, Attack, Defense, Magic) 
[~] Replay: Mogućnost ponovnog igranja nivoa radi grinding-a ili učenja novih poteza - možeš nastaviti kroz run i ići dalje kroz mapu, ali nema eksplicitnog replay dugmeta za istu borbu 

DODACI I POLIRANJE (OPCIONO)
[x] Hover opisi: Tekstualni opis šta svaki potez radi 
[x] Battle Log: Lista odigranih poteza tokom borbe - log se čuva u state-u, ali nije prikazan kao zaseban UI element 
[x] Animacije: Vizuelni fidbek pri udarcima ili lečenju 

FINALNI KORACI
[ ] Screen recording: Snimak gameplay-a gde se vide sve funkcionalnosti 
[ ] README: Uputstvo kako pokrenuti klijent i server 
[ ] LinkedIn: Ažuriran profil spreman za slanje 