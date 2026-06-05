"""Phase 3 backend tests: coin economy, ad_reward tracking, reset semantics."""
import os
import pytest
import requests

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/') if 'REACT_APP_BACKEND_URL' in os.environ else None
# Read from frontend/.env if not in env
if not BASE_URL:
    from pathlib import Path
    env_path = Path('/app/frontend/.env')
    for line in env_path.read_text().splitlines():
        if line.startswith('REACT_APP_BACKEND_URL='):
            BASE_URL = line.split('=', 1)[1].strip().rstrip('/')
            break

API = f"{BASE_URL}/api"


@pytest.fixture
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def new_player(session):
    r = session.post(f"{API}/progress/init", json={"name": "TEST_Phase3Coins"})
    assert r.status_code == 200, r.text
    return r.json()


# ----- Init -----
class TestProgressInit:
    def test_init_creates_player_with_100_starting_coins(self, session):
        r = session.post(f"{API}/progress/init", json={"name": "TEST_InitCoins"})
        assert r.status_code == 200
        data = r.json()
        assert "player_id" in data
        assert data["coins"] == 100
        assert data["ads_watched"] == 0
        assert data["current_level"] == 1
        assert data["completed_levels"] == []
        # Verify persisted via GET
        pid = data["player_id"]
        g = session.get(f"{API}/progress/{pid}")
        assert g.status_code == 200
        assert g.json()["coins"] == 100


# ----- Coins update -----
class TestCoinsUpdate:
    def test_ad_reward_increments_coins_and_ads_watched(self, session, new_player):
        pid = new_player["player_id"]
        r = session.post(f"{API}/progress/{pid}/coins", json={"delta": 50, "reason": "ad_reward"})
        assert r.status_code == 200
        data = r.json()
        assert data["coins"] == 150
        assert data["ads_watched"] == 1
        # Second ad
        r2 = session.post(f"{API}/progress/{pid}/coins", json={"delta": 50, "reason": "ad_reward"})
        assert r2.status_code == 200
        assert r2.json()["coins"] == 200
        assert r2.json()["ads_watched"] == 2

    def test_word_reveal_decrements_coins_without_increasing_ads(self, session, new_player):
        pid = new_player["player_id"]
        r = session.post(f"{API}/progress/{pid}/coins", json={"delta": -100, "reason": "word_reveal"})
        assert r.status_code == 200
        data = r.json()
        assert data["coins"] == 0
        assert data["ads_watched"] == 0

    def test_insufficient_coins_returns_400(self, session, new_player):
        pid = new_player["player_id"]
        r = session.post(f"{API}/progress/{pid}/coins", json={"delta": -500, "reason": "word_reveal"})
        assert r.status_code == 400
        # Coins should remain 100 (unchanged)
        g = session.get(f"{API}/progress/{pid}")
        assert g.json()["coins"] == 100

    def test_unknown_player_returns_404(self, session):
        r = session.post(f"{API}/progress/does-not-exist-xyz/coins", json={"delta": 10, "reason": "ad_reward"})
        assert r.status_code == 404


# ----- Reset semantics -----
class TestResetSemantics:
    def test_reset_preserves_name_resets_coins_to_100(self, session):
        # Init with name and accumulate some state
        r = session.post(f"{API}/progress/init", json={"name": "TEST_ResetName"})
        pid = r.json()["player_id"]
        # Spend coins
        session.post(f"{API}/progress/{pid}/coins", json={"delta": -50, "reason": "word_reveal"})
        # Complete a level
        session.post(f"{API}/progress/complete", json={
            "player_id": pid, "level": 1, "phrase": "DAJ", "translation": "mother", "theme": "Daj", "time_seconds": 30
        })
        # Reset
        rr = session.post(f"{API}/progress/reset/{pid}")
        assert rr.status_code == 200
        data = rr.json()
        assert data["name"] == "TEST_ResetName"
        assert data["coins"] == 100  # rebuilt to default 100
        assert data["ads_watched"] == 0
        assert data["completed_levels"] == []
        assert data["current_level"] == 1
        # Verify persisted
        g = session.get(f"{API}/progress/{pid}")
        assert g.json()["coins"] == 100
        assert g.json()["name"] == "TEST_ResetName"
