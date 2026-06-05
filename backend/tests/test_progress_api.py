"""Backend tests for Romani Word Search progress API."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback: read from frontend/.env at repo root
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.strip().split("=", 1)[1]
                    break
BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def player(session):
    """Create a player once for the module and reuse the player_id."""
    r = session.post(f"{API}/progress/init", json={"name": "TEST_Tester"}, timeout=15)
    assert r.status_code == 200, f"init failed: {r.status_code} {r.text}"
    data = r.json()
    assert "player_id" in data and isinstance(data["player_id"], str) and len(data["player_id"]) > 0
    assert data["current_level"] == 1
    assert data["completed_levels"] == []
    assert data["discovered_phrases"] == []
    assert data.get("name") == "TEST_Tester"
    return data


# ---------- root ----------
class TestRoot:
    def test_root(self, session):
        r = session.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert "message" in body


# ---------- /progress/init ----------
class TestInit:
    def test_init_creates_player(self, player):
        # asserted in fixture
        assert player["player_id"]


# ---------- /progress/{player_id} ----------
class TestGetProgress:
    def test_get_existing(self, session, player):
        pid = player["player_id"]
        r = session.get(f"{API}/progress/{pid}", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["player_id"] == pid
        assert data["current_level"] == 1
        assert data["completed_levels"] == []

    def test_get_missing(self, session):
        r = session.get(f"{API}/progress/nonexistent-id-xyz", timeout=10)
        assert r.status_code == 404


# ---------- /progress/complete ----------
class TestComplete:
    def test_complete_level_1(self, session, player):
        pid = player["player_id"]
        payload = {
            "player_id": pid,
            "level": 1,
            "phrase": "Miro grast chal kotor maro",
            "translation": "Můj kůň ujídá kus chleba.",
            "theme": "Rodina",
            "time_seconds": 42,
        }
        r = session.post(f"{API}/progress/complete", json=payload, timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert 1 in data["completed_levels"]
        assert data["current_level"] == 2
        # phrase persisted
        phrases = data["discovered_phrases"]
        assert any(p["level"] == 1 and p["phrase"] == payload["phrase"] for p in phrases)

        # Verify persistence via GET
        g = session.get(f"{API}/progress/{pid}", timeout=10)
        assert g.status_code == 200
        gdata = g.json()
        assert 1 in gdata["completed_levels"]
        assert gdata["current_level"] == 2

    def test_complete_level_2_increments_current(self, session, player):
        pid = player["player_id"]
        r = session.post(
            f"{API}/progress/complete",
            json={"player_id": pid, "level": 2, "phrase": "Bari romni asal sar dilini",
                  "translation": "x", "theme": "Smích", "time_seconds": 30},
            timeout=10,
        )
        assert r.status_code == 200
        data = r.json()
        assert 2 in data["completed_levels"]
        assert data["current_level"] == 3

    def test_complete_idempotent(self, session, player):
        """Completing same level twice should not duplicate it."""
        pid = player["player_id"]
        r = session.post(
            f"{API}/progress/complete",
            json={"player_id": pid, "level": 1, "phrase": "Miro grast chal kotor maro",
                  "translation": "x", "theme": "Rodina", "time_seconds": 10},
            timeout=10,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["completed_levels"].count(1) == 1
        # only one entry per level in discovered_phrases (server deduplicates)
        level1_entries = [p for p in data["discovered_phrases"] if p["level"] == 1]
        assert len(level1_entries) == 1

    def test_complete_level_30_caps_current(self, session, player):
        pid = player["player_id"]
        r = session.post(
            f"{API}/progress/complete",
            json={"player_id": pid, "level": 30,
                  "phrase": "Vyhral si vyraindal meliari topánka",
                  "translation": "Vyhrál jsi!", "theme": "Velké finále"},
            timeout=10,
        )
        assert r.status_code == 200
        data = r.json()
        assert 30 in data["completed_levels"]
        assert data["current_level"] == 30  # min(31, 30)


# ---------- /progress/reset ----------
class TestReset:
    def test_reset(self, session, player):
        pid = player["player_id"]
        r = session.post(f"{API}/progress/reset/{pid}", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["completed_levels"] == []
        assert data["discovered_phrases"] == []
        assert data["current_level"] == 1

        # verify persisted
        g = session.get(f"{API}/progress/{pid}", timeout=10).json()
        assert g["completed_levels"] == []
        assert g["current_level"] == 1


# ---------- /leaderboard ----------
class TestLeaderboard:
    def test_leaderboard(self, session, player):
        r = session.get(f"{API}/leaderboard?limit=10", timeout=10)
        assert r.status_code == 200
        rows = r.json()
        assert isinstance(rows, list)
        if rows:
            row = rows[0]
            assert "name" in row and "completed" in row and "current_level" in row
