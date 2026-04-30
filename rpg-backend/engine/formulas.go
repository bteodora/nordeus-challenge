package engine

import (
	"math"
	"rpg-backend/models"
)

// Physical damage: skalira sa Attack, redukuje Defense
func CalcPhysicalDamage(attackerAtk, defenderDef, baseValue int) int {
    raw := float64(baseValue) * (float64(attackerAtk) / 10.0)
    reduced := raw * (100.0 / (100.0 + float64(defenderDef)))
    return int(math.Max(1, reduced))
}

// Magic damage: skalira sa Magic, ignoriše Defense
func CalcMagicDamage(attackerMag, baseValue int) int {
    result := float64(baseValue) * (float64(attackerMag) / 10.0)
    return int(math.Max(1, result))
}

// Heal: skalira sa Magic
func CalcHeal(casterMag, baseValue int) int {
    return int(float64(baseValue) * (float64(casterMag) / 10.0))
}

// GetEffectiveStat — primeni sve aktivne buffove na stat
func GetEffectiveStat(base int, statName string, buffs []models.ActiveBuff, affectsWho string) int {
    total := base
    for _, b := range buffs {
        if b.AffectsWho == affectsWho && b.TargetStat == statName {
            total += b.Amount
        }
    }
    if total < 1 {
        return 1 // nikad ispod 1
    }
    return total
}

// TickBuffs — smanji TurnsLeft za 1, vrati samo one koji su još aktivni
func TickBuffs(buffs []models.ActiveBuff) []models.ActiveBuff {
    active := []models.ActiveBuff{}
    for _, b := range buffs {
        b.TurnsLeft--
        if b.TurnsLeft > 0 {
            active = append(active, b)
        }
    }
    return active
}