package engine

import (
	"fmt"
	"log"
	"math"
	"math/rand"
	"sync"

	"rpg-backend/models"
)

// --- State Space ---

type QLState struct {
	HeroHPBucket     int // 0-4: 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
	MonsterHPBucket  int // 0-4
	HeroAtkDebuffed  bool
	HeroDefDebuffed  bool
	MonsterBuffed    bool
	IsRaging         bool
	Turn             int // capped at 10+
}

func discretizeHP(current, max int) int {
	if max == 0 {
		return 4
	}
	pct := float64(current) / float64(max)
	bucket := int(pct * 5)
	if bucket > 4 {
		bucket = 4
	}
	return bucket
}

func capTurn(turn int) int {
	if turn > 10 {
		return 10
	}
	return turn
}

func buildQLState(state models.BattleState) QLState {
	heroAtkDebuffed := false
	heroDefDebuffed := false
	monsterBuffed := false

	for _, b := range state.ActiveBuffs {
		if b.AffectsWho == "hero" && b.Amount < 0 {
			if b.TargetStat == "attack" {
				heroAtkDebuffed = true
			}
			if b.TargetStat == "defense" {
				heroDefDebuffed = true
			}
		}
		if b.AffectsWho == "monster" && b.Amount > 0 {
			monsterBuffed = true
		}
	}

	return QLState{
		HeroHPBucket:    discretizeHP(state.HeroHP, state.HeroMaxHP),
		MonsterHPBucket: discretizeHP(state.MonsterHP, state.MonsterMaxHP),
		HeroAtkDebuffed: heroAtkDebuffed,
		HeroDefDebuffed: heroDefDebuffed,
		MonsterBuffed:   monsterBuffed,
		IsRaging:        isRaging(state),
		Turn:            capTurn(state.Turn),
	}
}

func stateKey(s QLState) string {
	return fmt.Sprintf("%d_%d_%v_%v_%v_%v_%d",
		s.HeroHPBucket, s.MonsterHPBucket,
		s.HeroAtkDebuffed, s.HeroDefDebuffed,
		s.MonsterBuffed, s.IsRaging, s.Turn)
}

// --- Q-Table ---

type QTable map[string][]float64 // stateKey -> Q vrednosti po indeksu poteza

func getQ(qt QTable, key string, numMoves int) []float64 {
	if vals, ok := qt[key]; ok {
		return vals
	}
	vals := make([]float64, numMoves)
	qt[key] = vals
	return vals
}

func maxQ(vals []float64) (float64, int) {
	best := math.Inf(-1)
	idx := 0
	for i, v := range vals {
		if v > best {
			best = v
			idx = i
		}
	}
	return best, idx
}

// --- Simulacija za treniranje ---

type simState struct {
	heroHP      int
	heroMaxHP   int
	monsterHP   int
	monsterMaxHP int
	turn        int
	activeBuffs []models.ActiveBuff
}

func toBattleState(s simState, monsterStats, heroStats models.Stat, monsterID string) models.BattleState {
	return models.BattleState{
		HeroHP:       s.heroHP,
		HeroMaxHP:    s.heroMaxHP,
		MonsterHP:    s.monsterHP,
		MonsterMaxHP: s.monsterMaxHP,
		HeroStats:    heroStats,
		MonsterStats: monsterStats,
		ActiveBuffs:  s.activeBuffs,
		Turn:         s.turn,
		MonsterID:    monsterID,
	}
}

func simulateMonsterAction(s simState, move models.Move, monsterStats, heroStats models.Stat, monsterID string) (simState, float64) {
	bs := toBattleState(s, monsterStats, heroStats, monsterID)
	result := ResolveMove(move, bs, "monster")

	next := s
	next.turn++

	reward := 0.0

	// Damage na heroja
	if result.Damage > 0 && move.Effect != "buff_self_damage" {
		next.heroHP -= result.Damage
		if next.heroHP < 0 {
			next.heroHP = 0
		}
		reward += float64(result.Damage) * 0.3
	}

	// Self damage (Dark Pact)
	if move.Effect == "buff_self_damage" {
		next.monsterHP -= result.Damage
		if next.monsterHP < 0 {
			next.monsterHP = 0
		}
		reward -= float64(result.Damage) * 0.1
	}

	// Healing
	if result.Healing > 0 {
		next.monsterHP += result.Healing
		if next.monsterHP > next.monsterMaxHP {
			next.monsterHP = next.monsterMaxHP
		}
		// Nagradi healing samo kad je zaista potrebno
		monsterHPPct := float64(s.monsterHP) / float64(s.monsterMaxHP)
		if monsterHPPct < 0.5 {
			reward += float64(result.Healing) * 0.4
		} else {
			reward -= 1.0 // penalizuj healing kada nema potrebe
		}
	}

	// Buffovi/debuffovi
	if len(result.NewBuffs) > 0 {
		next.activeBuffs = append(next.activeBuffs, result.NewBuffs...)
		for _, b := range result.NewBuffs {
			if b.AffectsWho == "hero" && b.Amount < 0 {
				reward += 2.0 // debuff heroja
			}
			if b.AffectsWho == "monster" && b.Amount > 0 {
				// Nagradi buff samo u ranim turnovima
				if s.turn <= 2 {
					reward += 1.5
				} else {
					reward += 0.3
				}
			}
		}
	}

	// Tick buffove
	var activeNext []models.ActiveBuff
	for _, b := range next.activeBuffs {
		b.TurnsLeft--
		if b.TurnsLeft > 0 {
			activeNext = append(activeNext, b)
		}
	}
	next.activeBuffs = activeNext

	// Terminal rewards
	if next.heroHP <= 0 {
		reward += 20.0 // pobeda monstrea
	}
	if next.monsterHP <= 0 {
		reward -= 20.0 // poraz monstrea
	}

	return next, reward
}

