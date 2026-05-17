import os
from http import HTTPStatus


def test_leader_can_create_employee_protected(client, leader_token):
    payload = {'name': 'New Manager', 'email': 'newmgr@test', 'phone': '+70001010101', 'password': 'password', 'role': 'manager'}
    headers = {'Authorization': f'Bearer {leader_token}', 'Content-Type': 'application/json'}
    res = client.post('/api/employees/protected', json=payload, headers=headers)
    assert res.status_code == HTTPStatus.OK
    data = res.json()
    assert data['email'] == 'newmgr@test'
    assert data['role'] == 'manager'


def test_employee_upload_photo(client, manager_token, db_session):
    # ensure a manager exists
    from app.models import Employee
    mgr = db_session.query(Employee).filter(Employee.email == 'mgr@test').first()
    if not mgr:
        mgr = Employee(name='M', email='mgr@test', phone='+70000000001', password='x', role='manager')
        db_session.add(mgr)
        db_session.commit()
        db_session.refresh(mgr)

    headers = {'Authorization': f'Bearer {manager_token}'}
    files = {'file': ('photo.jpg', b'GIF89aFakeImageData', 'image/jpeg')}
    res = client.post(f'/api/employees/{mgr.id}/photo', files=files, headers=headers)
    assert res.status_code == HTTPStatus.OK
    data = res.json()
    assert 'url' in data
    # file should exist under static/uploads
    path = data['url'].lstrip('/')
    assert os.path.exists(os.path.join(os.path.dirname(__file__), '..', path)) or os.path.exists(os.path.join(os.path.dirname(__file__), '..', '..', path))


def test_manager_change_password_requires_old(client, manager_token, db_session):
    from app.models import Employee
    from app.crud.security import safe_hash

    mgr = db_session.query(Employee).filter(Employee.email == 'mgrpwchange@test').first()
    if not mgr:
        mgr = Employee(name='PW Manager', email='mgrpwchange@test', phone='+70001112233', password=safe_hash('oldpw'), role='manager')
        db_session.add(mgr)
        db_session.commit()
        db_session.refresh(mgr)

    # create a token for this specific manager so we can test changing own password
    from app.routers.auth import create_access_token
    token = create_access_token({'sub': str(mgr.id), 'role': mgr.role})
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    # wrong old password -> should return 401 (current password incorrect)
    res = client.put(f'/api/employees/{mgr.id}', json={'password': 'newpw', 'old_password': 'badold'}, headers=headers)
    assert res.status_code == HTTPStatus.UNAUTHORIZED

    # correct old password -> accepted
    res2 = client.put(f'/api/employees/{mgr.id}', json={'password': 'newpw', 'old_password': 'oldpw'}, headers=headers)
    assert res2.status_code == HTTPStatus.OK


