package engine

import "sync"

type AdaptiveAI struct {
    mu            sync.Mutex
    battles       map[string]int
    heroWins      map[string]int
    heroMoveCount map[string]map[string]int // monsterID -> moveID -> count
}

var Adaptive = &AdaptiveAI{
    battles:       make(map[string]int),
    heroWins:      make(map[string]int),
    heroMoveCount: make(map[string]map[string]int),
}

func (a *AdaptiveAI) RecordOutcome(monsterID string, heroWon bool) {
    a.mu.Lock()
    defer a.mu.Unlock()
    a.battles[monsterID]++
    if heroWon {
        a.heroWins[monsterID]++
    }
}

func (a *AdaptiveAI) RecordHeroMove(monsterID, moveID string) {
    if moveID == "" {
        return
    }
    a.mu.Lock()
    defer a.mu.Unlock()
    if a.heroMoveCount[monsterID] == nil {
        a.heroMoveCount[monsterID] = make(map[string]int)
    }
    a.heroMoveCount[monsterID][moveID]++
}

// HeroSpamMove vraća moveID koji hero koristi >50% vremena, ili "" ako nema spama
func (a *AdaptiveAI) HeroSpamMove(monsterID string) string {
    a.mu.Lock()
    defer a.mu.Unlock()
    moves := a.heroMoveCount[monsterID]
    if len(moves) == 0 {
        return ""
    }
    total := 0
    for _, count := range moves {
        total += count
    }
    if total < 5 { // premalo podataka
        return ""
    }
    for moveID, count := range moves {
        if float64(count)/float64(total) > 0.50 {
            return moveID
        }
    }
    return ""
}

func (a *AdaptiveAI) AggressionLevel(monsterID string) float64 {
    a.mu.Lock()
    defer a.mu.Unlock()
    total := a.battles[monsterID]
    if total < 3 {
        return 0.5
    }
    return float64(a.heroWins[monsterID]) / float64(total)
}