package handlers

import (
    "net/http"
    "rpg-backend/engine"

    "github.com/gin-gonic/gin"
)

// GetMonsterReward returns coin reward for given monster id
func GetMonsterReward(c *gin.Context) {
    id := c.Query("monster_id")
    cfg := engine.LoadConfig()
    m := engine.FindMonster(id, cfg)
    if m == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "monster not found"})
        return
    }
    // default reward: difficulty * 20, but prefer CoinsReward if set
    reward := m.Difficulty * 20
    if m.CoinsReward > 0 {
        reward = m.CoinsReward
    }
    c.JSON(http.StatusOK, gin.H{"coins": reward})
}
