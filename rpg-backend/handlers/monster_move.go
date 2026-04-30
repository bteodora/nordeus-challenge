package handlers

import (
    "github.com/gin-gonic/gin"
    "rpg-backend/engine"
    "rpg-backend/models"
)

// @Summary Get monster's next move
// @Description Returns monster move based on current battle state
// @Accept json
// @Produce json
// @Param state body models.BattleState true "Current battle state"
// @Success 200 {object} models.MoveResult
// @Router /api/monster/move [post]
func GetMonsterMove(c *gin.Context) {
    var state models.BattleState
    if err := c.ShouldBindJSON(&state); err != nil {
        c.JSON(400, gin.H{"error": "invalid battle state: " + err.Error()})
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