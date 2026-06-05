"""Phase 2 backend tests: name update, best_times tracking, leaderboard, reset preserves name."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
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


@pytest.fixture
def fresh_player(session):
    r = session.post(f"{API}/progress/init", json={"name": "TEST_Phase2"}, timeout=15)
    assert r.status_code == 200
    return r.json()


# ---------- Name update ----------
class TestNameUpdate:
    def test_update_name_success(self, session, fresh_player):
        pid = fresh_player["player_id"]
        r = session.post(f"{API}/progress/{pid}/name", json={"name": "TEST_UpdatedName"}, timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["name"] == "TEST_UpdatedName"
        # verify persistence
        g = session.get(f"{API}/progress/{pid}", timeout=10).json()
        assert g["name"] == "TEST_UpdatedName"

    def test_update_name_empty_clears(self, session, fresh_player):
        pid = fresh_player["player_id"]
        r = session.post(f"{API}/progress/{pid}/name", json={"name": "   "}, timeout=10)
        assert r.status_code == 200
        assert r.json()["name"] is None

    def test_update_name_404_when_missing(self, session):
        r = session.post(f"{API}/progress/nonexistent-xyz-id/name", json={"name": "x"}, timeout=10)
        assert r.status_code == 404


# ---------- best_times tracking ----------
class TestBestTimes:
    def test_best_time_initial(self, session, fresh_player):
        pid = fresh_player["player_id"]
        r = session.post(f"{API}/progress/complete", json={
            "player_id": pid, "level": 1, "phrase": "p1",
            "translation": "t1", "theme": "th", "time_seconds": 60
        }, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["best_times"].get("1") == 60

    def test_best_time_keeps_lowest(self, session, fresh_player):
        pid = fresh_player["player_id"]
        session.post(f"{API}/progress/complete", json={
            "player_id": pid, "level": 1, "phrase": "p", "translation": "t", "theme": "th", "time_seconds": 90
        }, timeout=10)
        # submit better time
        session.post(f"{API}/progress/complete", json={
            "player_id": pid, "level": 1, "phrase": "p", "translation": "t", "theme": "th", "time_seconds": 45
        }, timeout=10)
        # submit worse time -> should not overwrite
        r = session.post(f"{API}/progress/complete", json={
            "player_id": pid, "level": 1, "phrase": "p", "translation": "t", "theme": "th", "time_seconds": 120
        }, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["best_times"].get("1") == 45

        # verify GET persistence
        g = session.get(f"{API}/progress/{pid}", timeout=10).json()
        assert g["best_times"].get("1") == 45

    def test_best_time_zero_or_none_ignored(self, session, fresh_player):
        pid = fresh_player["player_id"]
        r = session.post(f"{API}/progress/complete", json={
            "player_id": pid, "level": 2, "phrase": "p", "translation": "t", "theme": "th", "time_seconds": 0
        }, timeout=10)
        assert r.status_code == 200
        assert r.json()["best_times"].get("2") is None


# ---------- Leaderboard ----------
class TestLeaderboard:
    def test_leaderboard_includes_total_best_time(self, session, fresh_player):
        pid = fresh_player["player_id"]
        session.post(f"{API}/progress/complete", json={
            "player_id": pid, "level": 1, "phrase": "p", "translation": "t", "theme": "th", "time_seconds": 30
        }, timeout=10)
        session.post(f"{API}/progress/complete", json={
            "player_id": pid, "level": 2, "phrase": "p", "translation": "t", "theme": "th", "time_seconds": 45
        }, timeout=10)
        r = session.get(f"{API}/leaderboard?limit=50", timeout=10)
        assert r.status_code == 200
        rows = r.json()
        assert isinstance(rows, list)
        assert len(rows) > 0
        # all rows must have total_best_time
        for row in rows:
            assert "total_best_time" in row
            assert "name" in row
            assert "completed" in row

        # find this player's row
        me = next((r for r in rows if r["name"] == "TEST_Phase2"), None)
        assert me is not None
        assert me["completed"] >= 2
        assert me["total_best_time"] >= 75  # 30 + 45

    def test_leaderboard_limit(self, session):
        r = session.get(f"{API}/leaderboard?limit=1", timeout=10)
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) <= 1

    def test_leaderboard_sorted_by_completed_desc(self, session):
        # create two players differing in completion count
        a = session.post(f"{API}/progress/init", json={"name": "TEST_SortA"}, timeout=10).json()
        b = session.post(f"{API}/progress/init", json={"name": "TEST_SortB"}, timeout=10).json()
        # A completes 3 levels
        for lvl in (1, 2, 3):
            session.post(f"{API}/progress/complete", json={
                "player_id": a["player_id"], "level": lvl, "phrase": "p", "translation": "t",
                "theme": "th", "time_seconds": 10
            }, timeout=10)
        # B completes 1 level
        session.post(f"{API}/progress/complete", json={
            "player_id": b["player_id"], "level": 1, "phrase": "p", "translation": "t",
            "theme": "th", "time_seconds": 5
        }, timeout=10)

        rows = session.get(f"{API}/leaderboard?limit=100", timeout=10).json()
        idx_a = next((i for i, r in enumerate(rows) if r["name"] == "TEST_SortA"), -1)
        idx_b = next((i for i, r in enumerate(rows) if r["name"] == "TEST_SortB"), -1)
        assert idx_a != -1 and idx_b != -1
        assert idx_a < idx_b, f"A (3 done) should be ranked higher than B (1 done). rows={rows}"

    def test_leaderboard_tiebreak_by_total_time_asc(self, session):
        # Two players with same completed count - lower total time wins
        a = session.post(f"{API}/progress/init", json={"name": "TEST_TieFast"}, timeout=10).json()
        b = session.post(f"{API}/progress/init", json={"name": "TEST_TieSlow"}, timeout=10).json()
        for lvl in (1, 2):
            session.post(f"{API}/progress/complete", json={
                "player_id": a["player_id"], "level": lvl, "phrase": "p", "translation": "t",
                "theme": "th", "time_seconds": 5
            }, timeout=10)
            session.post(f"{API}/progress/complete", json={
                "player_id": b["player_id"], "level": lvl, "phrase": "p", "translation": "t",
                "theme": "th", "time_seconds": 200
            }, timeout=10)
        rows = session.get(f"{API}/leaderboard?limit=100", timeout=10).json()
        # filter only these two by name
        names = [r["name"] for r in rows]
        idx_fast = names.index("TEST_TieFast")
        idx_slow = names.index("TEST_TieSlow")
        # Both have 2 completed -> faster should appear first
        assert idx_fast < idx_slow


# ---------- Reset preserves name ----------
class TestResetPreservesName:
    def test_reset_keeps_name_clears_progress(self, session, fresh_player):
        pid = fresh_player["player_id"]
        # set a name
        session.post(f"{API}/progress/{pid}/name", json={"name": "TEST_KeepMe"}, timeout=10)
        # complete some levels with best times
        session.post(f"{API}/progress/complete", json={
            "player_id": pid, "level": 1, "phrase": "p", "translation": "t", "theme": "th", "time_seconds": 30
        }, timeout=10)
        session.post(f"{API}/progress/complete", json={
            "player_id": pid, "level": 2, "phrase": "p2", "translation": "t", "theme": "th", "time_seconds": 40
        }, timeout=10)
        # reset
        r = session.post(f"{API}/progress/reset/{pid}", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "TEST_KeepMe", "Reset must preserve name"
        assert data["completed_levels"] == []
        assert data["best_times"] == {}
        assert data["discovered_phrases"] == []
        assert data["current_level"] == 1

        # verify persistence
        g = session.get(f"{API}/progress/{pid}", timeout=10).json()
        assert g["name"] == "TEST_KeepMe"
        assert g["completed_levels"] == []
        assert g["best_times"] == {}
