import axios from '../axios';
import BaseService from './BaseService';

/**
 * Scheme Service
 */
class SchemeService extends BaseService {
    constructor() {
        super();
        // 🔥 FIX: Removed /api from baseURL
        this.baseURL = '/v1/schemes';
    }

    async searchSchemes(query, filters = {}) {
        const requestBody = {
            query: query || '',
            top_k: 20,
            scheme_types: filters.type ? [filters.type] : null,
            user_profile: null
        };
        const response = await axios.post(`${this.baseURL}/search`, requestBody);
        return response.data;
    }

    async getSchemeDetails(schemeId) {
        const requestBody = { scheme_name: schemeId, user_profile: null };
        const response = await axios.post(`${this.baseURL}/details`, requestBody);
        return response.data;
    }

    async getRecommendations(userProfile = null) {
        const profileData = userProfile ? {
            user_id: userProfile.id || 'anonymous',
            location: (userProfile.state || userProfile.district || userProfile.location_address) ? {
                state: userProfile.state || '',
                district: userProfile.district || '',
                address: userProfile.location_address || userProfile.location || '',
                latitude: userProfile.location_lat || null,
                longitude: userProfile.location_lng || null
            } : null,
            crops: userProfile.crops || null,
            land_size_hectares: userProfile.land_size || userProfile.landSize || null,
            farmer_category: userProfile.farmer_category || 'small',
            annual_income: userProfile.income || null,
            age: userProfile.age || null,
            gender: userProfile.gender || null,
            caste_category: userProfile.caste_category || null,
            has_bank_account: true,
            has_aadhaar: true,
            additional_attributes: null
        } : {
            user_id: 'anonymous', location: null, crops: null, land_size_hectares: null,
            farmer_category: 'small', annual_income: null, age: null, gender: null,
            caste_category: null, has_bank_account: true, has_aadhaar: true, additional_attributes: null
        };

        const requestBody = { user_profile: profileData, limit: 10 };
        const response = await axios.post(`${this.baseURL}/recommendations`, requestBody);
        return response.data;
    }

    async checkEligibility(schemeId, userProfile) {
        const profileData = {
            user_id: userProfile.id || 'anonymous',
            location: (userProfile.state || userProfile.district || userProfile.location_address) ? {
                state: userProfile.state || '',
                district: userProfile.district || '',
                address: userProfile.location_address || userProfile.location || '',
                latitude: userProfile.location_lat || null,
                longitude: userProfile.location_lng || null
            } : null,
            crops: userProfile.crops || null,
            land_size_hectares: userProfile.land_size || userProfile.landSize || null,
            farmer_category: userProfile.farmer_category || 'small',
            annual_income: userProfile.income || null,
            age: userProfile.age || null,
            gender: userProfile.gender || null,
            caste_category: userProfile.caste_category || null,
            has_bank_account: true,
            has_aadhaar: true,
            additional_attributes: null
        };

        const requestBody = { scheme_name: schemeId, user_profile: profileData };
        const response = await axios.post(`${this.baseURL}/eligibility/check`, requestBody);
        return response.data;
    }
}

export default new SchemeService();