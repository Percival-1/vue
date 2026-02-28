import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPhone, FaLock, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';

/**
 * Register Page Component
 * 
 * Provides user registration interface with:
 * - Phone number, password, and name fields
 * - Password strength indicator
 * - Password confirmation validation
 * - Form validation using React Hook Form
 * - Error handling and display
 * - Redirect to profile completion after signup
 * 
 * Requirements: 1.2, 1.5, 1.6, 1.9
 */
export default function Register() {
    const { t } = useTranslation();
    const { register: registerUser, loading, error, clearError, checkPasswordStrength } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(null);

    // React Hook Form setup
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        mode: 'onBlur',
        defaultValues: {
            phone_number: '',
            password: '',
            confirm_password: '',
            name: ''
        }
    });

    // Watch password field for strength indicator and confirmation validation
    const password = watch('password');
    const confirmPassword = watch('confirm_password');

    // Update password strength when password changes
    useEffect(() => {
        if (password) {
            const strength = checkPasswordStrength(password);
            setPasswordStrength(strength);
        } else {
            setPasswordStrength(null);
        }
    }, [password, checkPasswordStrength]);

    // Clear error when component unmounts
    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    /**
     * Handle form submission
     * Requirement 1.2: Create account via Backend_API
     * Requirement 1.9: Navigate to profile completion after signup
     */
    const onSubmit = async (data) => {
        // Remove confirm_password before sending to API
        const { confirm_password, ...userData } = data;

        const result = await registerUser(userData);

        if (!result.success) {
            // Error is already set in the auth hook
            console.error('Registration failed:', result.error);
        }
        // Redirect to profile completion is handled by the useAuth hook
    };

    /**
     * Get password strength color
     */
    const getStrengthColor = () => {
        if (!passwordStrength) return 'bg-gray-200';

        switch (passwordStrength.label) {
            case 'Strong':
                return 'bg-green-500';
            case 'Medium':
                return 'bg-yellow-500';
            case 'Weak':
                return 'bg-red-500';
            default:
                return 'bg-gray-200';
        }
    };

    /**
     * Get password strength width percentage
     */
    const getStrengthWidth = () => {
        if (!passwordStrength) return '0%';
        return `${(passwordStrength.strength / 5) * 100}%`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                {/* Header */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {t('registerPage.createAccount')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t('registerPage.signUpDesc')}
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Registration Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('registerPage.fullName')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder={t('registerPage.enterFullName')}
                                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    {...register('name', {
                                        minLength: {
                                            value: 2,
                                            message: t('registerPage.nameMinLength')
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

                        {/* Phone Number Field */}
                        <div>
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('registerPage.phoneNumber')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaPhone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="phone_number"
                                    type="tel"
                                    placeholder="+1234567890"
                                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${errors.phone_number ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    {...register('phone_number', {
                                        required: t('registerPage.phoneRequired'),
                                        pattern: {
                                            value: /^\+[1-9]\d{1,14}$/,
                                            message: t('registerPage.phoneFormat')
                                        }
                                    })}
                                />
                            </div>
                            {errors.phone_number && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                {t('loginPage.phoneFormatHint')}
                            </p>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('registerPage.password')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={t('registerPage.enterPassword')}
                                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    {...register('password', {
                                        required: t('registerPage.passwordRequired'),
                                        minLength: {
                                            value: 8,
                                            message: t('registerPage.passwordMinLength')
                                        },
                                        validate: {
                                            hasUpperCase: (value) => /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                                            hasLowerCase: (value) => /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
                                            hasNumber: (value) => /\d/.test(value) || 'Password must contain at least one number'
                                        }
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}

                            {/* Password Strength Indicator - Requirement 1.6 */}
                            {password && passwordStrength && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">{t('registerPage.passwordStrength')}</span>
                                        <span className={`text-xs font-medium ${passwordStrength.label === 'Strong' ? 'text-green-600' :
                                            passwordStrength.label === 'Medium' ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                                            style={{ width: getStrengthWidth() }}
                                        />
                                    </div>
                                    {passwordStrength.feedback && passwordStrength.feedback.length > 0 && (
                                        <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                                            {passwordStrength.feedback.slice(0, 3).map((tip, index) => (
                                                <li key={index}>{tip}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('registerPage.confirmPassword')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirm_password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    {...register('confirm_password', {
                                        required: t('registerPage.confirmPasswordRequired'),
                                        validate: (value) => value === password || t('registerPage.passwordsMustMatch')
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.confirm_password && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading || isSubmitting}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading || isSubmitting ? (
                                <Loader size={20} color="#ffffff" />
                            ) : (
                                t('registerPage.createAccount')
                            )}
                        </button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            {t('registerPage.alreadyHaveAccount')}{' '}
                            <Link
                                to="/login"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                {t('registerPage.signInHere')}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
