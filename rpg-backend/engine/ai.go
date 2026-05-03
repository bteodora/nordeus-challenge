package engine

import (
    "math/rand"
    "rpg-backend/models"
    "os"
    "encoding/json"
)

func PickMonsterMove(monster models.Monster, state models.BattleState) models.Move {
	mode := loadAIMode()

	switch mode {
	case "random":
		return monster.Moves[rand.Intn(len(monster.Moves))]
	case "rule_based":
		return pickMonsterMoveHeuristic(monster, state)
	default: // "ql"
		if RL != nil && UseRL {
			idx := RL.SelectMove(monster, state)
			if idx >= 0 && idx < len(monster.Moves) {
				return monster.Moves[idx]
			}
		}
		return pickMonsterMoveHeuristic(monster, state)
	}
}

func loadAIMode() string {
	data, err := os.ReadFile("config/ai_config.json")
	if err != nil {
		return "ql"
	}
	var cfg struct {
		AIMode string `json:"ai_mode"`
	}
	if err := json.Unmarshal(data, &cfg); err != nil {
		return "ql"
	}
	return cfg.AIMode
}

func pickMonsterMoveHeuristic(monster models.Monster, state models.BattleState) models.Move {
    heroHPPct := float64(state.HeroHP) / float64(state.HeroMaxHP)
    monsterHPPct := float64(state.MonsterHP) / float64(state.MonsterMaxHP)
    isRaging := monsterHPPct < 0.30

    hasActiveBuff := func(who, stat string) bool {
        for _, b := range state.ActiveBuffs {
            if b.AffectsWho == who && b.TargetStat == stat && b.Amount > 0 {
                return true
            }
        }
        return false
    }

    hasActiveDebuff := func(who, stat string) bool {
        for _, b := range state.ActiveBuffs {
            if b.AffectsWho == who && b.TargetStat == stat && b.Amount < 0 {
                return true
            }
        }
        return false
    }

    findByEffect := func(effect string) *models.Move {
        for _, m := range monster.Moves {
            if m.Effect == effect {
                return &m
            }
        }
        return nil
    }

    // 1. CRITICAL: If HP < 25% and can heal/drain → prioritize survival
    if monsterHPPct < 0.25 {
        if m := findByEffect("heal"); m != nil {
            return *m
        }
        if m := findByEffect("drain"); m != nil {
            return *m
        }
    }

    // 2. If in rage (30-60% HP) → aggressive: prioritize damage moves
    if isRaging && monsterHPPct >= 0.30 && monsterHPPct < 0.60 {
        // Prefer heavy damage moves
        for _, m := range monster.Moves {
            if (m.Effect == "damage" || m.Effect == "damage_debuff") && m.BaseValue >= 25 {
                return m
            }
        }
    }

    // 3. Defense: If hero is buffed (high ATK) and monster not buffed → buff/debuff
    if hasActiveBuff("hero", "attack") && !hasActiveBuff("monster", "defense") {
        if m := findByEffect("buff"); m != nil && m.TargetStat == "defense" {
            return *m
        }
    }

    // 4. Offense: If hero has no defense debuff and hero HP > 50% → debuff attack
    if heroHPPct > 0.50 && !hasActiveDebuff("hero", "attack") {
        if m := findByEffect("debuff"); m != nil {
            return *m
        }
    }

    // 5. Smart buff timing: Turn 1-2 and no self-buffs → buff attack/magic
    if state.Turn <= 2 && !hasActiveBuff("monster", "attack") && !hasActiveBuff("monster", "magic") {
        if m := findByEffect("buff"); m != nil {
            return *m
        }
    }

    // 6. Mid-life drain: If 40-70% HP → consider healing moves
    if monsterHPPct >= 0.40 && monsterHPPct < 0.70 {
        if m := findByEffect("drain"); m != nil {
            if rand.Float64() > 0.6 { // 40% chance
                return *m
            }
        }
    }

    // 7. Weighted random for remaining moves
    return weightedRandom(monster.Moves)
}

func weightedRandom(moves []models.Move) models.Move {
    type weighted struct {
        move   models.Move
        weight int
    }

    var pool []weighted
    for _, m := range moves {
        w := 10 // default težina
        switch m.Effect {
        case "damage":
            w = 15
        case "drain":
            w = 12
        case "damage_debuff":
            w = 13
        case "buff", "buff_self_damage":
            w = 7
        case "debuff":
            w = 8
        }
        pool = append(pool, weighted{m, w})
    }

    total := 0
    for _, p := range pool {
        total += p.weight
    }

    roll := rand.Intn(total)
    cumulative := 0
    for _, p := range pool {
        cumulative += p.weight
        if roll < cumulative {
            return p.move
        }
    }

    return moves[0] // fallback
}


