import { api } from './api';

function parseLinkHeader(header) {
  if (!header) return {};
  const links = {};
  header.split(',').forEach((part) => {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) links[match[2]] = match[1];
  });
  return links;
}

export const medicationService = {
  getAll: async (page = 1, search = '') => {
    let endpoint = `/medications?page=${page}`;
    if (search) {
      endpoint = `/medications/search?medicationName=${encodeURIComponent(search)}`;
    } else {
      endpoint = `/medications?page=${page}`;
    }
    const { data, linkHeader } = await api.get(endpoint);
    return { medications: data, links: parseLinkHeader(linkHeader) };
  },

  getById: async (id) => {
    const { data } = await api.get(`/medications/${id}`);
    return data;
  },

  create: async (medicationData) => {
    const { data } = await api.post('/medications', medicationData);
    return data;
  },

  update: async (id, medicationData) => {
    const { data } = await api.put(`/medications/${id}`, medicationData);
    return data;
  },

  delete: async (id) => {
    await api.delete(`/medications/${id}`);
  },
};