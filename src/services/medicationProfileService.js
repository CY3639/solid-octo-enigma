import { api } from './api';

export const medicationProfileService = {
  getByPatient: async (patientId) => {
    const { data } = await api.get(`/patients/${patientId}/medicationProfiles`);
    return data;
  },

  create: async (patientId, profileData) => {
    const { data } = await api.post(`/patients/${patientId}/medicationProfiles`, profileData);
    return data;
  },

  update: async (patientId, profileId, profileData) => {
    const { data } = await api.put(
      `/patients/${patientId}/medicationProfiles/${profileId}`,
      profileData
    );
    return data;
  },

  cease: async (patientId, profileId) => {
    const { data } = await api.put(
      `/patients/${patientId}/medicationProfiles/${profileId}`,
      { ceased: true }
    );
    return data;
  },

  delete: async (patientId, profileId) => {
    await api.delete(`/patients/${patientId}/medicationProfiles/${profileId}`);
  },
};