import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FaUser, FaMapMarkerAlt, FaSeedling, FaRulerCombined, FaLanguage, FaEdit, FaSave, FaTimes, FaCheckCircle } from 'react-icons/fa';
import userService from '../../api/services/userService';
import { updateProfile as updateProfileAction } from '../../store/slices/userSlice';
import { updateUser } from '../../store/slices/authSlice';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';
import { indianStates, getDistrictsByState } from '../../data/indianStatesDistricts';

/**
 * Profile Page Component
 * 
 * Provides interface for users to view and edit their profile:
 * - Display current user information
 * - Edit mode with form validation
 * - Update profile via API
 * - Show profile completion status
 * 
 * Requirements: 2.1-2.8
 */
export default function Profile() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { profile, loading: userLoading, refreshUser } = useCurrentUser();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cropInput, setCropInput] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [availableDistricts, setAvailableDistricts] = useState([]);

    // Available languages
    const languages = [
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'Hindi' },
        { value: 'bn', label: 'Bengali' },
        { value: 'te', label: 'Telugu' },
        { value: 'mr', label: 'Marathi' },
        { value: 'ta', label: 'Tamil' },
        { value: 'gu', label: 'Gujarati' },
        { value: 'kn', label: 'Kannada' },
        { value: 'ml', label: 'Malayalam' },
        { value: 'pa', label: 'Punjabi' }
    ];

    // Common crops for suggestions
    const commonCrops = [
        'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane',
        'Soybean', 'Groundnut', 'Pulses', 'Vegetables', 'Fruits'
    ];

    // React Hook Form setup
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm({
        mode: 'onBlur',
        defaultValues: {
            name: '',
            location: '',
            location_lat: null,
            location_lng: null,
            location_address: '',
            district: '',
            state: '',
            crops: [],
            land_size: '',
            language: 'en'
        }
    });

    // Watch crops field
    const crops = watch('crops');
    const watchedState = watch('state');

    // Update available districts when state changes
    useEffect(() => {
        if (watchedState) {
            setSelectedState(watchedState);
            setAvailableDistricts(getDistrictsByState(watchedState));
        } else {
            setAvailableDistricts([]);
        }
    }, [watchedState]);

    // Load profile data into form when profile is available
    useEffect(() => {
        if (profile) {
            reset({
                name: profile.name || '',
                location: profile.location || profile.location_address || '',
                location_lat: profile.location_lat || null,
                location_lng: profile.location_lng || null,
                location_address: profile.location_address || '',
                district: profile.district || '',
                state: profile.state || '',
                crops: profile.crops || [],
                land_size: profile.land_size || '',
                language: profile.language || profile.preferred_language || 'en'
            });

            // Set initial state and districts
            if (profile.state) {
                setSelectedState(profile.state);
                setAvailableDistricts(getDistrictsByState(profile.state));
            }
        }
    }, [profile, reset]);

    // Calculate profile completion
    const profileCompletion = profile ? userService.getProfileCompletionPercentage(profile) : 0;
    const isProfileComplete = profile ? userService.isProfileComplete(profile) : false;
    const missingFields = profile ? userService.getMissingProfileFields(profile) : [];

    /**
     * Handle form submission
     * Requirement 2.1-2.8: Update profile via API
     */
    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            // Validate profile data
            const validation = userService.validateProfileData(data);
            if (!validation.isValid) {
                const errorMessages = Object.values(validation.errors).join(', ');
                setError(errorMessages);
                return;
            }

            // Prepare profile data with coordinates
            const profileData = {
                name: data.name,
                location: data.location,
                crops: data.crops,
                land_size: parseFloat(data.land_size),
                language: data.language
            };

            // Add coordinates and location details if available
            if (data.location_lat && data.location_lng) {
                profileData.location_lat = data.location_lat;
                profileData.location_lng = data.location_lng;
                profileData.location_address = data.location;
            }

            // Add district and state if available
            if (data.district) {
                profileData.district = data.district;
            }
            if (data.state) {
                profileData.state = data.state;
            }

            console.log('=== PROFILE SAVE DEBUG ===');
            console.log('Sending to API:', profileData);

            // Call API to update profile
            const response = await userService.updateProfile(profileData);

            console.log('Response from API:', response);
            console.log('=== END DEBUG ===');

            // Update Redux store with new user data
            const updatedUser = response.user || response;
            dispatch(updateProfileAction(updatedUser));
            dispatch(updateUser(updatedUser));

            // Refresh user data
            await refreshUser();

            // Show success message
            setSuccess(true);
            setIsEditing(false);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.message || t('profilePage.failedUpdateProfile'));
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle location selection from autocomplete
     */
    const handleLocationSelect = (locationData) => {
        if (locationData) {
            setValue('location', locationData.address, { shouldDirty: true });
            setValue('location_lat', locationData.latitude, { shouldDirty: true });
            setValue('location_lng', locationData.longitude, { shouldDirty: true });

            // Also set district and state if available
            if (locationData.district) {
                setValue('district', locationData.district, { shouldDirty: true });
            }
            if (locationData.state) {
                setValue('state', locationData.state, { shouldDirty: true });
            }
        } else {
            setValue('location', '', { shouldDirty: true });
            setValue('location_lat', null, { shouldDirty: true });
            setValue('location_lng', null, { shouldDirty: true });
            setValue('district', '', { shouldDirty: true });
            setValue('state', '', { shouldDirty: true });
        }
    };

    /**
     * Cancel editing and reset form
     */
    const handleCancelEdit = () => {
        if (profile) {
            reset({
                name: profile.name || '',
                location: profile.location || profile.location_address || '',
                location_lat: profile.location_lat || null,
                location_lng: profile.location_lng || null,
                location_address: profile.location_address || '',
                district: profile.district || '',
                state: profile.state || '',
                crops: profile.crops || [],
                land_size: profile.land_size || '',
                language: profile.language || profile.preferred_language || 'en'
            });
        }
        setIsEditing(false);
        setError(null);
    };

    /**
     * Add crop to the list
     */
    const addCrop = (cropName) => {
        const trimmedCrop = cropName.trim();
        if (trimmedCrop && !crops.includes(trimmedCrop)) {
            setValue('crops', [...crops, trimmedCrop], { shouldDirty: true });
            setCropInput('');
        }
    };

    /**
     * Remove crop from the list
     */
    const removeCrop = (cropToRemove) => {
        setValue('crops', crops.filter(crop => crop !== cropToRemove), { shouldDirty: true });
    };

    /**
     * Handle crop input key press
     */
    const handleCropKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCrop(cropInput);
        }
    };

    // Show loader while fetching user data
    if (userLoading && !profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader size={50} />
            </div>
        );
    }

    // Show message if no profile data
    if (!profile) {
        return (
            <div className="p-8">
                <Card>
                    <div className="text-center py-8">
                        <p className="text-gray-600">{t('profilePage.noProfileData')}</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('profilePage.myProfile')}</h1>
                <p className="mt-2 text-sm text-gray-600">
                    {t('profilePage.manageInfo')}
                </p>
            </div>

            {/* Success Alert */}
            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center" role="alert">
                    <FaCheckCircle className="mr-2" />
                    <span>{t('profilePage.profileUpdatedSuccess')}</span>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Profile Completion Status */}
            <Card className="mb-6">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">{t('profilePage.profileCompletion')}</h2>
                        <span className={`text-2xl font-bold ${isProfileComplete ? 'text-green-600' : 'text-orange-600'}`}>
                            {profileCompletion}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div
                            className={`h-3 rounded-full transition-all duration-300 ${isProfileComplete ? 'bg-green-600' : 'bg-orange-500'}`}
                            style={{ width: `${profileCompletion}%` }}
                        ></div>
                    </div>

                    {/* Missing Fields */}
                    {!isProfileComplete && missingFields.length > 0 && (
                        <div className="text-sm text-gray-600">
                            <p className="font-medium mb-2">{t('profilePage.missingInfo')}</p>
                            <ul className="list-disc list-inside space-y-1">
                                {missingFields.map((field) => (
                                    <li key={field} className="capitalize">
                                        {field.replace('_', ' ')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {isProfileComplete && (
                        <p className="text-sm text-green-600 flex items-center">
                            <FaCheckCircle className="mr-2" />
                            {t('profilePage.profileComplete')}
                        </p>
                    )}
                </div>
            </Card>

            {/* Profile Information */}
            <Card>
                <div className="p-6">
                    {/* Header with Edit Button */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">{t('profilePage.profileInfo')}</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaEdit className="mr-2" />
                                {t('profilePage.editProfile')}
                            </button>
                        )}
                    </div>

                    {/* View Mode */}
                    {!isEditing && (
                        <div className="space-y-4">
                            {/* Name */}
                            <div className="flex items-start">
                                <FaUser className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t('profilePage.fullName')}</p>
                                    <p className="text-base text-gray-900">{profile.name || t('profilePage.notProvided')}</p>
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="flex items-start">
                                <FaUser className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t('profilePage.phoneNumber')}</p>
                                    <p className="text-base text-gray-900">{profile.phone_number || t('profilePage.notProvided')}</p>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500">{t('profilePage.location')}</p>
                                    <p className="text-base text-gray-900">{profile.location || profile.location_address || t('profilePage.notProvided')}</p>
                                    {(profile.district || profile.state) && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {[profile.district, profile.state].filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                    {(profile.location_lat && profile.location_lng) && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('profilePage.coordinates')}: {profile.location_lat}, {profile.location_lng}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Crops */}
                            <div className="flex items-start">
                                <FaSeedling className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t('profilePage.crops')}</p>
                                    {profile.crops && profile.crops.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {profile.crops.map((crop) => (
                                                <span
                                                    key={crop}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                                                >
                                                    {crop}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-base text-gray-900">{t('profilePage.notProvided')}</p>
                                    )}
                                </div>
                            </div>

                            {/* Land Size */}
                            <div className="flex items-start">
                                <FaRulerCombined className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t('profilePage.landSize')}</p>
                                    <p className="text-base text-gray-900">
                                        {profile.land_size ? `${profile.land_size} ${t('profilePage.acres')}` : t('profilePage.notProvided')}
                                    </p>
                                </div>
                            </div>

                            {/* Language */}
                            <div className="flex items-start">
                                <FaLanguage className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t('profilePage.preferredLanguage')}</p>
                                    <p className="text-base text-gray-900">
                                        {languages.find(lang => lang.value === profile.language)?.label || profile.language || t('profilePage.notProvided')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Mode */}
                    {isEditing && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('profilePage.fullName')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder={t('profilePage.enterFullName')}
                                        className={`appearance-none block w-full pl-10 pr-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'
                                            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                        {...register('name', {
                                            required: t('profilePage.nameRequired'),
                                            minLength: {
                                                value: 2,
                                                message: t('profilePage.nameMinLength')
                                            },
                                            maxLength: {
                                                value: 100,
                                                message: t('profilePage.nameMaxLength')
                                            }
                                        })}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Location Field */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('profilePage.location')} <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="location"
                                    control={control}
                                    rules={{
                                        required: t('profilePage.locationRequired'),
                                        minLength: {
                                            value: 2,
                                            message: t('profilePage.locationMinLength')
                                        }
                                    }}
                                    render={({ field }) => (
                                        <LocationAutocomplete
                                            value={field.value}
                                            onChange={field.onChange}
                                            onSelect={handleLocationSelect}
                                            placeholder={t('profilePage.searchLocation')}
                                            error={!!errors.location}
                                            errorMessage={errors.location?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* State Field */}
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('profilePage.state')}
                                </label>
                                <select
                                    id="state"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    {...register('state', {
                                        onChange: (e) => {
                                            const newState = e.target.value;
                                            setSelectedState(newState);
                                            setAvailableDistricts(getDistrictsByState(newState));
                                            // Clear district when state changes
                                            setValue('district', '');
                                        }
                                    })}
                                >
                                    <option value="">{t('profilePage.selectState')}</option>
                                    {indianStates.map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">{t('profilePage.autoFilled')}</p>
                            </div>

                            {/* District Field */}
                            <div>
                                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('profilePage.district')}
                                </label>
                                <select
                                    id="district"
                                    disabled={!selectedState}
                                    className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${!selectedState ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    {...register('district')}
                                >
                                    <option value="">
                                        {selectedState ? t('profilePage.selectDistrict') : t('profilePage.selectStateFirst')}
                                    </option>
                                    {availableDistricts.map((district) => (
                                        <option key={district} value={district}>
                                            {district}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">{t('profilePage.autoFilled')}</p>
                            </div>

                            {/* Crops Field */}
                            <div>
                                <label htmlFor="crops" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('profilePage.cropsLabel')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSeedling className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="crops"
                                        type="text"
                                        placeholder={t('profilePage.typeCropName')}
                                        value={cropInput}
                                        onChange={(e) => setCropInput(e.target.value)}
                                        onKeyPress={handleCropKeyPress}
                                        className={`appearance-none block w-full pl-10 pr-3 py-2 border ${errors.crops ? 'border-red-300' : 'border-gray-300'
                                            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    />
                                </div>

                                {/* Crop suggestions */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {commonCrops.map((crop) => (
                                        <button
                                            key={crop}
                                            type="button"
                                            onClick={() => addCrop(crop)}
                                            disabled={crops.includes(crop)}
                                            className={`px-3 py-1 text-xs rounded-full ${crops.includes(crop)
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                }`}
                                        >
                                            {crop}
                                        </button>
                                    ))}
                                </div>

                                {/* Selected crops */}
                                {crops.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {crops.map((crop) => (
                                            <span
                                                key={crop}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                                            >
                                                {crop}
                                                <button
                                                    type="button"
                                                    onClick={() => removeCrop(crop)}
                                                    className="ml-2 text-green-600 hover:text-green-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Hidden input for validation */}
                                <Controller
                                    name="crops"
                                    control={control}
                                    rules={{
                                        validate: (value) => value.length > 0 || t('profilePage.atLeastOneCrop')
                                    }}
                                    render={() => null}
                                />

                                {errors.crops && (
                                    <p className="mt-1 text-sm text-red-600">{errors.crops.message}</p>
                                )}
                            </div>

                            {/* Land Size Field */}
                            <div>
                                <label htmlFor="land_size" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('profilePage.landSizeAcres')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaRulerCombined className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="land_size"
                                        type="number"
                                        step="0.01"
                                        placeholder={t('profilePage.enterLandSize')}
                                        className={`appearance-none block w-full pl-10 pr-3 py-2 border ${errors.land_size ? 'border-red-300' : 'border-gray-300'
                                            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                        {...register('land_size', {
                                            required: t('profilePage.landSizeRequired'),
                                            min: {
                                                value: 0.01,
                                                message: t('profilePage.landSizeMin')
                                            },
                                            max: {
                                                value: 10000,
                                                message: t('profilePage.landSizeMax')
                                            }
                                        })}
                                    />
                                </div>
                                {errors.land_size && (
                                    <p className="mt-1 text-sm text-red-600">{errors.land_size.message}</p>
                                )}
                            </div>

                            {/* Language Field */}
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('profilePage.preferredLang')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLanguage className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        id="language"
                                        className={`appearance-none block w-full pl-10 pr-3 py-2 border ${errors.language ? 'border-red-300' : 'border-gray-300'
                                            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                        {...register('language', {
                                            required: t('profilePage.langRequired')
                                        })}
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang.value} value={lang.value}>
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.language && (
                                    <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || isSubmitting || !isDirty}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading || isSubmitting ? (
                                        <Loader size={20} color="#ffffff" />
                                    ) : (
                                        <>
                                            <FaSave className="mr-2" />
                                            {t('profilePage.saveChanges')}
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={loading || isSubmitting}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaTimes className="mr-2" />
                                    {t('profilePage.cancel')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Card>
        </div>
    );
}
