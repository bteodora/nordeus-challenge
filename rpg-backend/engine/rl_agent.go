package engine

import (
    "sync"
    "rpg-backend/models"
)

// Experience is a minimal struct stored when running endless battles. In real RL this
// would include state, action, reward, next_state, done, etc. We keep it compact here
// and persist or expand later when training offline.
type Experience struct {
    State     models.BattleState `json:"state"`
    ActionID  string             `json:"action_id"`
    Reward    float64            `json:"reward"`
    Outcome   string             `json:"outcome"` // "win" | "lose"
}

// RLAgent is a placeholder agent; it exposes SelectMove and Train APIs.
type RLAgent struct {
    // In a full implementation we'd hold model weights, hyperparams, RNG seed, etc.
    // Keep minimal for now.
    mu sync.Mutex
}

var (
    // Agent instance and flags
    RL *RLAgent
    // When true, engine will consult RL.SelectMove instead of heuristic
    UseRL bool = false
    // In-memory experience buffer
    experienceBuffer []Experience
    // Threshold to enable RL policy after collecting experiences
    experienceThreshold = 50
    expMu sync.Mutex
)

func NewRLAgent() *RLAgent {
    return &RLAgent{}
}

// SelectMove should return the index of the chosen move in monster.Moves.
// Current implementation proxies to heuristic for safety; when trained this will
// run the learned policy.
func (a *RLAgent) SelectMove(monster models.Monster, state models.BattleState) int {
    // simple fallback: find heuristic move and return its index
    move := pickMonsterMoveHeuristic(monster, state)
    for i, m := range monster.Moves {
        if m.ID == move.ID {
            return i
        }
    }
    return 0
}

// Train receives experiences and (optionally) updates the internal policy. For now
// it just clears the buffer and flips UseRL to true to indicate training completed.
func (a *RLAgent) Train(exps []Experience) error {
    // In a real setup, you'd call a trainer here (Python/PyTorch) and load weights.
    // We keep it simple: mark RL as enabled once enough experiences were collected.
    a.mu.Lock()
    defer a.mu.Unlock()
    // stub: pretend we trained successfully
    UseRL = true
    return nil
}

// AddExperience appends to buffer; triggers Train when threshold reached.
func AddExperience(exp Experience) {
    expMu.Lock()
    experienceBuffer = append(experienceBuffer, exp)
    ready := len(experienceBuffer) >= experienceThreshold
    expsCopy := make([]Experience, len(experienceBuffer))
    copy(expsCopy, experienceBuffer)
    expMu.Unlock()

    if ready {
        // initialize agent if nil
        if RL == nil {
            RL = NewRLAgent()
        }
        // Call Train asynchronously to avoid blocking handlers
        go func(exps []Experience) {
            RL.Train(exps)
            // clear buffer after training
            expMu.Lock()
            experienceBuffer = nil
            expMu.Unlock()
        }(expsCopy)
    }
}
