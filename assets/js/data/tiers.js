/* =================================================================
   OPERATOR TIER LIST
   -----------------------------------------------------------------
   This is an editorial ranking, not an official Ubisoft number.

   How it was built:
     - Community consensus (Reddit, guides, pro player opinions);
     - Pick and ban rates plus impact in professional matches;
     - How much a single operator changes a round on its own.

   Tiers, from strongest to weakest:
     S = meta-defining
     A = strong
     B = solid / situational
     C = niche / beginner-friendly

   An operator is referenced by its "id" (see data/operators.js),
   so the page always shows the current name, side and portrait.
   ================================================================= */
window.R6HUB = window.R6HUB || {};

window.R6HUB.tiers = {
  updated: "2026-09-28",
  intro: "Best operators right now, mixing community opinion with performance in pro matches. " +
    "It is an opinion-based guide, not an official ranking.",
  method: [
    "Community consensus: guides, forums and pro player tier lists.",
    "Competitive impact: pick and ban rates and round-changing power.",
    "Versatility: how many sites, maps and team compositions an operator fits."
  ],
  tiers: [
    {
      id: "s", label: "S", title: "Meta-defining",
      description: "Priority picks or bans. They shape how a round is played.",
      operators: [
        "thatcher", "smoke", "mute", "jager", "bandit",
        "valkyrie", "mira", "kaid", "azami", "solis"
      ]
    },
    {
      id: "a", label: "A", title: "Strong",
      description: "Reliable, high impact and almost always useful.",
      operators: [
        "sledge", "ash", "thermite", "twitch", "iq", "buck", "hibana", "jackal",
        "zofia", "dokkaebi", "lion", "nomad", "ace",
        "echo", "lesion", "ela", "maestro", "wamai", "melusi", "aruni", "fenrir"
      ]
    },
    {
      id: "b", label: "B", title: "Solid / situational",
      description: "Good in the right hands or on the right map and site.",
      operators: [
        "montagne", "glaz", "fuze", "blitz", "blackbeard", "capitao", "ying",
        "maverick", "finka", "gridlock", "nokk", "kali", "iana", "zero", "flores",
        "osa", "brava", "ram", "deimos", "grim",
        "castle", "pulse", "doc", "rook", "kapkan", "tachanka", "frost", "caveira",
        "vigil", "alibi", "mozzie", "goyo", "thunderbird", "thorn", "tubarao", "skopos"
      ]
    },
    {
      id: "c", label: "C", title: "Niche / beginner",
      description: "Great for learning or for a very specific role, but not a default pick.",
      operators: [
        "striker", "amaru", "sens", "ra[u]ora", "solid-snake",
        "sentry", "clash", "warden", "oryx", "denari", "noor"
      ]
    }
  ]
};
