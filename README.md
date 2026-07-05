# Správce týmů ve sportovním klubu

Tento projekt je Angular aplikace pro správu sportovních týmů a jejich soupisek. Vznikl jako vypracování zadání pro výběrové řízení.

## Implementované funkcionality

### Správa týmů
- **Zobrazení seznamu týmů:** Přehled všech existujících týmů.
- **Přidání nového týmu:** Možnost vytvořit nový tým pomocí modálního okna.
- **Editace názvu týmu:** Inline úprava názvu přímo v detailu týmu.
- **Smazání týmu:** Možnost smazat tým s potvrzovacím dialogem.

### Správa soupisky
- **Zobrazení soupisky:** V detailu týmu je vidět seznam všech členů.
- **Přidání člena na soupisku:** Modální okno pro výběr sportovce, který ještě není v žádném týmu.
  - Možnost definovat roli (Hráč, Trenér, Hráč i trenér) a pozici.
  - Po přidání se zobrazí 2sekundový načítací stav a formulář se automaticky zavře.
- **Úprava člena na soupisce:** Inline editace role a pozice člena.
- **Odebrání člena ze soupisky:** Možnost odebrat člena s potvrzovacím dialogem.

### Bonusové funkcionality
- **Vyhledávání:** Na hlavní stránce lze vyhledávat týmy podle jejich názvu nebo podle jména kteréhokoliv člena na jejich soupisce.

## Technologický stack
- Angular
- RxJS
- TypeScript

## Spuštění projektu

1.  Naklonujte repozitář a v terminálu spusťte `npm install` pro instalaci.
2.  Spusťte vývojový server pomocí příkazu `ng serve`.
3.  Aplikace bude dostupná na adrese `http://localhost:4200/`.