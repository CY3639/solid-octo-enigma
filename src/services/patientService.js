import { api } from './api';

// parses the linkheader into an object of ( rel: url ) pairs.
// The assignment 2 API sends pagination links in this format:
// <http://...?page=2>; rel="next", <http://...?page=5>; rel="last"

function parseLinkHeader(header) {
  if (!header) return {};
  const links = {};
  header.split(',').forEach((part) => {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) links[match[2]] = match[1];
  });
  return links;
}

export const patientService = {
  getAll: async (page = 1, search = '') => {
    let endpoint = `/patients?page=${page}`;
    if (search) endpoint += `&search=${encodeURIComponent(search)}`;
    const { data, linkHeader } = await api.get(endpoint);
    return { patients: data, links: parseLinkHeader(linkHeader) };
  },

  getById: async (id) => {
    const { data } = await api.get(`/patients/${id}`);
    return data;
  },

  create: async (patientData) => {
    const { data } = await api.post('/patients', patientData);
    return data;
  },

  update: async (id, patientData) => {
    const { data } = await api.put(`/patients/${id}`, patientData);
    return data;
  },

  delete: async (id) => {
    await api.delete(`/patients/${id}`);
  },
};