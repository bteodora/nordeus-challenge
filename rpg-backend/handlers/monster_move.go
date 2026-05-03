package handlers

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
	"rpg-backend/engine"
	"rpg-backend/models"
)

// @Summary Get monster's next move
// @Description Returns monster move based on current battle state
// @Accept json
// @Produce json
// @Param state body models.BattleState true "Current battle state as JSON"
// @Success 200 {object} models.MoveResult
// @Router /api/monster/move [post]
// GetMonsterMove accepts POST JSON body with the battle state. For backwards compatibility
// it also accepts GET with a `state` query parameter containing JSON.
func GetMonsterMove(c *gin.Context) {
	var state models.BattleState

	// Prefer JSON body (frontend uses POST). If absent, fall back to query param.
	if err := c.ShouldBindJSON(&state); err != nil {
		// try query param fallback
		stateRaw := c.Query("state")
		if stateRaw == "" {
			c.JSON(400, gin.H{"error": "missing required battle state in request body or 'state' query param"})
			return
		}
		if err := json.Unmarshal([]byte(stateRaw), &state); err != nil {
			c.JSON(400, gin.H{"error": "invalid battle state json: " + err.Error()})
			return
		}
	}

	config := engine.LoadConfig()
	monster := engine.FindMonster(state.MonsterID, config)
	if monster == nil {
		c.JSON(404, gin.H{"error": "monster not found: " + state.MonsterID})
		return
	}

	if len(monster.Moves) == 0 {
        c.JSON(500, gin.H{"error": "monster has no moves: " + state.MonsterID})
        return
    }


	// AI bira potez
	move := engine.PickMonsterMove(*monster, state)
	// Resolvi potez u rezultat
	result := engine.ResolveMove(move, state, "monster")
	// Prefetch sledeci potez za MonsterTell
	nextMove := engine.PickMonsterMove(*monster, state)
	result.MonsterTell = &nextMove

	c.JSON(200, result)
}
