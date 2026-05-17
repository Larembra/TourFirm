from sqlalchemy import Column, ForeignKey, Integer, Table
from ..core.database import Base


tour_services = Table(
    'tour_services',
    Base.metadata,
    Column('tour_id', Integer, ForeignKey('tours.id')),
    Column('service_id', Integer, ForeignKey('services.id')),
)


sale_services = Table(
    'sale_services',
    Base.metadata,
    Column('sale_id', Integer, ForeignKey('sales.id')),
    Column('service_id', Integer, ForeignKey('services.id')),
)

