from app.services import storage_service


def test_is_global_key():
    assert storage_service.is_global_key("lecture_42")
    assert storage_service.is_global_key("quiz_1")
    assert not storage_service.is_global_key("profile_bio")


def test_set_and_get_personal_key_scoped_to_requester(fake_db):
    storage_service.set_value("profile_bio", "hello", "user-1")
    assert storage_service.get_value("profile_bio", "user-1") == "hello"
    assert storage_service.get_value("profile_bio", "user-2") is None


def test_global_key_shared_across_requesters(fake_db):
    storage_service.set_value("lecture_1", "content", "user-1")
    assert storage_service.get_value("lecture_1", "user-2") == "content"


def test_remove_value(fake_db):
    storage_service.set_value("profile_bio", "hello", "user-1")
    storage_service.remove_value("profile_bio", "user-1")
    assert storage_service.get_value("profile_bio", "user-1") is None
