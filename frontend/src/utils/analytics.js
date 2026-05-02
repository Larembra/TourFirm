import { formatCurrency, isWithinNextDays } from './date';

export const getTourClientNames = (tour, clients) =>
  tour.assignedClientIds
    .map((clientId) => clients.find((client) => client.id === clientId))
    .filter(Boolean)
    .map((client) => client.name);

export const getMostExpensiveTour = (tours) =>
  [...tours].sort((left, right) => right.price - left.price)[0] ?? null;

export const getHotTours = (tours, baseDate = new Date()) =>
  tours.filter((tour) => isWithinNextDays(tour.startDate, 5, baseDate));

export const getPopularTours = (tours, sales) => {
  const ranked = tours.map((tour) => ({
    ...tour,
    soldQuantity: sales
      .filter((sale) => sale.tourId === tour.id)
      .reduce((sum, sale) => sum + sale.quantity, 0),
  }));

  return [...ranked].sort((left, right) => right.soldQuantity - left.soldQuantity);
};

export const getDiscountLoss = (sales, tours, clients) =>
  sales.reduce((sum, sale) => {
    const tour = tours.find((item) => item.id === sale.tourId);
    const client = clients.find((item) => item.id === sale.clientId);

    if (!tour || !client || !client.discountPercent) {
      return sum;
    }

    return sum + (tour.price * sale.quantity * client.discountPercent) / 100;
  }, 0);

export const getRevenue = (sales, tours, clients) =>
  sales.reduce((sum, sale) => {
    const tour = tours.find((item) => item.id === sale.tourId);
    const client = clients.find((item) => item.id === sale.clientId);

    if (!tour) {
      return sum;
    }

    const discount = client?.discountPercent ?? 0;
    return sum + tour.price * sale.quantity * (1 - discount / 100);
  }, 0);

export const getSalesSummary = (sales, tours, clients) => ({
  totalOrders: sales.length,
  totalQuantity: sales.reduce((sum, sale) => sum + sale.quantity, 0),
  discountLoss: getDiscountLoss(sales, tours, clients),
  revenue: getRevenue(sales, tours, clients),
});

export const formatTourVisitors = (tour, clients) => {
  const names = getTourClientNames(tour, clients);
  return names.length > 0 ? names.join(', ') : 'Пока нет записей';
};

export const getTourByStartDate = (tours, dateValue) =>
  tours.filter((tour) => tour.startDate === dateValue);

export const getToursByCity = (tours, city) =>
  tours.filter((tour) => tour.city.toLowerCase().includes(city.toLowerCase()));

export const getTourCardSubtitle = (tour) => `${tour.city} · ${formatCurrency(tour.price)}`;

