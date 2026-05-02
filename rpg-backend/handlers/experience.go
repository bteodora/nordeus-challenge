package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "rpg-backend/engine"
)

// RecordExperience accepts minimal experience JSON and forwards to engine.
func RecordExperience(c *gin.Context) {
    var ex engine.Experience
    if err := c.ShouldBindJSON(&ex); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    engine.AddExperience(ex)
    c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
