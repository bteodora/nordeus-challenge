package main

import (
	"rpg-backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"os"
	_ "rpg-backend/docs" // generisano od swaggo
)

// @title RPG Gauntlet API
// @version 1.0
// @description Backend za Nordeus Full Stack Challenge
// @host localhost:8080
// @BasePath /api
func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"}, 
		AllowMethods: []string{"GET", "POST", "OPTIONS"},
		AllowHeaders: []string{"Content-Type"},
	}))

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")
	api.GET("/run/config", handlers.GetRunConfig)
	api.POST("/monster/move", handlers.GetMonsterMove)
	api.GET("/shop", handlers.GetShop)
	api.GET("/monster/reward", handlers.GetMonsterReward)
		api.GET("/endless/monster", handlers.GetEndlessMonster)
	api.POST("/endless/experience", handlers.RecordExperience)

	port := os.Getenv("PORT")
    if port == "" {
        port = "8081"
    }
    r.Run(":" + port)
}
