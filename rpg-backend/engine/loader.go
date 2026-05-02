package engine

import (
    "encoding/json"
    "os"
    "rpg-backend/models"
    "time"
)

var (
    lastModified time.Time
    cachedConfig *models.RunConfig
    // Temporary monsters registered for endless mode
    tempMonsters = make(map[string]*models.Monster)
)

func LoadConfig() *models.RunConfig {
    info, err := os.Stat("config/monsters.json")
    if err != nil {
        panic("cannot stat monsters.json: " + err.Error())
    }

    if cachedConfig != nil && !info.ModTime().After(lastModified) {
        return cachedConfig
    }

    // Učitaj moves
    movesData, _ := os.ReadFile("config/moves.json")
    var allMoves []models.Move
    json.Unmarshal(movesData, &allMoves)

    // Napravi map za brzo lookup
    moveMap := make(map[string]models.Move)
    for _, m := range allMoves {
        moveMap[m.ID] = m
    }

    // Učitaj monsters
    monstersData, _ := os.ReadFile("config/monsters.json")
    var monsters []models.Monster
    json.Unmarshal(monstersData, &monsters)

    // Populate Moves polje
    for i, monster := range monsters {
        for _, mid := range monster.MoveIDs {
            if m, ok := moveMap[mid]; ok {
                monsters[i].Moves = append(monsters[i].Moves, m)
            }
        }
    }

    // Hero start moves
    heroMoveIDs := []string{"slash", "shield_up", "battle_cry", "second_wind"}
    var heroMoves []models.Move
    for _, id := range heroMoveIDs {
        if m, ok := moveMap[id]; ok {
            heroMoves = append(heroMoves, m)
        }
    }

    cachedConfig = &models.RunConfig{
        Monsters: monsters,
        AllMoves: allMoves,
        HeroStartStats: models.Stat{
            Health:  100,
            Attack:  10,
            Defense: 8,
            Magic:   8,
        },
        HeroStartMoves: heroMoves,
    }

    // Try to load shop config if present
    shopData, err := os.ReadFile("config/shop.json")
    if err == nil {
        var shopItems []models.ShopItem
        if jerr := json.Unmarshal(shopData, &shopItems); jerr == nil {
            cachedConfig.ShopItems = shopItems
        }
    }

    lastModified = info.ModTime()
    return cachedConfig
}

func FindMonster(id string, config *models.RunConfig) *models.Monster {
    // Check temporary monsters first
    if mptr, ok := tempMonsters[id]; ok {
        return mptr
    }
    for i := range config.Monsters {
        if config.Monsters[i].ID == id {
            return &config.Monsters[i]
        }
    }
    return nil
}

// RegisterTemporaryMonster stores a temporary monster available for a short time
// RegisterTemporaryMonster stores a pointer to a temporary monster so it can be
// referenced by its generated ID during battles. It makes a copy to ensure the
// stored pointer is stable.
func RegisterTemporaryMonster(m models.Monster) {
    tm := m
    tempMonsters[tm.ID] = &tm
}