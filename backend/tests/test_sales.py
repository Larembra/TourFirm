from http import HTTPStatus


def test_create_sale(client, db_session, manager_token):
    from app.models import Tour, Client

    # create tour and client
    t = Tour(city='SaleCity', title='SaleTour', price=100, start_date='2026-01-01', end_date='2026-01-02', description='d', seats=1)
    c = Client(name='Buyer', city='CityB', phone='+70009990000', email='buyer@test')
    db_session.add_all([t, c])
    db_session.commit()
    db_session.refresh(t)
    db_session.refresh(c)

    payload = {'tour_id': t.id, 'client_id': c.id, 'quantity': 1}
    res = client.post('/api/sales', json=payload, headers={'Authorization': f'Bearer {manager_token}'})
    assert res.status_code == HTTPStatus.OK
    data = res.json()
    assert data['tour_id'] == t.id
    assert data['client_id'] == c.id
    assert data.get('employee_id') is not None
