import { api } from './api';

export const medicationProfileService = {
  getByPatient: async (patientId) => {
    const { data } = await api.get(`/patients/${patientId}/medication-profiles`);
    return data;
  },

  create: async (patientId, profileData) => {
    const { data } = await api.post(`/patients/${patientId}/medication-profiles`, profileData);
    return data;
  },

  update: async (patientId, profileId, profileData) => {
    const { data } = await api.put(
      `/patients/${patientId}/medication-profiles/${profileId}`,
      profileData
    );
    return data;
  },

  cease: async (patientId, profileId) => {
    const { data } = await api.put(
      `/patients/${patientId}/medication-profiles/${profileId}`,
      { ceased: true }
    );
    return data;
  },

  delete: async (patientId, profileId) => {
    await api.delete(`/patients/${patientId}/medication-profiles/${profileId}`);
  },
};