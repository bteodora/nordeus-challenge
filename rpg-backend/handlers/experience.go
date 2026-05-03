package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "rpg-backend/engine"
)

func RecordExperience(c *gin.Context) {
    var ex engine.Experience
    if err := c.ShouldBindJSON(&ex); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    engine.AddExperience(ex)
    heroWon := ex.Outcome == "lose" // monster izgubio = hero pobedio
    engine.Adaptive.RecordOutcome(ex.State.MonsterID, heroWon)
    engine.Adaptive.RecordHeroMove(ex.State.MonsterID, ex.ActionID)
    c.JSON(http.StatusOK, gin.H{"status": "ok"})
}