func simulateHeroCounter(s simState, heroStats models.Stat) simState {
    // Hero uvek bira optimalni kontra-potez u simulaciji
    // Ako je monster HP nizak → attack
    // Ako je hero HP nizak → heal
    next := s
    
    // monsterHPPct := float64(s.monsterHP) / float64(s.monsterMaxHP)
    heroHPPct := float64(s.heroHP) / float64(s.heroMaxHP)
    
    if heroHPPct < 0.3 {
        // Heal: Second Wind, base 20, scales with magic 8
        healing := int(20 * (float64(heroStats.Magic) / 10.0))
        next.heroHP = min(s.heroMaxHP, s.heroHP+healing)
    } else {
        // Slash: physical damage
        atk := heroStats.Attack
        def := heroStats.Defense // monster defense ovde nije implementiran
        dmg := int(18 * (float64(atk) / 10.0) * (100.0 / (100.0 + float64(def))))
        if dmg < 1 { dmg = 1 }
        next.monsterHP -= dmg
        if next.monsterHP < 0 { next.monsterHP = 0 }
    }
    return next
}

func isTerminalSim(s simState) bool {
	return s.heroHP <= 0 || s.monsterHP <= 0 || s.turn > 30
}

// --- Treniranje ---

const (
	qlEpisodes     = 30000
	qlAlpha        = 0.15  // learning rate
	qlGamma        = 0.90  // discount
	qlEpsilonStart = 1.0
	qlEpsilonEnd   = 0.05
	qlEpsilonDecay = 0.9997
)

func trainQTable(monster models.Monster) QTable {
	qt := make(QTable)
	numMoves := len(monster.Moves)
	if numMoves == 0 {
		return qt
	}

	// Tipični hero statovi za treniranje
	heroStats := models.Stat{Health: 100, Attack: 10, Defense: 8, Magic: 8}

	epsilon := qlEpsilonStart

	for ep := 0; ep < qlEpisodes; ep++ {
		// Random inicijalni state
		s := simState{
			heroHP:       40 + rand.Intn(60),
			heroMaxHP:    100,
			monsterHP:    monster.Stats.Health,
			monsterMaxHP: monster.Stats.Health,
			turn:         1,
		}

		for !isTerminalSim(s) {
			bs := toBattleState(s, monster.Stats, heroStats, monster.ID)
			qlS := buildQLState(bs)
			key := stateKey(qlS)
			qVals := getQ(qt, key, numMoves)

			// Epsilon-greedy
			var actionIdx int
			if rand.Float64() < epsilon {
				actionIdx = rand.Intn(numMoves)
			} else {
				_, actionIdx = maxQ(qVals)
			}

			move := monster.Moves[actionIdx]
			nextS, reward := simulateMonsterAction(s, move, monster.Stats, heroStats, monster.ID)
			if !isTerminalSim(nextS) {
				nextS = simulateHeroCounter(nextS, heroStats)
			}
			s = nextS

			// Q-Learning update
			nextBS := toBattleState(nextS, monster.Stats, heroStats, monster.ID)
			nextKey := stateKey(buildQLState(nextBS))
			nextQVals := getQ(qt, nextKey, numMoves)
			bestNext, _ := maxQ(nextQVals)

			oldQ := qVals[actionIdx]
			newQ := oldQ + qlAlpha*(reward+qlGamma*bestNext-oldQ)
			qt[key][actionIdx] = newQ

			s = nextS
		}

		epsilon = math.Max(qlEpsilonEnd, epsilon*qlEpsilonDecay)
	}

	return qt
}

// --- Agent ---

type RLAgent struct {
	mu       sync.RWMutex
	policies map[string]QTable // monsterID -> QTable
}

var (
	RL    *RLAgent
	UseRL bool = false

	experienceBuffer    []Experience
	experienceThreshold = 50
	expMu               sync.Mutex
)

func NewRLAgent(monsters []models.Monster) *RLAgent {
	agent := &RLAgent{
		policies: make(map[string]QTable),
	}
	for _, m := range monsters {
		if len(m.Moves) == 0 {
			continue
		}
		log.Printf("[RL] Training Q-table for %s (%d episodes)...", m.Name, qlEpisodes)
		agent.policies[m.ID] = trainQTable(m)
		log.Printf("[RL] Done: %s — %d states learned", m.Name, len(agent.policies[m.ID]))
	}
	return agent
}

