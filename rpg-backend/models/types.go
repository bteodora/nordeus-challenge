package models

import "encoding/json"

type Stat struct {
	Health  int `json:"health"`
	Attack  int `json:"attack"`
	Defense int `json:"defense"`
	Magic   int `json:"magic"`
}

type Move struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Type        string `json:"type"`   // "physical" | "magic"
	Effect      string `json:"effect"` // "damage" | "heal" | "buff" | "debuff"
	BaseValue   int    `json:"base_value"`
	TargetStat  string `json:"target_stat"` // koji stat buffuje/debuffuje
	BuffAmount  int    `json:"buff_amount"`
	BuffTurns   int    `json:"buff_turns"`
	Description string `json:"description"`
	HPCost      int    `json:"hp_cost,omitempty"`
	ManaCost    int    `json:"mana_cost,omitempty"`
}

type Monster struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	Sprite     string   `json:"sprite"`
	Stats      Stat     `json:"stats"`
	MoveIDs    []string `json:"moves"`
	Moves      []Move   `json:"-"`
	XPReward   int      `json:"xp_reward"`
	Difficulty int      `json:"difficulty"`
	CoinsReward int     `json:"coins_reward,omitempty"`
}

type BattleState struct {
	HeroHP       int          `json:"hero_hp"`
	HeroMaxHP    int          `json:"hero_max_hp"`
	MonsterHP    int          `json:"monster_hp"`
	MonsterMaxHP int          `json:"monster_max_hp"`
	HeroStats    Stat         `json:"hero_stats"`
	MonsterStats Stat         `json:"monster_stats"`
	ActiveBuffs  []ActiveBuff `json:"active_buffs"`
	Turn         int          `json:"turn"`
	MonsterID    string       `json:"monster_id"`
}

type ActiveBuff struct {
	TargetStat string `json:"target_stat"`
	Amount     int    `json:"amount"`
	TurnsLeft  int    `json:"turns_left"`
	AffectsWho string `json:"affects_who"` // "hero" | "monster"
}

type MoveResult struct {
	Move        Move         `json:"move"`
	Damage      int          `json:"damage"`
	Healing     int          `json:"healing"`
	BuffApplied *ActiveBuff  `json:"buff_applied,omitempty"`
	NewBuffs    []ActiveBuff `json:"new_buffs"`
	MonsterTell *Move        `json:"monster_tell,omitempty"`
	IsRaging    bool         `json:"is_raging"`
}

// MarshalJSON customizuje JSON output da koristi Moves umesto MoveIDs
func (m Monster) MarshalJSON() ([]byte, error) {
	return json.Marshal(map[string]interface{}{
		"id":         m.ID,
		"name":       m.Name,
		"sprite":     m.Sprite,
		"stats":      m.Stats,
		"moves":      m.Moves,
		"xp_reward":  m.XPReward,
		"difficulty": m.Difficulty,
	})
}

type RunConfig struct {
	Monsters       []Monster `json:"monsters"`
	AllMoves       []Move    `json:"all_moves"`
	HeroStartStats Stat      `json:"hero_start_stats"`
	HeroStartMoves []Move    `json:"hero_start_moves"`
	ShopItems      []ShopItem `json:"shop_items,omitempty"`
}

type ShopItem struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"` // "move" | "stat"
	Move *Move `json:"move,omitempty"`
	Stat string `json:"stat,omitempty"`
	Amount int `json:"amount,omitempty"`
	Cost int `json:"cost"`
	Description string `json:"description"`
}
