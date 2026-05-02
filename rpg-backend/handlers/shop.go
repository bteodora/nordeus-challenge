package handlers

import (
    "net/http"
    "rpg-backend/engine"

    "github.com/gin-gonic/gin"
)

// GetShop returns shop items from the run config
func GetShop(c *gin.Context) {
    cfg := engine.LoadConfig()
    c.JSON(http.StatusOK, cfg.ShopItems)
}
