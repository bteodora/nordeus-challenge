package handlers

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
	"rpg-backend/engine"
	"rpg-backend/models"
)

// @Summary Get monster's next move
// @Description Returns monster move based on current battle state
// @Produce json
// @Param state query string true "Current battle state as JSON"
// @Success 200 {object} models.MoveResult
// @Router /api/monster/move [get]
func GetMonsterMove(c *gin.Context) {
	stateRaw := c.Query("state")
	if stateRaw == "" {
		c.JSON(400, gin.H{"error": "missing required query param: state"})
		return
	}

	var state models.BattleState
	if err := json.Unmarshal([]byte(stateRaw), &state); err != nil {
		c.JSON(400, gin.H{"error": "invalid battle state json: " + err.Error()})
		return
	}

	config := engine.LoadConfig()
	monster := engine.FindMonster(state.MonsterID, config)
	if monster == nil {
		c.JSON(404, gin.H{"error": "monster not found: " + state.MonsterID})
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
