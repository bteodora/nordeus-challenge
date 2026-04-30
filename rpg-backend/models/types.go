type Stat struct {
    Health  int `json:"health"`
    Attack  int `json:"attack"`
    Defense int `json:"defense"`
    Magic   int `json:"magic"`
}

type Move struct {
    ID          string `json:"id"`
    Name        string `json:"name"`
    Type        string `json:"type"`    // "physical" | "magic"
    Effect      string `json:"effect"`  // "damage" | "heal" | "buff" | "debuff"
    BaseValue   int    `json:"base_value"`
    TargetStat  string `json:"target_stat"`  // koji stat buffuje/debuffuje
    BuffAmount  int    `json:"buff_amount"`
    BuffTurns   int    `json:"buff_turns"`
    Description string `json:"description"`
}

type Monster struct {
    ID       string `json:"id"`
    Name     string `json:"name"`
    Sprite   string `json:"sprite"`
    Stats    Stat   `json:"stats"`
    Moves    []Move `json:"moves"`
    XPReward int    `json:"xp_reward"`
    Difficulty int  `json:"difficulty"` // 1-5 za map preview
}

type BattleState struct {
    HeroHP          int            `json:"hero_hp"`
    HeroMaxHP       int            `json:"hero_max_hp"`
    MonsterHP       int            `json:"monster_hp"`
    MonsterMaxHP    int            `json:"monster_max_hp"`
    HeroStats       Stat           `json:"hero_stats"`
    MonsterStats    Stat           `json:"monster_stats"`
    ActiveBuffs     []ActiveBuff   `json:"active_buffs"`
    Turn            int            `json:"turn"`
    MonsterID       string         `json:"monster_id"`
}

type ActiveBuff struct {
    TargetStat  string `json:"target_stat"`
    Amount      int    `json:"amount"`
    TurnsLeft   int    `json:"turns_left"`
    AffectsWho  string `json:"affects_who"` // "hero" | "monster"
}