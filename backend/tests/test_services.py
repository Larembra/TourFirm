from http import HTTPStatus


def test_leader_create_service(client, leader_token):
    payload = {'name': 'VIP Lunch', 'cost': 999}
    headers = {'Authorization': f'Bearer {leader_token}', 'Content-Type': 'application/json'}
    res = client.post('/api/services', json=payload, headers=headers)
    assert res.status_code == HTTPStatus.OK
    data = res.json()
    assert data['name'] == 'VIP Lunch'


def test_manager_cannot_create_service(client, manager_token):
    payload = {'name': 'Nope', 'cost': 1}
    headers = {'Authorization': f'Bearer {manager_token}', 'Content-Type': 'application/json'}
    res = client.post('/api/services', json=payload, headers=headers)
    assert res.status_code == HTTPStatus.FORBIDDEN


def test_add_and_remove_service_to_tour(client, leader_token, db_session):
    from app.models import Service, Tour

    # create service
    svc = Service(name='TempSvc', cost=10)
    db_session.add(svc)
    db_session.commit()
    db_session.refresh(svc)

    # create tour
    t = Tour(city='CityX', title='TX', price=10, start_date='2026-01-01', end_date='2026-01-02', description='d', seats=1)
    db_session.add(t)
    db_session.commit()
    db_session.refresh(t)

    headers = {'Authorization': f'Bearer {leader_token}'}
    res = client.post(f'/api/tours/{t.id}/services/{svc.id}', headers=headers)
    assert res.status_code == HTTPStatus.OK
    data = res.json()
    assert any(s['name'] == 'TempSvc' for s in data.get('services', []))

    # remove
    res2 = client.delete(f'/api/tours/{t.id}/services/{svc.id}', headers=headers)
    assert res2.status_code == HTTPStatus.OK
    data2 = res2.json()
    assert all(s['name'] != 'TempSvc' for s in data2.get('services', []))

