from http import HTTPStatus


def test_leader_can_create_tour(client, leader_token):
    payload = {
        'city': 'TestCity',
        'title': 'Test Tour',
        'price': 1000,
        'start_date': '2026-09-01',
        'end_date': '2026-09-05',
        'description': 'Test description',
        'seats': 5,
    }
    headers = {'Authorization': f'Bearer {leader_token}', 'Content-Type': 'application/json'}
    res = client.post('/api/tours', json=payload, headers=headers)
    assert res.status_code == HTTPStatus.OK
    data = res.json()
    assert data['city'] == 'TestCity'
    assert data['title'] == 'Test Tour'


def test_manager_cannot_create_tour(client, manager_token):
    payload = {
        'city': 'X',
        'title': 'Nope',
        'price': 10,
    }
    headers = {'Authorization': f'Bearer {manager_token}', 'Content-Type': 'application/json'}
    res = client.post('/api/tours', json=payload, headers=headers)
    assert res.status_code == HTTPStatus.FORBIDDEN


def test_leader_can_update_tour(client, leader_token, db_session):
    # create tour directly in DB
    from app.models import Tour

    t = Tour(city='Init', title='Init', price=100, start_date='2026-01-01', end_date='2026-01-02', description='d', seats=1)
    db_session.add(t)
    db_session.commit()
    db_session.refresh(t)

    payload = {'city': 'Changed', 'title': 'Changed Title', 'price': 200, 'start_date': '2026-02-01', 'end_date': '2026-02-02', 'description': 'new', 'seats': 2}
    headers = {'Authorization': f'Bearer {leader_token}', 'Content-Type': 'application/json'}
    res = client.put(f'/api/tours/{t.id}', json=payload, headers=headers)
    assert res.status_code == HTTPStatus.OK
    data = res.json()
    assert data['city'] == 'Changed'


def test_manager_cannot_update_tour(client, manager_token, db_session):
    from app.models import Tour
    t = Tour(city='A', title='A', price=1, start_date='2026-01-01', end_date='2026-01-02', description='d', seats=1)
    db_session.add(t)
    db_session.commit()
    db_session.refresh(t)
    payload = {'city': 'B', 'title': 'B', 'price': 2, 'start_date': None, 'end_date': None, 'description': 'd', 'seats': 1}
    headers = {'Authorization': f'Bearer {manager_token}', 'Content-Type': 'application/json'}
    res = client.put(f'/api/tours/{t.id}', json=payload, headers=headers)
    assert res.status_code == HTTPStatus.FORBIDDEN

