package engine

import (
    "math/rand"
    "rpg-backend/models"
)

func PickMonsterMove(monster models.Monster, state models.BattleState) models.Move {
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

    findByEffect := func(effect string) *models.Move {
        for _, m := range monster.Moves {
            if m.Effect == effect {
                return &m
            }
        }
        return nil
    }

    // 1. Ako je u rage i može da healsuje — uvek healsuje
    if isRaging {
        if m := findByEffect("heal"); m != nil {
            return *m
        }
        if m := findByEffect("drain"); m != nil {
            return *m
        }
    }

    // 2. Debuff hero Attack ako heroj nije već debuffovan i ima visok HP
    if heroHPPct > 0.60 && !hasActiveBuff("hero", "attack") {
        if m := findByEffect("debuff"); m != nil {
            return *m
        }
    }

    // 3. Buff sebe u ranim turnovima
    if state.Turn <= 2 && !hasActiveBuff("monster", "attack") && !hasActiveBuff("monster", "magic") {
        if m := findByEffect("buff"); m != nil {
            return *m
        }
    }

    // 4. Drain Life ako HP između 30-60%
    if monsterHPPct < 0.60 && monsterHPPct >= 0.30 {
        if m := findByEffect("drain"); m != nil {
            return *m
        }
    }

    // 5. Weighted random za ostalo — heavy damage moveseti imaju veću težinu
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