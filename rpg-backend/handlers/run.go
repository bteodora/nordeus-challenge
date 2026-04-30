package handlers

import (
    "github.com/gin-gonic/gin"
    "rpg-backend/engine"
)

// @Summary Get run configuration
// @Description Returns full battle config for a new run
// @Produce json
// @Success 200 {object} models.RunConfig
// @Router /api/run/config [get]
func GetRunConfig(c *gin.Context) {
    config := engine.LoadConfig()
    c.JSON(200, config)
}