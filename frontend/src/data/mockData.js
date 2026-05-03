import { createRelativeDate, addDays } from '../utils/date';

const baseDate = new Date();

const managers = [
  {
    id: 'm-1',
    name: 'Елена Кузьмина',
    email: 'kuzmina@tourfirm.test',
    phone: '+7 (900) 111-22-33',
    status: 'active',
  },
  {
    id: 'm-2',
    name: 'Денис Морозов',
    email: 'morozov@tourfirm.test',
    phone: '+7 (900) 444-55-66',
    status: 'active',
  },
];

const clients = [
  {
    id: 'c-1',
    name: 'Ирина Волкова',
    city: 'Москва',
    phone: '+7 (901) 100-10-10',
    email: 'volkovaa@example.com',
    discountPercent: 10,
    historyTourIds: ['t-1', 't-2', 't-3'],
  },
  {
    id: 'c-2',
    name: 'Олег Смирнов',
    city: 'Казань',
    phone: '+7 (901) 200-20-20',
    email: 'smirnov@example.com',
    discountPercent: 5,
    historyTourIds: ['t-2'],
  },
  {
    id: 'c-3',
    name: 'Анна Фёдорова',
    city: 'Санкт-Петербург',
    phone: '+7 (901) 300-30-30',
    email: 'fedorova@example.com',
    discountPercent: 0,
    historyTourIds: ['t-3'],
  },
  {
    id: 'c-4',
    name: 'Мария Кузнецова',
    city: 'Москва',
    phone: '+7 (901) 400-40-40',
    email: 'kuznetsova@example.com',
    discountPercent: 15,
    historyTourIds: ['t-1', 't-4'],
  },
  {
    id: 'c-5',
    name: 'Павел Иванов',
    city: 'Нижний Новгород',
    phone: '+7 (901) 500-50-50',
    email: 'ivanov@example.com',
    discountPercent: 10,
    historyTourIds: ['t-2', 't-5'],
  },
];

const tours = [
  {
    id: 't-1',
    city: 'Сочи',
    title: 'Море и горы Сочи',
    price: 89000,
    startDate: createRelativeDate(2, baseDate),
    endDate: createRelativeDate(9, baseDate),
    description: 'Классическая путёвка с морским отдыхом, прогулками и насыщенной экскурсионной программой.',
    excursions: ['Океанариум', 'Красная Поляна', 'Приморская набережная'],
    services: ['Завтраки включены', 'Трансфер из аэропорта'],
    seats: 14,
    assignedClientIds: ['c-1', 'c-4'],
  },
  {
    id: 't-2',
    city: 'Казань',
    title: 'Выходные в Казани',
    price: 54000,
    startDate: createRelativeDate(4, baseDate),
    endDate: createRelativeDate(9, baseDate),
    description: 'Городской тур с проживанием в центре, обзорной экскурсией и национальной кухней.',
    excursions: ['Кремль', 'Дворец земледельцев', 'Казанский Арбат'],
    services: ['Завтраки частично включены', 'Вечерний ужин'],
    seats: 20,
    assignedClientIds: ['c-2'],
  },
  {
    id: 't-3',
    city: 'Санкт-Петербург',
    title: 'Культурный Петербург',
    price: 68000,
    startDate: createRelativeDate(7, baseDate),
    endDate: createRelativeDate(13, baseDate),
    description: 'Музеи, каналы, дворцы и свободный день для самостоятельных прогулок.',
    excursions: ['Эрмитаж', 'Петергоф', 'Невский проспект'],
    services: ['Питание по желанию', 'Билеты в музеи включены'],
    seats: 18,
    assignedClientIds: ['c-3'],
  },
  {
    id: 't-4',
    city: 'Байкал',
    title: 'Зимняя сказка Байкала',
    price: 96000,
    startDate: createRelativeDate(12, baseDate),
    endDate: createRelativeDate(19, baseDate),
    description: 'Премиальный маршрут на озеро Байкал с поездками по льду и этнической программой.',
    excursions: ['Остров Ольхон', 'Ледовые гроты', 'Этнопарк'],
    services: ['Полный пансион', 'Снаряжение для прогулок'],
    seats: 10,
    assignedClientIds: ['c-4'],
  },
  {
    id: 't-5',
    city: 'Алтай',
    title: 'Активный Алтай',
    price: 74000,
    startDate: createRelativeDate(18, baseDate),
    endDate: createRelativeDate(25, baseDate),
    description: 'Программа для любителей природы, треккинга и оздоровительного отдыха.',
    excursions: ['Чуйский тракт', 'Долина горных рек', 'Смотровые площадки'],
    services: ['Ужин включён', 'Эко-трансфер'],
    seats: 16,
    assignedClientIds: ['c-5'],
  },
];

const sales = [
  {
    id: 's-1',
    date: createRelativeDate(-4, baseDate),
    tourId: 't-1',
    clientId: 'c-1',
    quantity: 2,
  },
  {
    id: 's-2',
    date: createRelativeDate(-2, baseDate),
    tourId: 't-2',
    clientId: 'c-2',
    quantity: 3,
  },
  {
    id: 's-3',
    date: createRelativeDate(-6, baseDate),
    tourId: 't-3',
    clientId: 'c-3',
    quantity: 1,
  },
  {
    id: 's-4',
    date: createRelativeDate(-1, baseDate),
    tourId: 't-1',
    clientId: 'c-4',
    quantity: 1,
  },
  {
    id: 's-5',
    date: createRelativeDate(-3, baseDate),
    tourId: 't-5',
    clientId: 'c-5',
    quantity: 2,
  },
];

export const demoUser = {
  id: 'leader-demo',
  name: 'Марина Соколова',
  role: 'leader',
  position: 'Руководитель',
  email: 'leader@tourfirm.test',
};

export const managerTemplate = {
  id: 'm-new',
  name: '',
  email: '',
  phone: '',
  status: 'active',
};

export const clientTemplate = {
  name: '',
  city: '',
  phone: '',
  email: '',
  discountPercent: 0,
};

export const tourTemplate = {
  city: '',
  title: '',
  price: 0,
  startDate: createRelativeDate(0, baseDate),
  endDate: createRelativeDate(5, baseDate),
  description: '',
  excursions: '',
  services: '',
  seats: 10,
};

export const initialMockData = {
  managers,
  clients,
  tours,
  sales,
};

export const seedDate = addDays(baseDate, 0);

