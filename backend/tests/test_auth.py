from http import HTTPStatus


def test_login_with_existing_user(client, db_session):
    # create a user with known password
    from app.models import Employee
    from app.crud.security import safe_hash

    user = Employee(name='Auth Tester', email='auth@test', phone='+70009998877', password=safe_hash('secretpw'), role='manager')
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    res = client.post('/api/auth/login', json={'email': 'auth@test', 'password': 'secretpw'})
    assert res.status_code == HTTPStatus.OK
    data = res.json()
    assert 'access_token' in data
    assert data['user']['email'] == 'auth@test'


def test_login_invalid_credentials(client):
    res = client.post('/api/auth/login', json={'email': 'noexist', 'password': 'x'})
    assert res.status_code == HTTPStatus.UNAUTHORIZED

