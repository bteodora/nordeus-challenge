package engine

import (
	"math"
	"rpg-backend/models"
)

func ResolveMove(move models.Move, state models.BattleState, actor string) models.MoveResult {
	result := models.MoveResult{
		Move:     move,
		NewBuffs: []models.ActiveBuff{},
		IsRaging: isRaging(state),
	}

	// Efektivni statovi sa buffovima
	var atkStat, defStat, magStat int
	if actor == "monster" {
		atkStat = GetEffectiveStat(state.MonsterStats.Attack, "attack", state.ActiveBuffs, "monster")
		magStat = GetEffectiveStat(state.MonsterStats.Magic, "magic", state.ActiveBuffs, "monster")
		defStat = GetEffectiveStat(state.HeroStats.Defense, "defense", state.ActiveBuffs, "hero")
	} else {
		atkStat = GetEffectiveStat(state.HeroStats.Attack, "attack", state.ActiveBuffs, "hero")
		magStat = GetEffectiveStat(state.HeroStats.Magic, "magic", state.ActiveBuffs, "hero")
		defStat = GetEffectiveStat(state.MonsterStats.Defense, "defense", state.ActiveBuffs, "monster")
	}

	switch move.Effect {
	case "damage":
		if move.Type == "physical" {
			dmg := CalcPhysicalDamage(atkStat, defStat, move.BaseValue)
			if actor == "monster" && isRaging(state) {
				dmg = applyRageMultiplier(dmg, true)
			}
			result.Damage = dmg
		} else {
			dmg := CalcMagicDamage(magStat, move.BaseValue)
			if actor == "monster" && isRaging(state) {
				dmg = applyRageMultiplier(dmg, true)
			}
			result.Damage = dmg
		}

	case "heal":
		if actor == "monster" {
			result.Healing = CalcHeal(state.MonsterStats.Magic, move.BaseValue)
		} else {
			result.Healing = CalcHeal(state.HeroStats.Magic, move.BaseValue)
		}

	case "drain":
		dmg := CalcMagicDamage(magStat, move.BaseValue)
		result.Damage = dmg
		result.Healing = dmg // heal za isti iznos

	case "buff":
		buff := models.ActiveBuff{
			TargetStat: move.TargetStat,
			Amount:     move.BuffAmount,
			TurnsLeft:  move.BuffTurns,
			AffectsWho: actor,
		}
		result.NewBuffs = append(result.NewBuffs, buff)
		result.BuffApplied = &buff

	case "debuff":
		target := "hero"
		if actor == "hero" {
			target = "monster"
		}
		buff := models.ActiveBuff{
			TargetStat: move.TargetStat,
			Amount:     move.BuffAmount, // negativan broj
			TurnsLeft:  move.BuffTurns,
			AffectsWho: target,
		}
		result.NewBuffs = append(result.NewBuffs, buff)
		result.BuffApplied = &buff

	case "damage_debuff":
		// Damage deo
		if move.Type == "physical" {
			result.Damage = CalcPhysicalDamage(atkStat, defStat, move.BaseValue)
		} else {
			result.Damage = CalcMagicDamage(magStat, move.BaseValue)
		}
		// Debuff deo
		target := "hero"
		if actor == "hero" {
			target = "monster"
		}
		buff := models.ActiveBuff{
			TargetStat: move.TargetStat,
			Amount:     move.BuffAmount,
			TurnsLeft:  move.BuffTurns,
			AffectsWho: target,
		}
		result.NewBuffs = append(result.NewBuffs, buff)
		result.BuffApplied = &buff

	case "buff_self_damage":
		// Dark Pact — buff + self damage
		selfDmg := int(math.Max(1, float64(move.BaseValue)))
		result.Damage = selfDmg // ovo ide na samog castera
		buff := models.ActiveBuff{
			TargetStat: move.TargetStat,
			Amount:     move.BuffAmount,
			TurnsLeft:  move.BuffTurns,
			AffectsWho: actor,
		}
		result.NewBuffs = append(result.NewBuffs, buff)
		result.BuffApplied = &buff
	}

	return result
}

func isRaging(state models.BattleState) bool {
	if state.MonsterMaxHP == 0 {
		return false
	}
	return float64(state.MonsterHP)/float64(state.MonsterMaxHP) < 0.30
}

func applyRageMultiplier(damage int, raging bool) int {
	if raging {
		return int(float64(damage) * 1.2)
	}
	return damage
}
