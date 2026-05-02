package handlers

import (
    "math/rand"
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "rpg-backend/engine"
    "rpg-backend/models"
)

// GetEndlessMonster spawns a temporary monster for endless mode.
// Query param: wins (int) - number of consecutive wins so far.
// Response: { monster: Monster, monster_id: string, coins: int, regen_every: int, regen_amount_pct: float }
func GetEndlessMonster(c *gin.Context) {
    winsRaw := c.Query("wins")
    wins := 0
    if winsRaw != "" {
        if v, err := strconv.Atoi(winsRaw); err == nil {
            wins = v
        }
    }

    cfg := engine.LoadConfig()
    if cfg == nil || len(cfg.Monsters) == 0 {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "no monsters configured"})
        return
    }

    // Stabilan seed — wins + timestamp u sekundama (ne nano)
    src := rand.NewSource(time.Now().Unix() + int64(wins*1000))
    rng := rand.New(src)

    maxDifficulty := 1 + wins/3
    if maxDifficulty > 5 {
        maxDifficulty = 5
    }

    candidates := []models.Monster{}
    for _, m := range cfg.Monsters {
        if m.Difficulty <= maxDifficulty {
            candidates = append(candidates, m)
        }
    }
    if len(candidates) == 0 {
        candidates = cfg.Monsters
    }

    choice := candidates[rng.Intn(len(candidates))]
    
    // Koristi ORIGINALNI ID — ne pravi temp kopiju sa novim ID-em!
    // Server već ima ovaj monster u config-u, FindMonster će ga naći
    baseCoins := choice.CoinsReward
    if baseCoins == 0 {
        baseCoins = choice.Difficulty * 20
    }
    scaled := int(float64(baseCoins) * (1.0 + float64(wins)*0.05))

    // Preview upcoming
    previewCount := 3
    upcoming := []gin.H{}
    for i := 0; i < previewCount; i++ {
        m := candidates[rng.Intn(len(candidates))]
        upcoming = append(upcoming, gin.H{
            "type":    "monster",
            "monster": m,
        })
    }

    c.JSON(http.StatusOK, gin.H{
        "monster":          choice,      // ← originalni monster sa originalnim ID-em
        "monster_id":       choice.ID,   // ← nije temp ID
        "coins":            scaled,
        "regen_every":      5,
        "regen_amount_pct": 0.20,
        "upcoming":         upcoming,
    })
}