func (a *RLAgent) SelectMove(monster models.Monster, state models.BattleState) int {
    aggression := Adaptive.AggressionLevel(monster.ID)
    
    a.mu.RLock()
    qt, ok := a.policies[monster.ID]
    a.mu.RUnlock()

    if !ok || len(qt) == 0 {
        return a.adaptiveFallback(monster, state, aggression)
    }

    qlS := buildQLState(state)
    key := stateKey(qlS)

    a.mu.RLock()
    qVals, exists := qt[key]
    a.mu.RUnlock()

    if !exists {
        return a.adaptiveFallback(monster, state, aggression)
    }

    // Kombinuj Q-vrednosti sa aggression modifierom
    adjusted := make([]float64, len(qVals))
    for i, q := range qVals {
        move := monster.Moves[i]
        bonus := 0.0

        // Ako je aggression visok → boost damage movesima
        if aggression > 0.6 {
            if move.Effect == "damage" || move.Effect == "damage_debuff" {
                bonus = aggression * 5.0
            }
            // Penalizuj buffove kad je aggression visok
            if move.Effect == "buff" {
                bonus = -aggression * 3.0
            }
        }

        // Ako je aggression nizak → monster se "opušta"
        if aggression < 0.3 {
            // Izjednači Q-vrednosti → više random ponašanje
            bonus = rand.Float64() * 2.0
        }

        // Survival override — uvek healsuj kad je kritično
        // bez obzira na aggression
        monsterHPPct := float64(state.MonsterHP) / float64(state.MonsterMaxHP)
        if monsterHPPct < 0.25 {
            if move.Effect == "heal" || move.Effect == "drain" {
                bonus += 15.0 // guaranteed override
            }
        }

        adjusted[i] = q + bonus
    }

	// Detektuj spam i kontra-aj
	spamMove := Adaptive.HeroSpamMove(monster.ID)
	if spamMove != "" {
		// Ako hero spamuje physical → podigni defense
		// Ako hero spamuje magic → podigni magic resistance kroz debuff magic
		for i, m := range monster.Moves {
			if spamMove == "slash" || spamMove == "rusty_blade" {
				// Hero spamuje physical → buff monster defense
				if m.Effect == "buff" && m.TargetStat == "defense" {
					adjusted[i] += 8.0
				}
				// Ili debuff hero attack
				if m.Effect == "debuff" && m.TargetStat == "attack" {
					adjusted[i] += 6.0
				}
			}
		}
	}

    _, best := maxQ(adjusted)
    return best
}

func (a *RLAgent) adaptiveFallback(monster models.Monster, state models.BattleState, aggression float64) int {
    // Neviđeno stanje — koristi adaptive heuristiku umesto čiste heuristike
    if aggression > 0.6 {
        // Agresivni mod: heavy damage first
        for i, m := range monster.Moves {
            if m.Effect == "damage" && m.BaseValue >= 25 {
                return i
            }
        }
        for i, m := range monster.Moves {
            if m.Effect == "damage_debuff" {
                return i
            }
        }
    }
    
    // Default heuristika
    move := pickMonsterMoveHeuristic(monster, state)
    for i, m := range monster.Moves {
        if m.ID == move.ID {
            return i
        }
    }
    return 0
}

func (a *RLAgent) Retrain(monsters []models.Monster, newExps []Experience) {
	// Re-treniraj samo monstere koji su viđeni u novim iskustvima
	seen := map[string]bool{}
	for _, e := range newExps {
		seen[e.State.MonsterID] = true
	}

	for _, m := range monsters {
		if !seen[m.ID] || len(m.Moves) == 0 {
			continue
		}
		log.Printf("[RL] Retraining %s with %d new experiences...", m.Name, len(newExps))
		newQT := trainQTable(m)
		a.mu.Lock()
		a.policies[m.ID] = newQT
		a.mu.Unlock()
		log.Printf("[RL] Retrain done: %s", m.Name)
	}
}

// --- Experience buffer ---

type Experience struct {
	State    models.BattleState `json:"state"`
	ActionID string             `json:"action_id"`
	Reward   float64            `json:"reward"`
	Outcome  string             `json:"outcome"`
}

func AddExperience(exp Experience) {
	expMu.Lock()
	experienceBuffer = append(experienceBuffer, exp)
	ready := len(experienceBuffer) >= experienceThreshold
	expsCopy := make([]Experience, len(experienceBuffer))
	copy(expsCopy, experienceBuffer)
	expMu.Unlock()

	if ready && RL != nil {
		go func(exps []Experience) {
			cfg := LoadConfig()
			if cfg != nil {
				RL.Retrain(cfg.Monsters, exps)
			}
			expMu.Lock()
			experienceBuffer = nil
			expMu.Unlock()
		}(expsCopy)
	}
}